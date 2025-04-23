import { BidService } from "./bid.service"
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common"
import { CreateBidDto } from "./dto/create-bid.dto"
import { Bid } from "entities/bid.entity";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('bid')
@Controller('bid') 
@UseGuards(AuthGuard('jwt')) 
export class BidController {
    constructor (private readonly bidService: BidService) {}

    //Kreiranje nove ponude
    @Post()
    async create(@Body() createBidDto:CreateBidDto): Promise<Bid> {
        return this.bidService.create(createBidDto) ;
    }

    //Dohvatu sve podatke
    @Get()
    async findAll():Promise<Bid[]> { //[] moramo da stavimo jer dohvatamo SVE podatke, a svi podatci su niz
        return this.bidService.findALL();
    }

    //Dohvati jednu ponudu prema ID-ju
    @Get(':id')
    async findOne(@Param('id') id:number):Promise<Bid | null> {
        return this.bidService.findOne(id);
    } 

    //Brisanje ponude
    @Delete(':id')
    async remove(@Param('id') id:number): Promise<void> {
        await this.bidService.remove(id);
    }    
}

