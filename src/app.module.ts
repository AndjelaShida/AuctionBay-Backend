import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Auction } from "entities/auction.entity";
import { Bid } from "entities/bid.entity";
import { Item } from "entities/item.entity";
import { User } from "entities/user.entity";
import { Image } from "entities/image.entity";

import { ConfigModule, 
    ConfigService } from "@nestjs/config";
import { Role } from "entities/role.entity";
import { UserModule } from "user/user.module";
import { AuctionModule } from "auction/auction.module";
import { ItemModule } from "item/item.module";
import { BidModule } from "bid/bid.module";
import { ImageModule } from "images/image.module";
import { RoleModule } from "role/role.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard} from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true // Čini konfiguraciju globalnom za celu aplikaciju
        }),
        ScheduleModule.forRoot(),//za Cron, za automatsko zatvaranje aukcija
        ThrottlerModule.forRoot(<any>{//broj zahteva prema serveru u minuti (u 60sek se moze poslati max 10 zahteva)
           limit: 10,
           ttl: 60, //ttl-time to live,
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
                entities: [User, Auction, Bid, Item, Role, Image], // Definiše entitete
                synchronize: true, // Samo za razvoj! U produkciji postaviti na false
            }),
        }),
       UserModule,
       AuctionModule,
       ItemModule,
       BidModule,
       ImageModule,
       RoleModule, 
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard, //postavljanje ThrorrlerGuard globalno
        },
    ],

})
export class AppModule {}

    
