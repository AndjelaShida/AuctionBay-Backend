import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { Item } from "entities/item.entity";
import { User } from "entities/user.entity";
import { AuctionController } from "./auction.controller";
import { AuctionService } from "./auction.service";
import { Role } from "entities/role.entity";


@Module({
    imports:[TypeOrmModule.forFeature([Auction, User, Item, Bid, Role])
],
    controllers: [AuctionController],
    providers:[AuctionService],
    exports: [AuctionService]
})

export class AuctionModule {}