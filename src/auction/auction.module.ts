import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { UserController } from "user/user.controller";
import { UserService } from "user/user.service";

@Module({
    imports:[TypeOrmModule.forFeature([Auction])],
    controllers: [UserController],
    providers:[UserService],
    exports: [UserService]
})

export class AuctionModule {}