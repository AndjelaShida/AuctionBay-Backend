import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { LessThan, Repository } from "typeorm";
import { CreateAuctionDto } from "./dto/create-auction.dto";
import { UpdateAuctionDto } from "./dto/update-auction.dto";
import { User } from "entities/user.entity";
import { CreateBidDto } from "bid/dto/create-bid.dto";
import { Role } from "entities/role.entity";
import { RoleEnum } from "role/role.enum";
import { AuctionQueryDto } from "./dto/auctionQuey.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EmailService } from "email/email.service";


@Injectable()
export class AuctionService {
    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,

        private readonly emailService: EmailService,
    ) {}

    //KREIRANJE AUKCIJE
    async create(
        createAuctionDto: CreateAuctionDto,
        currentUser: User,
    ): Promise<Auction> {
        const now = new Date();
        const hours = createAuctionDto.durationHours ?? 0;
        const minutes = createAuctionDto.durationMinutes ?? 0;

        if(hours === 0 && minutes === 0) {
            throw new BadRequestException('Auction duration must be greater then 0')
        }

        const endTime = new Date(now.getTime() + (hours * 60 + minutes) * 60 * 1000);

        const newAuction = this.auctionRepository.create({
            ...createAuctionDto,
           user: currentUser,
           currentPrice: createAuctionDto.startingPrice,
           endTime,
           isClosed: false,
        });
        return this.auctionRepository.save(newAuction);
    }


    // DOHVATANJE SVIH AUKCIJA
    async findAll(): Promise<Auction[]> {
        return this.auctionRepository.find();
    }

    // DOHVATANJE PO ID-ju
    async findOne(id: number): Promise<Auction | null> {
        const auction = await this.auctionRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!auction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
        return auction;
    }

    // AŽURIRANJE AUKCIJE
    async update(
        id: number, 
        updateAuctionDto: UpdateAuctionDto, 
        currentUser: User
    ): Promise<Auction> {
        const updatedAuction = await this.auctionRepository.findOne({ 
            where: { id },
            select: [ 'user'],
        });
        if (!updatedAuction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }

        //provera da li korisnik ima pravo da azurira aukciju
        if(!(currentUser.role.name === RoleEnum.ADMIN || updatedAuction.user.id === currentUser.id )) {
            throw new ForbiddenException('You are not authorized to update or delete this auction');
        }
       //azuriraj aukciju sa novim podacima
        Object.assign(updatedAuction, updateAuctionDto);
        return this.auctionRepository.save(updatedAuction);
    }

    // AŽURIRANJE SAMO SVOJIH AUKCIJA (me/auction/:id)
    async updateOwnAuction(
        id: number, 
        updateAuctionDto: UpdateAuctionDto, 
        currentUser: User
    ): Promise<Auction> {
        const auction = await this.auctionRepository.findOne({ 
            where: { id },
            relations: ['user']
        });

        if (!auction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
        if (auction.user.id !== currentUser.id) {
            throw new ForbiddenException('You can only update your own auctions');
        }
        Object.assign(auction, updateAuctionDto);
        return this.auctionRepository.save(auction);
    }

    // DODAVANJE AUKCIJE ZA TRENUTNOG KORISNIKA (me/auction)
    async createForUser(
        currentUser: User,
        updateAuctionDto: UpdateAuctionDto
    ): Promise<Auction> {
        const newAuction = this.auctionRepository.create({ ...updateAuctionDto, user: currentUser});
        return this.auctionRepository.save(newAuction);
       
    }

    // BIDDING NA AUKCIJU (/auction/:id/bid)
    async bidOnAuction(
        auctionId: number, 
        createBidDto: CreateBidDto,
        currentUser: User,
    ): Promise<Auction> {
        // Proveri da li aukcija postoji
        const auction = await this.auctionRepository.findOne({ 
            where: { id: auctionId }, 
            relations: ['user'],
        });

        //provera da li aukcije postoji
        if (!auction) {
            throw new NotFoundException('Auction is not found');
        }

        //provera da li korisnik biduje svoju aukciju
        if(auction.user.id === currentUser.id) {
            throw new ForbiddenException('You cannot bid on your own auction');
        }

        // Proveri da li je licitacija validna (da li je bid veći od trenutne cene)
        if (createBidDto.amount <= auction.currentPrice) {
            throw new BadRequestException('Bid must be higher than the current bid');
        }

        // Ažuriraj aukciju sa novim bidom
        auction.currentPrice = createBidDto.amount;
        auction.bidder = currentUser;
        await this.auctionRepository.save(auction);

        return auction ;
    }

    // BRISANJE AUKCIJE
    async remove(
        id: number, 
        currentUser: User
    ): Promise<void> {
        // Pronađi aukciju
        const auction = await this.auctionRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    
        if (!auction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
    
        // Provera da li je korisnik admin ili vlasnik aukcije
        if(!(currentUser.role.name == RoleEnum.ADMIN || auction.user.id == currentUser.id)) {
            throw new ForbiddenException('You are not authorized to delete this auction');
        }
    
        //brisanje aukcije ako je sve ok
        await this.auctionRepository.delete(id);
    }

    
    //FILTRIRANJE AUKCIJE
    async filterAuction(auctionQueryDto: AuctionQueryDto) {
        const query = this.auctionRepository.createQueryBuilder('auction');//pocetak pravljenja SQL upita za tabelu auction

        if(auctionQueryDto.name) {//proverava da li korisnik unosi vrednost za nema(ime aukcije),ako korisnik nije uneo ime, blok se nece izvrsiti
            query.andWhere('auction.name LIKE :name', {name:`%${auctionQueryDto.name}%`}); //auction.name-pozivamo polje name u tabeli auction
            //LIKE :name: Ovaj uslov kaže da treba da tražimo aukcije čije ime sadrži određeni tekst (koji je korisnik uneo). LIKE je operator koji omogućava pretragu sa wildcard-ovima.
        } 

        if(auctionQueryDto.startingPrice){
            query.andWhere('auction.startingPrice >= :startingPrice', { startingPrice: auctionQueryDto.startingPrice});
        }

        if(auctionQueryDto.currentPrice){
            query.andWhere('auction.currentPrice >= :currentPrice', { currentPrice: auctionQueryDto.currentPrice });
        }

        if(auctionQueryDto.userId){
            query.andWhere('auction.userId = :userId', { userId: auctionQueryDto.userId });
        }

        if(auctionQueryDto.bidderId){
            query.andWhere('auction.bidderId = :bidderId', { bidderId: auctionQueryDto.bidderId });
        }

        if(
            !auctionQueryDto.name &&
            !auctionQueryDto.startingPrice &&
            !auctionQueryDto.currentPrice &&
            !auctionQueryDto.userId &&
            !auctionQueryDto.bidderId
        ) {
            throw new BadRequestException('At least one filter must be provided');
        }
        return query.getMany();
    
    }

//PAGINATION AUCTION
async getAuctionPaginated(auctionQueryDto: AuctionQueryDto) {
    const { page = 1, limit = 10 } = auctionQueryDto;
    
    //Broj svih aukcija u bazi
    const totalAuctions: number = await this.auctionRepository.count();
    
    //Računanje broja stranica
    const pages = Math.ceil(totalAuctions / limit);

    //Dobijanje aukcija sa paginacijom
    const result = await this.auctionRepository
        .createQueryBuilder('auction')
        .skip((page - 1) * limit) // offset, određuje koji deo rezultata treba da se prikaže
        .take(limit) // limitira broj rezultata
        .getMany();

    return {
        data: result,
        total: totalAuctions,  
        pages,  
    };
}

//SEARCH AUCTION-pretrazivanje
async searchAuction(auctionQueryDto: AuctionQueryDto) {
    const query = this.auctionRepository.createQueryBuilder('auction');

    if(auctionQueryDto.name) {
        query.andWhere('auction.name LIKE :name', {name:`%${auctionQueryDto.name}%`});
    }

    if(auctionQueryDto.description) {
        query.andWhere('auction.description LIKE :description', {description:`%${auctionQueryDto.description}%`});
    }

    if(auctionQueryDto.startingPrice) {
        query.andWhere('auction.startingPrice >= :startingPrice', {startingPrice:auctionQueryDto.startingPrice});
    }

    return query.getMany();
}

//AUTOMATSKO ZATVARANJE AUKCIJE
@Cron(CronExpression.EVERY_30_SECONDS)
async closeExpiredAuction(){
    const currentDate = new Date();

    const expiredAuction = await this.auctionRepository.find({
        where: {
            endTime: LessThan(currentDate),
            isClosed: false,
        },
    });
    for(const auction of expiredAuction) {
        auction.isClosed = true ;

        //simuliramo slanje emaila korisniku cija aukcija je istekla
        this.emailService.sendEmail(
            auction.user.email,
            'The auction has expired.',
             `Your Auction "${auction.name}" has expired. Thank you for using our service.`

        )

        await this.auctionRepository.save(auction);
    }
}

    

}

    





