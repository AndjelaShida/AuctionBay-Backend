//Kontroler je tu da obrađuje HTTP zahteve (GET, POST, DELETE, itd.).
////Svaka metoda unutar UserController treba da poziva odgovarajući metod iz UserService klase,
// koja je odgovorna za poslovnu logiku i rad sa bazom podataka.

import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { CreateItemDto } from "./dto/create-item.dto";
import { ItemService } from "./item.service";
import { Item } from "entities/item.entity";
import { UpdateItemDto } from "./dto/update-item.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('item')
@Controller('item')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}
    //kreiranje predmeta
    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createItemDto: CreateItemDto):Promise<Item> {
        return this.itemService.create(createItemDto);
    }

    //dohvatanje svih predmeta
    @Get()
    async findAll(): Promise<Item[]> {
        return this.itemService.findAll();
    }

    //dohvatanje po id-ju
    @Get(':id')
    async findOne(@Param('id') id:number): Promise<Item | null>  {
    return this.itemService.findOne(id) ;
    }

    //azuriranje predmeta
    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(@Param('id') id:number, @Body() updateItemDto: UpdateItemDto, @Req() req ):Promise<Item> {
        const userId = req.user.id;
        return this.itemService.update(id, updateItemDto, userId);
        
    }

    //brisanje predmeta
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async remove(@Param('id')id:number):Promise<void> {
        await this.itemService.remove(id);
    }
}






