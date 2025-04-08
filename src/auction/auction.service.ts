import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Repository } from "typeorm";
import { CreateAuctionDto } from "./dto/create-auction.dto";
import { UpdateAuctionDto } from "./dto/update-auction.dto";

@Injectable()
export class AuctionService {
    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>
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
        const auction = await this.auctionRepository.findOneBy({ id });
        if (!auction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
        return auction;
    }

    // AŽURIRANJE AUKCIJE
    async update(id: number, updateAuctionDto: UpdateAuctionDto): Promise<Auction> {
        const updatedAuction = await this.auctionRepository.findOne({ where: { id } });
        if (!updatedAuction) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
        Object.assign(updatedAuction, updateAuctionDto);
        return this.auctionRepository.save(updatedAuction);
    }

    // AŽURIRANJE SAMO SVOJIH AUKCIJA (me/auction/:id)
    async updateOwnAuction(id: number, userId: number, updateAuctionDto: UpdateAuctionDto): Promise<Auction> {
        const auction = await this.auctionRepository.findOne({ where: { id } });

        if (!auction) {
            throw new ForbiddenException(`Auction with ID ${id} not found`);
        }
        if (auction.user.id !== userId) {
            throw new ForbiddenException('You can only update your own auctions');
        }
        Object.assign(auction, updateAuctionDto);
        return this.auctionRepository.save(auction);
    }

    // DODAVANJE AUKCIJE ZA TRENUTNOG KORISNIKA (me/auction)
    async addAuctionCurrentUser(userId: number, auctionData: CreateAuctionDto): Promise<Auction> {
        // Pretpostavljam da "user" nije aukcija, pa moraš da pozoveš UserRepository da bi našao korisnika.
        const user = await this.auctionRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User not found`);
        }
        const newAuction = this.auctionRepository.create({ ...auctionData, user: user });
        return this.auctionRepository.save(newAuction);
    }

    // BIDDING NA AUKCIJU (/auction/:id/bid)
    async bidOnAuction(auctionId: number, bidData: any): Promise<{ message: string; auction: Auction }> {
        // Proveri da li aukcija postoji
        const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
        if (!auction) {
            throw new NotFoundException('Auction is not found');
        }

        // Proveri da li je licitacija validna (da li je bid veći od trenutne cene)
        if (bidData.amount <= auction.currentPrice) {
            throw new BadRequestException('Bid must be higher than the current bid');
        }

        // Ažuriraj aukciju sa novim bidom
        auction.currentPrice = bidData.amount;
        auction.bidder = bidData.user;

        await this.auctionRepository.save(auction);

        return { message: 'Bid placed successfully', auction };
    }

    // BRISANJE AUKCIJE
    async remove(id: number): Promise<void> {
        const result = await this.auctionRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Auction with ID ${id} not found`);
        }
    }
}




