import { Module } from "@nestjs/common";
import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { Auction } from "entities/auction.entity";
import { Item } from "entities/item.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Image, User, Auction, Item])
],
    controllers: [ImageController] ,
    providers: [ImageService],
    exports: [ImageService],
})

export class ImageModule {}