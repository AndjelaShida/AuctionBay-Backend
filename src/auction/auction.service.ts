import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Repository } from "typeorm";
import { CreateAuctionDto } from "./dto/create-auction.dto";
import { UpdateAuctionDto } from "./dto/update-auction.dto";
import { User } from "entities/user.entity";
import { CreateBidDto } from "bid/dto/create-bid.dto";
import { Role } from "entities/role.entity";


@Injectable()
export class AuctionService {
    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,
        private readonly userRepository: Repository<User>,
        private readonly RoleRepository: Repository<Role>,
    ) {}

    // KREIRANJE NOVE AUKCIJE
    async create(auctionData: CreateAuctionDto): Promise<Auction> {
        const newAuction = this.auctionRepository.create(auctionData);
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
            select: [ 'id', 'user'],
        });
        if (!updatedAuction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }

        //provera da li korisnik ima pravo da azurira aukciju
        if(currentUser.role.name !== 'ADMIN' && updatedAuction.user.id !== currentUser.id) {
            throw new ForbiddenException('You are not authorized to update this auction');
        }
       //azuriraj aukciju sa novim podacima
        Object.assign(updatedAuction, updateAuctionDto);
        return this.auctionRepository.save(updatedAuction);
    }

    // AŽURIRANJE SAMO SVOJIH AUKCIJA (me/auction/:id)
    async updateOwnAuction(
        id: number, 
        userId: number, 
        updateAuctionDto: UpdateAuctionDto, 
        currentUser: User
    ): Promise<Auction> {
        const auction = await this.auctionRepository.findOne({ 
            where: { id } 
        });

        if (!auction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
        if (auction.user.id !== userId) {
            throw new ForbiddenException('You can only update your own auctions');
        }
        Object.assign(auction, updateAuctionDto);
        return this.auctionRepository.save(auction);
    }

    // DODAVANJE AUKCIJE ZA TRENUTNOG KORISNIKA (me/auction)
    async createAuctionForCurrentUser(
        userId: number, 
        auctionData: UpdateAuctionDto
    ): Promise<Auction> {
       
        const user = await this.userRepository.findOne({ 
            where: { id: userId } 
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} is not found`);
        }
        const newAuction = this.auctionRepository.create({ ...auctionData, user: user });
        return this.auctionRepository.save(newAuction);
    }

    // BIDDING NA AUKCIJU (/auction/:id/bid)
    async bidOnAuction(
        auctionId: number, 
        bidData: CreateBidDto,
        user: User
    ): Promise<{ message: string; auction: Auction }> {
        // Proveri da li aukcija postoji
        const auction = await this.auctionRepository.findOne({ 
            where: { id: auctionId }, 
            relations: ['user'],
        });
        if (!auction) {
            throw new NotFoundException('Auction is not found');
        }

        // Proveri da li je licitacija validna (da li je bid veći od trenutne cene)
        if (bidData.amount <= auction.currentPrice) {
            throw new BadRequestException('Bid must be higher than the current bid');
        }

        if(auction.user.id === user.id) {
            throw new ForbiddenException('You cannot bid on your own auction');
        }

        // Ažuriraj aukciju sa novim bidom
        auction.currentPrice = bidData.amount;
        auction.bidder = user;

        await this.auctionRepository.save(auction);

        return { message: 'Bid placed successfully', auction };
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
        if (currentUser.role.name !== 'ADMIN' && auction.user.id !== currentUser.id) {
            throw new ForbiddenException('You are not authorized to delete this auction');
        }
    
        //brisanje aukcije ako je sve ok
        await this.auctionRepository.delete(id);
    }
    
}




