import { Injectable } from "@nestjs/common";
import { AuctionQueryDto } from "./dto/auctionQuery.dto";
import { Auction } from "entities/auction.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AuctionQueryService {
    constructor(
         @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,
    ) {}

    //FILTRIRANJE AUKCIJE-SEARCH AUKCIJE-FILTER AUKCIJE
        async getAuctions(auctionQueryDto: AuctionQueryDto) {
    
            const query = this.auctionRepository.createQueryBuilder('auction');//pocetak pravljenja SQL upita za tabelu auction
    //1.filtriranje i pretraga aukcije
            if(auctionQueryDto.name) {//proverava da li korisnik unosi vrednost za nema(ime aukcije),ako korisnik nije uneo ime, blok se nece izvrsiti
                query.andWhere('auction.name LIKE :name', {name:`%${auctionQueryDto.name}%`}); //auction.name-pozivamo polje name u tabeli auction
                //LIKE :name: Ovaj uslov kaže da treba da tražimo aukcije čije ime sadrži određeni tekst (koji je korisnik uneo). LIKE je operator koji omogućava pretragu sa wildcard-ovima.
            } 
    
            if(auctionQueryDto.description) {
                query.andWhere('auction.description LIKE :description', {description:`%${auctionQueryDto.description}%`});
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
    
            if(auctionQueryDto.startDate){
                query.andWhere('auction.startDate >= :startDate', { startDate: auctionQueryDto.startDate });
            }
    
            if(auctionQueryDto.endDate){
                query.andWhere('auction.endDate <= :endDate', { endDate: auctionQueryDto.endDate});
            }
    
    
       //2.paginacija
    
        const { page = 1, limit = 10 } = auctionQueryDto;
        query.skip((page - 1) * limit).take(limit);
        
        //Broj svih aukcija u bazi i selektovanje potrebnih polja
        const [auctions, totalAuctions] = await query
            .select([
            'auction.id',
            'auction.name',
            'auction.startingPrice',
            'auction.currentPrice',
            'auction.startDate',
            'auction.endDate'
        ])
        .leftJoinAndSelect('auction.bids', 'bid', 'bid.amount > :amount', {amount: 0})
        .getManyAndCount();
        
        //Računanje broja stranica
        const pages = Math.ceil(totalAuctions / limit);
        
        return {
            data: auctions,
            total: totalAuctions,  
            pages,  
        };
    }
}