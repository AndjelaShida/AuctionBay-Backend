import {  Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EmailService } from "./email.service";
import { Auction } from "entities/auction.entity";
import { User } from "entities/user.entity";
import { Bid } from "entities/bid.entity";
import { AutoBidEntity } from "bid/autoBid/autoBid.entity";

@Module ({
    imports: [TypeOrmModule.forFeature([Auction, User, Bid, AutoBidEntity  ])
],
providers:[EmailService],
exports:[EmailService],

})
export class EmailModule {}