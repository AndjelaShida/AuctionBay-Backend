// '//Kontroler je tu da obrađuje HTTP zahteve (GET, POST, DELETE, itd.).
// ////Svaka metoda unutar UserController treba da poziva odgovarajući metod iz AuctionService klase(putem Post, Get, Put itd ostalih metoda)
// // koja je odgovorna za poslovnu logiku i rad sa bazom podataka.
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { Auction } from 'entities/auction.entity';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuthGuard } from '@nestjs/passport';

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

  // AŽURIRAJ AUKCIJU
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: number, @Body() updateAuctionDto: UpdateAuctionDto): Promise<Auction> {
    return this.auctionService.update(id, updateAuctionDto);
  }

  // AŽURIRANJE SAMO SVOJIH AUKCIJA (me/auction/:id)
  @Put('me/auction/:id')
  @UseGuards(AuthGuard('jwt'))
  async updateOwnAuction(
    @Req() req,
    @Param('id') id: number,
    @Body() updateAuctionDto: UpdateAuctionDto
  ): Promise<Auction> {
    const userId = req.user.id ;
    return this.auctionService.updateOwnAuction(id, userId, updateAuctionDto);
  }

  // DODAVANJE AUKCIJE ZA TRENUTNOG KORISNIKA (me/auction)
  @Post('me/auction') // Pretpostavljam da je POST, jer dodajemo novu aukciju
  @UseGuards(AuthGuard('jwt'))
  async addAuctionCurrentUser(
    @Req() req,
    @Body() updateAuctionDto: UpdateAuctionDto
  ): Promise<Auction> {
    return this.auctionService.addAuctionCurrentUser(req.user.id, updateAuctionDto);
  }

  // BIDDING NA AUKCIJU (/auction/:id/bid)
  @Post(':id/bid')
  @UseGuards(AuthGuard('jwt'))
  async bidOnAuction(
    @Param('id') auctionId: number,
    @Body() bidData: any // Možete definisati DTO za bid, tip 'any' samo kao primer
  ): Promise<{ message: string; auction: Auction }> {
    return this.auctionService.bidOnAuction(auctionId, bidData);
  }

  // BRISANJE AUKCIJE
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: number): Promise<void> {
    await this.auctionService.remove(id);
  }
}





 
  




