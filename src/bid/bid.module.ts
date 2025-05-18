import { TypeOrmModule } from '@nestjs/typeorm';
import { BidService } from './bid.service';
import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { Bid } from 'entities/bid.entity';
import { User } from 'entities/user.entity';
import { Auction } from 'entities/auction.entity';
import { Item } from 'entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, User, Auction, Item])],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
