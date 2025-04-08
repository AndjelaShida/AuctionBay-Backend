import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ItemController } from "./item.controller";
import { ItemService } from "./item.service";
import { Item } from "entities/item.entity";

    @Module({
        imports: [TypeOrmModule.forFeature([Item])],
        providers: [ItemController], 
        exports: [ItemService],
        controllers: [ItemService],
    })
export class ItemModule {}