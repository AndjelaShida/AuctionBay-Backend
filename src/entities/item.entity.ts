import { BaseEntity } from 'entities/base.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { Auction } from './auction.entity';
import { User } from './user.entity';
import { Bid } from './bid.entity';
import { ImageEntity } from './image.entitiy';

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

    @OneToMany(() => User, (user) => user.items)
    user: User; 

    @ManyToMany(() => Auction, (auction) => auction.items)
    auction: Auction ;

    @OneToMany(() => Bid, (bid) => bid.item)
    bids: Bid[] ;

    @OneToMany(() => ImageEntity, (image) => image.item)
    image: ImageEntity [] ;

    
  
}