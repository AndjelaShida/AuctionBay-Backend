import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Role {
    
    @PrimaryGeneratedColumn("uuid")
    id: string ;

    @Column()
    name: string ;

    @Column({ nullable: true})
    description : string ;

    @OneToMany(() => User, user => user.role)
    users: User [] ;
}