import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AutoBidEntity } from "bid/autoBid/autoBid.entity";
import { AutoBidDto } from "bid/autoBid/create-autoBid.dto";
import { CreateBidDto } from "bid/dto/create-bid.dto";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { User } from "entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuctionBidService {
    constructor(
        @InjectRepository(Bid)
        private readonly bidRepository: Repository<Bid>,

        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,

         @InjectRepository(AutoBidEntity)
        private readonly autoBidRepository: Repository<AutoBidEntity>,
    ) {}

    // BIDDING NA AUKCIJU (/auction/:id/bid)-rucno
        async bidOnAuction(
            auctionId: number, 
            createBidDto: CreateBidDto,
            currentUser: User,
        ): Promise<Auction> {
            // Proveri da li aukcija postoji
            const auction = await this.auctionRepository.findOne({ 
                where: { id: auctionId }, 
                relations: ['user', 'item'],
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
            //kreiraj novi bid
            const bid = this.bidRepository.create({
                amount: createBidDto.amount,
                user: currentUser,
                auction: auction,
                item: auction.items[0],
            });
            await this.bidRepository.save(bid);
    
            // Ažuriraj aukciju sa novim bidom
            auction.currentPrice = createBidDto.amount;
            auction.bidder = currentUser;
            await this.auctionRepository.save(auction);
    
            return auction ;
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
}