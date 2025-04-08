import * as bycrypt from 'bcrypt';

export async function hashPassword(password:string):Promise<string>{
    const saltRound = 10 ; //Jacine eknripcije
    return bycrypt.hash(password, saltRound) ;

}

//Funkcija za proveru lozinke(da li se uneta lozinka slaze sa hashom)
export async function compareHash(password:string, hash: string): Promise<boolean> {
    return bycrypt.compare(password, hash)
}