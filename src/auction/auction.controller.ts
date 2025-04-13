// '//Kontroler je tu da obrađuje HTTP zahteve (GET, POST, DELETE, itd.).
// ////Svaka metoda unutar UserController treba da poziva odgovarajući metod iz AuctionService klase(putem Post, Get, Put itd ostalih metoda)
// // koja je odgovorna za poslovnu logiku i rad sa bazom podataka.
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { Auction } from 'entities/auction.entity';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateBidDto } from 'bid/dto/create-bid.dto';
import { CurrentUser } from 'decorators/current-user.decorator';
import { User } from 'entities/user.entity';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  // KREIRANJE AUKCIJE
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createAuctionDto: CreateAuctionDto): Promise<Auction> {
    return this.auctionService.create(createAuctionDto);
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
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: number,
   @Body() updateAuctionDto: UpdateAuctionDto,
   @CurrentUser() currentUser:User): Promise<Auction> {
    return this.auctionService.update(id, updateAuctionDto, currentUser);
  }

  // AŽURIRANJE SAMO SVOJIH AUKCIJA (me/auction/:id)-role
  @Put('me/auction/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateOwnAuction(
    @Req() req,
    @Param('id') id: number,
    @Body() updateAuctionDto: UpdateAuctionDto,
    @CurrentUser() currentUser: User
  ): Promise<Auction> {
    const userId = req.user.id ;
    return this.auctionService.updateOwnAuction(id, userId, updateAuctionDto, currentUser);
  }

  // DODAVANJE AUKCIJE ZA TRENUTNOG KORISNIKA (me/auction)
  @Post('me/auction') // Pretpostavljam da je POST, jer dodajemo novu aukciju
  @UseGuards(AuthGuard('jwt'))
  async addAuctionCurrentUser(
    @Req() req,
    @Body() updateAuctionDto: UpdateAuctionDto
  ): Promise<Auction> {
    return this.auctionService.createAuctionForCurrentUser(req.user.id, updateAuctionDto);
  }

  // BIDDING NA AUKCIJU (/auction/:id/bid)-role
  @Post(':id/bid')
  @UseGuards(AuthGuard('jwt'))
  async bidOnAuction(
    @Param('id') auctionId: number,
    @Body() bidData: CreateBidDto,
    @Req() req
  ): Promise<{ message: string; auction: Auction }> {
    return this.auctionService.bidOnAuction(auctionId, bidData, req.user);
  }

  // BRISANJE AUKCIJE-role
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  async remove(
    @Param('id') id: number,
  @CurrentUser() currentUser: User
): Promise<void> {
    await this.auctionService.remove(id, currentUser);
  }
}





 
  




