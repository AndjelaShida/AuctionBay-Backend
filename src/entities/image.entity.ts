import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Item } from "./item.entity";
import { Auction } from "./auction.entity";
import { User } from "./user.entity";

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number ;

    @Column()
    filename: string ;

    @Column()
    path: string ;

    @Column()
    mimetype: string;

//item
@ManyToOne(() => Item, (item) => item.images)
item: Item ;

//auction
@ManyToOne(() => Auction, (auction) => auction.images)
auction: Auction ;

//user
@ManyToOne(() => User, (user) => user.image)
user: User ;
    
}