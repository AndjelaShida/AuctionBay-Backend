//Kontroler je tu da obrađuje HTTP zahteve (GET, POST, DELETE, itd.).
//Svaka metoda unutar UserController treba da poziva odgovarajući metod iz AuctionService klase(putem Post, Get, Put itd ostalih metoda)
//koja je odgovorna za poslovnu logiku i rad sa bazom podataka.
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { Auction } from 'entities/auction.entity';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateBidDto } from 'bid/dto/create-bid.dto';
import { CurrentUser } from 'decorators/current-user.decorator';
import { User } from 'entities/user.entity';
import { RoleEnum } from 'role/role.enum';
import { Roles } from 'role/role.decorator';
import { RoleGuard } from 'role/role.guard';
import { ApiTags } from '@nestjs/swagger';
import { AuctionQueryDto } from './dto/auctionQuey.dto';
import { Bid } from 'entities/bid.entity';
import { AutoBidDto } from 'bid/autoBid/create-autoBid.dto';


@ApiTags('auction')
@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  //KREIRANJE AUKCIJE
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createAuctionDto: CreateAuctionDto,
    @CurrentUser() user: User,
  ): Promise<Auction> {
    return this.auctionService.create(createAuctionDto, user)
  }

  // DOHVATI SVE AUKCIJE
  @Get()
  async findAll(): Promise<Auction[]> {
    return this.auctionService.findAll();
  }

  // DOHVATI PO ID-ju
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Auction | null> {
    return this.auctionService.findOne(id);
  }

  // AŽURIRAJ AUKCIJU-role
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(RoleEnum.SELLER)
  async update(
    @Param('id') id: number,
   @Body() updateAuctionDto: UpdateAuctionDto,
   @CurrentUser() currentUser:User
  ): Promise<Auction> {
    return this.auctionService.update(id, updateAuctionDto, currentUser);
  }

  // AŽURIRANJE SAMO SVOJIH AUKCIJA (me/auction/:id)-role
  @Put('me/auction/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(RoleEnum.SELLER)
  async updateOwnAuction(
    @Param('id') id: number,
    @Body() updateAuctionDto: UpdateAuctionDto,
    @CurrentUser() currentUser: User
  ): Promise<Auction> {

    return this.auctionService.updateOwnAuction(id, updateAuctionDto, currentUser);
  }


  // BIDDING NA AUKCIJU (/auction/:id/bid)-role
  @Post(':id/bid')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(RoleEnum.SELLER, RoleEnum.BUYER, RoleEnum.ADMIN)
  async bidOnAuction(
    @Param('id') auctionId: number,
    @Body() bidData: CreateBidDto,
    @CurrentUser() currentUser: User,
  ): Promise<Auction> {
    return this.auctionService.bidOnAuction(auctionId, bidData, currentUser);
  }

  //PRODAVAC VIDI ISTORIJU PONUDA NA SVOJOJ AUKCIJI
  @Get('me/auction/:id/bid')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  async getBidsForOwnAuction(
    @Param('id') id: number,
    @CurrentUser() currentUser: User,
  ): Promise<Bid []> {
    return this.auctionService.getBidsForOwnAuction(id,currentUser);
  }

  // BRISANJE AUKCIJE-role
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(RoleEnum.ADMIN)
  @HttpCode(204)
  async remove(
    @Param('id') id: number,
  @CurrentUser() currentUser: User
): Promise<void> {
    await this.auctionService.remove(id, currentUser);
  }

  //FILTRIRANJE AUKCIJE
  @Get()
  async filterAuction(@Query() auctionQueryDto: AuctionQueryDto) {
      return this.auctionService.filterAuction(auctionQueryDto);
    }

//PAGINATION AUCTION
  @Get()
  async getAuctionPaginated(@Query() auctionQueryDto: AuctionQueryDto) {
    return this.auctionService.getAuctionPaginated(auctionQueryDto);
  }

//SEARCH AUCTION-pretrazivanje
@Get()
async searchAuction(@Query() auctionQueryDto: AuctionQueryDto) {
  return this.auctionService.searchAuction(auctionQueryDto);
}

//AUTOMATSKO BIDOVANJE-rucno
@Post('automaticBid')
async automaticBid(
  @Param() auctionId: number,
  @CurrentUser() currentUser: User,
  @Body() createBidDto: CreateBidDto,
  
): Promise<Auction> {
  return this.auctionService.automaticBid(auctionId, currentUser, createBidDto)
}

//AUTOMATSKO BID-OVANJE-automatsko
@Post('autoBid')
async autoBid (
  @Body() autoBidDto: AutoBidDto,
  @CurrentUser() currentUser: User,
  @Param('auctionId') auctionId: number,
): Promise<Bid | null> {
  return this.auctionService.autoBid(auctionId, autoBidDto, currentUser)
}

//AUTOMATSKO ZATVARANJE AUKCIJE
 @Post('close-expired')
 async closeExpiredAuction() {
  return this.auctionService.closeExpiredAuction()
 }


}





 
  




