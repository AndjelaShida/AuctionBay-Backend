import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity { //
    @PrimaryGeneratedColumn('increment') //
    id:number ;

    @CreateDateColumn() //je specijalni dekorator koji automatski postavlja vrednost na trenutni datum i vreme kada se entitet kreira u bazi podataka. Ova kolona se koristi za praćenje kada je korisnik kreiran.
    createdAt: Date ;

    @UpdateDateColumn()
    updatedAt: Date ;
}