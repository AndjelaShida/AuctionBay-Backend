import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ItemController } from "./item.controller";
import { ItemService } from "./item.service";
import { Item } from "entities/item.entity";
import { User } from "entities/user.entity";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";

    @Module({
        imports: [TypeOrmModule.forFeature([Item, User, Auction, Bid])
    ],
        providers: [ItemController], 
        exports: [ItemService],
        controllers: [ItemService],
    })
export class ItemModule {}