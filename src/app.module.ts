//app.module je glavni modul aplikacije, on povezuje sve druge delove aplikacije:kontrolore, servise i druge module
//Omogucava povezivanje sa bazom podataka preko ORM-a. npr sa TypeORMModule, Prisma itd
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { Item } from "entities/item.entity";
import { User } from "entities/user.entity";
import { AuctionService } from './auction/auction.service';
import { UserService } from './user/user.service';
import { BidService } from './bid/bid.service';
import { ItemService } from './item/item.service';
import { ConfigModule, ConfigService } from "@nestjs/config";


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal:true}),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject:[ConfigModule],
            useFactory:(configService: ConfigService) => ({
                type:'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('USER'),
                password: configService.get<string>('PASSWORD'),
                database: configService.get<string>('NAME'),
                entities:[User, Auction, Bid, Item], 
                synchronize: true, //samo za razvoj
            }),
        }),
        TypeOrmModule.forFeature([User, Auction, Bid, Item]),
    ],
    providers: 
    [
        AuctionService, 
     UserService, 
    BidService,
    ItemService,
],

})
 export class AppModule {}
    
