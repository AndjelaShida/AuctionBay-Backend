import { BaseEntity } from 'entities/base.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Auction } from './auction.entity';
import { User } from './user.entity';
import { Bid } from './bid.entity';
import { Image } from './image.entity';

@Entity()
export class Item extends BaseEntity {
    @Column()
    name: string ;

    @Column('text')
    description: string; 

    @Column()
    imageUrl: string ; //putanja do slike

    @Column('decimal')
    startingPrice: number ;

    @Column('int', {default:0})
    bidCount: number ; //broj ponuda za stavku

    @ManyToOne(() => User, (user) => user.items)
    @JoinColumn({ name : 'userId'})
    user: User;

    @ManyToMany(() => Auction, (auction) => auction.items)
    auction: Auction [] ;

    @OneToMany(() => Bid, (bid) => bid.item)
    bids: Bid[] ;

    @OneToMany(() => Image, (image) => image.item)
    images: Image [] ;

  
}