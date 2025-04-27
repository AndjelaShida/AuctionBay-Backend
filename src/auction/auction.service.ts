import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
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
import { Bid } from "entities/bid.entity";
import { AutoBidEntity } from "bid/autoBid/autoBid.entity";
import { AutoBidDto } from "bid/autoBid/create-autoBid.dto";


@Injectable()
export class AuctionService {
    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,

        @InjectRepository(Bid)
        private readonly bidRepository : Repository<Bid>,

        @InjectRepository(AutoBidEntity)
        private readonly autoBidRepository: Repository<AutoBidEntity>,

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

    // BIDDING NA AUKCIJU (/auction/:id/bid)-rucno
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

    //PRODAVAC VIDI ISTORIJU PONUDA NA SVOJOJ AUKCIJI(me/auction/:id/bid)
    async getBidsForOwnAuction(auctionId: number, currentUser: User):Promise<Bid []> {
        //trazim aukciju
        const auction = await this.auctionRepository.findOne({
            where: { id: auctionId },
            relations: ['user', 'bids', 'bids.user']
    }) 
    //ako aukcija ne postoji -bacam greksu
    if(!auction) {
        throw new NotFoundException(`Auction with ID ${auctionId} not found`);
    } 
    //provera da li je vlasnik aukcije isto kao current user
    if(auction.user.id !== currentUser.id) {
        throw new ForbiddenException('This is not your auction and you cant see bids on this auction.');

    }
    return auction.bids ;
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

//AUTOMATSKO BIDOVANJE-rucno
async automaticBid(
    auctionId: number,
    currentUser: User,
    createBidDto: CreateBidDto,
): Promise<Auction> {
    //trazim aukciju
    const auction = await this.auctionRepository.findOne({
        where: { id: auctionId},
        relations: ['bids']
    });
    //ako ne postoji aukcija sa tim id-jem, bacam gresku
    if(!auction) {
        throw new NotFoundException('Auction is not found')
    }
    //provera da li korisnik pokusava da licitira na svoju aukciju
    if(auction.user.id === currentUser.id) {
        throw new ForbiddenException('You cannot bid on your own auction')
    }
    //proveri da li je trenutni bid veci od trenutne cene
    if(createBidDto.amount <= auction.currentPrice) {
        throw new BadRequestException('Bid must be higher then the current bid')
    }


  //pravim novi objekat bid 
    const bid = new Bid();
    //setujem polja(popunjavam mu vrednosti)
    bid.amount = createBidDto.amount;
    bid.user = currentUser;
    bid.auction = auction;

     await this.bidRepository.save(bid);

     auction.currentPrice = bid.amount ;

     await this.auctionRepository.save(auction);

    
     return auction;
}

//AUTOMATSKO BID-OVANJE-automatsko
async autoBid(
    auctionId: number,//id aukcije na kojoj postavljam autoBid
     autoBidDto:  AutoBidDto,//objekat koji nosi max iznos koji korisnik zeli da ponudi
     currentUser : User,//trenutni korisnik koji zeli da biduje
    ): Promise<Bid | null> {// | -ili
        const auction = await this.auctionRepository.findOne({
            where: { id: auctionId},
            relations: ['bids',  'user']
        });
        if(!auction) {
            throw new NotFoundException('Auction not found or does not exist')
        }
        
        //pravimo novi bid za u+izabranu aukciju
        const autoBidForThisUser = await this.autoBidRepository.findOne({
            where: {
                user: currentUser,
                auction: auction,
            } 
        });
        //provera da li korisnik vec ima AutoBud za tu aukciju
            if(autoBidForThisUser) {
                throw new BadRequestException('You already have automatic bid on this auction')
            }

        //provera da korisnik nije vlasnik svoje aukcije
        if(auction.user.id === currentUser.id) {
            throw new UnauthorizedException('You cannot bid your own auction')
        }
       
        //dodeljujemo vrednosti
        const autoBid = new AutoBidEntity();
        autoBid.user = currentUser ;
        autoBid.auction = auction ;
        autoBid.maxAmount = autoBidDto.maxAmount;

        await this.autoBidRepository.save(autoBid);

        //proveravamo sve aktivne bidove vezane za tu aukciju
        const activeBid = await this.autoBidRepository.find({
            where: {auction: auction}
        });
        

        //izbacujemo autobidove, ciji je maxAmount manji od trenutne cene
        const validBid = activeBid.filter(autoBid => autoBid.maxAmount > auction.currentPrice) ;

        let lastCreatedBid : Bid | null = null;

        //iretiraj kroz sve validne autobudove
        for(const AutoBidEntity of validBid) {//Iteriramo kroz svaki pojedinačni automatski bid koji je prošao prethodnu filtraciju (validBid).
            let newBidAmount = auction.currentPrice + 1 ;

            //ako je novi bid presao maxAmount, postavi ga na maxAmount
            if(newBidAmount > autoBid.maxAmount) {
                newBidAmount = autoBid.maxAmount;
            }
            //ako je novi bid idalje manji od trenutne cene, preskoci ga
            if(newBidAmount <= auction.currentPrice) {
                continue;
            }

            //pravimo novi bid
            const bid = new Bid();
            bid.amount = newBidAmount;
            bid.user = autoBid.user ;
            bid.auction = auction ;

            await this.bidRepository.save(bid);

            //azuriraj cenu aukcije sa novim bidom
            auction.currentPrice = newBidAmount;
            auction.bidder = autoBid.user ; //postavi novog vlasnika aukcije
            await this.auctionRepository.save(auction);

            lastCreatedBid = bid ;
        }

        return lastCreatedBid;
    }

//AUTOMATSKO ZATVARANJE AUKCIJE+slanje emaila pobedniku i gubitniku
@Cron(CronExpression.EVERY_30_SECONDS)
async closeExpiredAuction(){
    const currentDate = new Date();

    const expiredAuctions = await this.auctionRepository.find({
        where: {
            endTime: LessThan(currentDate), //trazimo aukcije ciji je endTime manji od trenutnog vremena(sto znaci da su aukcije istekle)
            isClosed: false, //i isClosed:false, znaci da aukcija jos nije istekla, znaci trebamo je zatvoriti
        },
        relations: ['user', 'bids', 'bids.user'] //ovde se trazi da se ucitaju povezani podaci za user(vlasnika auckije),
        //bids8(ponude aukciji) i bids.user(korisnici koji su dali ponude)
    });

    for(const auction of expiredAuctions) {//for petlja iretira kroz sve aukcije koje su istekle i koje nisu zatvorene, za svaku aukciju se izvrsava kod unutar petlje
        auction.isClosed = true ; //zatvaramo aukciju tako sto posatavljamo na true.Ovo oznacava da je aukcija zatvorena.

        //simuliramo slanje emaila korisniku cija aukcija je istekla
        await this.safeSendEmail(
            auction.user.email, //email adresa vlasnika aukcije
            'The auction has expired.',//subject emaila
             `Your Auction "${auction.name}" has expired. Thank you for using our service.`//telo emaila
        );

        //nalazenje pobednicke ponude
        const winningBid = auction.bids.reduce((max: Bid | null, bid: Bid) => //Ovde koristimo metodu reduce() da pronadjemo pobednicku ponudu (ponudu sa najvećom vrednoscu).
            (bid.amount > (max?.amount ?? 0) ? bid : max), null);

            //saljemo email pobedniku
        if(winningBid) {
        await this.safeSendEmail(
            winningBid.user.email,
             `Congratulations! You won the auction "${auction.name}"`,
            `You have won the auction with your bid of ${winningBid.amount}.`
        );

        //pronalazimo sve gubitnike
        const losers = auction.bids
        .map(b => b.user)//pravimo niz korisnika koji su dali ponude na aukciji
        .filter(u => u.id !== winningBid.user.id);//filtriramo korisnike koji nisu pobedili(tako sto iskljucujemo korisnika koji je dao pobednicku ponudu)

        const uniqueLoser = Array.from(new Map(losers.map(u => [u.id, u])).values());//uklanjamo duplikate(ako postoje slucajno)
       
        await Promise.all(
            uniqueLoser.map((loser: User)  => this.safeSendEmail
                (loser.email, 
                `Auction result for "${auction.name}"`,
                `Thank you for your participation. Unfortunately, you did not win this auction.`))//slanje emaila paralelno svima(pobednicima i gubitnicima )
        );
    }

        await this.auctionRepository.save(auction);//cuvamo stanje aukcije
    } 
 }

//safeSendEmail funckija-funkcija za hvatanje gresaka kod slanja emaila pobedniku i gubitnicima
private async safeSendEmail(to:string, subject: string, message:string) {
    try{
        await this.emailService.sendEmail(to, subject, message);
    }catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw new Error('Email sendig failed')
    }
}
}


    





