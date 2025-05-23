//Kontroler je tu da obrađuje HTTP zahteve (GET, POST, DELETE, itd.).
//Svaka metoda unutar UserController treba da poziva odgovarajući metod iz AuctionService klase(putem Post, Get, Put itd ostalih metoda)
//koja je odgovorna za poslovnu logiku i rad sa bazom podataka.
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuctionQueryDto } from './dto/auctionQuery.dto';
import { Bid } from 'entities/bid.entity';
import { AutoBidDto } from 'bid/autoBid/create-autoBid.dto';
import { AuctionCoreService } from './auction-core.service';
import { AuctionBidService } from './auction-bid.service';
import { AuctionQueryService } from './auction-query.service';

@ApiTags('auction')
@Controller('auction')
export class AuctionController {
  constructor(
    private readonly auctionCoreService: AuctionCoreService,
    private readonly auctionBidService: AuctionBidService,
    private readonly auctionQueryService: AuctionQueryService,
  ) {}

  //KREIRANJE AUKCIJE
  @Post()
  @UseGuards(AuthGuard('jwt')) 
  @ApiBearerAuth() //oznacava sa ruta koristi JWT auth
  @ApiOperation({ summary: 'Create a new auction'}) //opis operacije
  @ApiResponse({ status: 201, description: 'The auction has been successfully created', type: Auction})
  @ApiResponse({ status: 401, description:'Unthorized' })
  async create(
    @Body() createAuctionDto: CreateAuctionDto,
    @CurrentUser() user: User,
  ): Promise<Auction> {
    return this.auctionCoreService.create(createAuctionDto, user)
  }

  // DOHVATI SVE AUKCIJE
  @Get()
  async findAll(): Promise<Auction[]> {
    return this.auctionCoreService.findAll();
  }

  // DOHVATI PO ID-ju
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Auction | null> {
    return this.auctionCoreService.findOne(id);
  }

  // AŽURIRAJ AUKCIJU-role
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update auction' })
  @ApiResponse({ status: 200, description: 'Auction has been update successfully', type: Auction})
  @ApiResponse({ status: 401, description: 'Unauthorized '})
  @Roles(RoleEnum.SELLER)
  async update(
    @Param('id') id: number,
   @Body() updateAuctionDto: UpdateAuctionDto,
   @CurrentUser() currentUser:User
  ): Promise<Auction> {
    return this.auctionCoreService.update(id, updateAuctionDto, currentUser);
  }

  // AŽURIRANJE SAMO SVOJIH AUKCIJA (me/auction/:id)-role
  @Put('me/auction/:id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update just your own auction'})
  @ApiResponse({ status: 200, description: 'Your own auction has been update successfully'})
  @ApiResponse({ status: 401, description: 'Unauthorized '})
  @Roles(RoleEnum.SELLER)
  async updateOwnAuction(
    @Param('id') id: number,
    @Body() updateAuctionDto: UpdateAuctionDto,
    @CurrentUser() currentUser: User
  ): Promise<Auction> {

    return this.auctionCoreService.updateOwnAuction(id, updateAuctionDto, currentUser);
  }

  //DOHVATANJE SVIH BIDOVA PO AUKCIJI
  @Get(':id/bids')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bids for auction'})
  @ApiResponse({ status: 200, description:'Successfully get all bids'})
  @ApiResponse({ status: 401, description: 'Unauthorized'})
  async getBidsForAuction(
    @Param('id')
    auctionId: number
  ): Promise<Bid[]> {
    return this.auctionBidService.getBidsForAuction(auctionId)
  }


  // BIDDING NA AUKCIJU (/auction/:id/bid)-role
  @Post(':id/bid')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bidding on auction'})
  @ApiResponse({ status: 201, description: 'Bid successfully placed', type: Auction })
   @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(RoleEnum.SELLER, RoleEnum.BUYER, RoleEnum.ADMIN)
  async bidOnAuction(
    @Param('id') auctionId: number,
    @Body() bidData: CreateBidDto,
    @CurrentUser() currentUser: User,
  ): Promise<Auction> {
    return this.auctionBidService.bidOnAuction(auctionId, bidData, currentUser);
  }

  //PRODAVAC VIDI ISTORIJU PONUDA NA SVOJOJ AUKCIJI
  @Get('me/auction/:id/bid')
  @Roles(RoleEnum.SELLER)  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all history bid on your own auction'})
  @ApiResponse({ status: 200, description: 'Get all bids for your own auction', type: Auction })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBidsForOwnAuction(
    @Param('id') id: number,
    @CurrentUser() currentUser: User,
  ): Promise<Bid []> {
    return this.auctionCoreService.getBidsForOwnAuction(id,currentUser);
  }

  // BRISANJE AUKCIJE-role
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete auction by id(Admin only'})
  @ApiResponse({ status: 204, description:'Auction deleted successfully'})
  @ApiResponse({ status: 401, description: 'Unauthorized'})
  @ApiResponse({ status: 403, description: 'Forbidden'})
  @Roles(RoleEnum.ADMIN)
  @HttpCode(204)
  async remove(
    @Param('id') id: number,
  @CurrentUser() currentUser: User
): Promise<void> {
    await this.auctionCoreService.remove(id, currentUser);
  }

  //FILTRIRANJE AUKCIJE, PAGINATION AUCTION, SEARCH AUCTION
@Get('search-paginated-filter')
async getAuctions(
  @Query() auctionQueryDto: AuctionQueryDto
) {
  return this.auctionQueryService.getAuctions(auctionQueryDto);
}

//AUTOMATSKO BIDOVANJE-rucno
@Post('automaticBid')
async automaticBid(
  @Param('auctionId') auctionId: number,
  @CurrentUser() currentUser: User,
  @Body() createBidDto: CreateBidDto,
  
): Promise<Auction> {
  return this.auctionBidService.automaticBid(auctionId, currentUser, createBidDto)
}

//AUTOMATSKO BID-OVANJE-automatsko
@Post('autoBid/:auctionId')
async autoBid (
  @Body() autoBidDto: AutoBidDto,
  @CurrentUser() currentUser: User,
  @Param('auctionId') auctionId: number,
): Promise<Bid | null> {
  return this.auctionBidService.autoBid(auctionId, autoBidDto, currentUser)
}

//AUTOMATSKO ZATVARANJE AUKCIJE
 @Post('close-expired')
 async closeExpiredAuction() {
  return this.auctionCoreService.closeExpiredAuction()
 }


}





 
  




