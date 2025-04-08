//Kontroler je tu da obrađuje HTTP zahteve (GET, POST, DELETE, itd.).
////Svaka metoda unutar UserController treba da poziva odgovarajući metod iz UserService klase,
// koja je odgovorna za poslovnu logiku i rad sa bazom podataka.

import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { CreateItemDto } from "./dto/create-item.dto";
import { ItemService } from "./item.service";
import { Item } from "entities/item.entity";
import { UpdateItemDto } from "./dto/update-item.dto";
import { AuthGuard } from "@nestjs/passport";


@Controller('item')
export class ItemController {
    constructor(private readonly ItemService: ItemService) {}
    //kreiranje predmeta
    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createItemDto: CreateItemDto):Promise<Item> {
        return this.ItemService.create(createItemDto);
    }

    //dohvatanje svih predmeta
    @Get()
    async findAll(): Promise<Item[]> {
        return this.ItemService.findAll();
    }

    //dohvatanje po id-ju
    @Get(':id')
    async findOne(@Param('id') id:number): Promise<Item | null>  {
    return this.ItemService.findOne(id) ;
    }

    //azuriranje predmeta
    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(@Param('id') id:number, @Body() updateItemDto: UpdateItemDto, @Req() req ):Promise<Item> {
        const userId = req.user.id;
        return this.ItemService.update(id, updateItemDto, userId);
        
    }

    //brisanje predmeta
    @Delete()
    @UseGuards(AuthGuard('jwt'))
    async remove(@Param('id')id:number):Promise<void> {
        await this.ItemService.remove(id);
    }
}






