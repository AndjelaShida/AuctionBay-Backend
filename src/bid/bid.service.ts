import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { User } from "entities/user.entity";
import { CreateBidDto } from "./dto/create-bid.dto";
import { Repository } from "typeorm";


@Injectable()
export class BidService {
    constructor(
        @InjectRepository(Bid)
        private readonly bidRepository: Repository<Bid>,

        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    //Kreiranje ponude
    async create (bidData: CreateBidDto): Promise<Bid> {
        const { amount, auctionId, userId} = bidData ;

          // Proveravamo da li aukcija postoji
          const auction = await this.auctionRepository.findOne({where: {id: auctionId}});
          if(!auction){
            throw new NotFoundException(`Auction with ID ${auctionId} not found`) ;
          }

          // Proveravamo da li korisnik postoji
          const user = await this.userRepository.findOne({where: {id: userId}}) ;
          if(!user) {
            throw new NotFoundException(`Auction whit ID ${auctionId} not found`);
          }

          // Kreiramo novu ponudu
          const newBid = this.bidRepository.create({amount, auction, user}) ;
          return  await this.bidRepository.save(newBid);
        }

           //  Dohvatanje svih ponuda
           async findALL(): Promise<Bid[]> {
            return this.bidRepository.find();
           }

           //  Dohvatanje jedne ponude
           async findOne(id:number):Promise<Bid | null>{
            return this.bidRepository.findOne({where: {id}});
           }

           //  Brisanje ponude
           async remove(id:number):Promise<void> {
            const bid = await this.bidRepository.findOne({where:{id}});
            if(!bid) {
                throw new NotFoundException(`Bid with ID ${id} not found`);
            }
            await this.bidRepository.delete(id);
            
           }

        
        }



    





