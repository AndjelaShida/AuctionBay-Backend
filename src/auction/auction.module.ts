import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { Item } from "entities/item.entity";
import { User } from "entities/user.entity";
import { AuctionController } from "./auction.controller";
import { Role } from "entities/role.entity";
import { AutoBidEntity } from "bid/autoBid/autoBid.entity";
import { EmailModule } from "email/email.module";
import { AuctionCoreService } from "./auction-core.service";
import { AuctionBidService } from "./auction-bid.service";
import { AuctionQueryService } from "./auction-query.service";


@Module({
    imports:[TypeOrmModule.forFeature([Auction, User, Item, Bid, Role, AutoBidEntity ]),
    EmailModule
],
    controllers: [AuctionController],
    providers:[AuctionCoreService, AuctionBidService, AuctionQueryService],
    exports: [AuctionCoreService, AuctionBidService, AuctionQueryService]
})

export class AuctionModule {}