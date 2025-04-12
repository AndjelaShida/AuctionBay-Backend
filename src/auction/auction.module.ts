import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { Item } from "entities/item.entity";
import { User } from "entities/user.entity";
import { UserController } from "user/user.controller";
import { UserService } from "user/user.service";

@Module({
    imports:[TypeOrmModule.forFeature([Auction, User, Item, Bid])
],
    controllers: [UserController],
    providers:[UserService],
    exports: [UserService]
})

export class AuctionModule {}