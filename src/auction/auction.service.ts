import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Repository } from "typeorm";
import { CreateAuctionDto } from "./dto/create-auction.dto";
import { UpdateAuctionDto } from "./dto/update-auction.dto";
import { User } from "entities/user.entity";
import { CreateBidDto } from "bid/dto/create-bid.dto";
import { Role } from "entities/role.entity";
import { RoleEnum } from "role/role.enum";


@Injectable()
export class AuctionService {
    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>
    ) {}

    //KREIRANJE AUKCIJE
    async create(
        createAuctionDto: CreateAuctionDto,
        currentUser: User,
    ): Promise<Auction> {
        const newAuction = this.auctionRepository.create({
            ...createAuctionDto,
           user: currentUser
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
    
}




