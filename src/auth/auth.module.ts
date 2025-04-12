import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "entities/user.entity";
import { AuthService } from "./auth.service";
import { UserService } from "user/user.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { Auction } from "entities/auction.entity";
import { Item } from "entities/item.entity";
import { Bid } from "entities/bid.entity";


@Module({
    imports:[
        ConfigModule,
        TypeOrmModule.forFeature([User, Auction, Item, Bid]), //pristup User entitetu
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory:(configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),//uzimamo tajni kljuc iz env fajla
                signOptions: {expiresIn: '1h'}  //token istice za 1h
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy, UserService],
    controllers:[AuthController],
    exports:[AuthService],

})

export class AuthModule {}