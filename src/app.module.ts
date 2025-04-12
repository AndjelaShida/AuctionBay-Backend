import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { Item } from "entities/item.entity";
import { User } from "entities/user.entity";
import { Image } from "entities/image.entitiy";
import { AuctionService } from './auction/auction.service';
import { UserService } from './user/user.service';
import { BidService } from './bid/bid.service';
import { ItemService } from './item/item.service';
import { ConfigModule, ConfigService } from "@nestjs/config";


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true // Čini konfiguraciju globalnom za celu aplikaciju
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService], // Injectuj ConfigService
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'), // Korišćenje vrednosti iz .env fajla
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [User, Auction, Bid, Item], // Definiše entitete
                synchronize: true, // Samo za razvoj! U produkciji postaviti na false
            }),
        }),
        TypeOrmModule.forFeature([User, Auction, Bid, Item, Image]),
    ],
    providers: [
        AuctionService, 
        UserService, 
        BidService,
        ItemService,
    ],
})
export class AppModule {}

    
