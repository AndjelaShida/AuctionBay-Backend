import { TypeOrmModule } from "@nestjs/typeorm";
import { BidService } from "./bid.service";
import { Module } from "@nestjs/common";
import { BidController } from "./bid.controller";
import { Bid } from "entities/bid.entity";

@Module({
    imports: [ TypeOrmModule.forFeature([Bid])],
    controllers: [ BidController ] ,
    providers: [ BidService ],
    exports: [ BidService ]
})

export class BidModule {}