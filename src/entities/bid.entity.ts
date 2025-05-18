import { BaseEntity } from 'entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Auction } from './auction.entity';
import { User } from './user.entity';
import { Item } from './item.entity';

@Entity()
export class Bid extends BaseEntity {
  @Column('decimal')
  amount: number; //Iznos ponude

  @Column()
  userId: number;

  @Column()
  auctionId: number;

  @ManyToOne(() => User, (user) => user.bids)
  user: User;

  @ManyToOne(() => Auction, (auction) => auction.bids)
  auction: Auction;

  @ManyToOne(() => Item, (item) => item.bids)
  item: Item;
}
