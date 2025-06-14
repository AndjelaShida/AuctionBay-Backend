import { validate } from "class-validator";
import { CreateAuctionDto } from "./create-auction.dto"


describe('CreateAuctionDto', () => {
    it('should validate a valid DTO', async () => {
        const dto = new CreateAuctionDto(); //kreiramo novi objekat koji koristi moju CreateAuctionDto klasu
        //postavljamo vrednosti(popunjavamo podatke u DTO objektu) ->
        dto.name = 'Auction Title';
        dto.description = 'Auction description';
        dto.startingPrice = 100 ;
        dto.durationHours = 1 ;
        dto.durationMinutes = 30 ;

        const errors = await validate(dto); //pozivam class-validator funkciju validate() koje proverava da li su sva polja DTO-a validna
        //ako sve prodje -> errors ce biti prazan niz, ako nesto ne prodje, error ce sadrzati informacije o greskama
        expect(errors.length).toBe(0);//test tvrdnja, koja kaze: ocekujem da errors bude prazan nis-znaci da je DTO validan
        //ako je errors.length === 0, test prolazi
        //eko errors.lenght !== 0, test pada
    });

    //ovaj test ocekuje da DTO bude navalidan i da prijavi greske za obavezna polja(name, description i startingPrice)
    it('should fail if required fields are missing', async() => {
        const dto = new CreateAuctionDto();

        const errors = await validate(dto);//pokrece validaciju DTO objekta,koji nema postavljene vrednosti
        expect(errors.length).toBeGreaterThan(0);//test ce pasti ako errors.length === 0, jer to znaci da je DTO prosao validaciju
        const  propertyNames = errors.map(err => err.property); //izvlaci imena svojstava
        expect(propertyNames).toContain('name'); //toContain-je matcher koji se koristi u testovima, da proveri da li niz sadrzi odredjenu vrednost
        expect(propertyNames).toContain('description');//ocekujem da propertyNames sadrzi name
        expect(propertyNames).toContain('startingPrice');
    });

    it('should fail if startingPrice is not a number', async() => {//test ce pasti ako pocetna cena nije br
        const dto = new CreateAuctionDto();
        dto.name = 'Valid name';
        dto.description = 'Valid desciption';
       (dto as any).startingPrice = 'not-a-number'; /// Cast to 'any' to test invalid type (TypeScript would normally block this)

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('startingPrice');
    }) ;

    it('should pass even if optional fields are missing', async() => {
        const dto = new CreateAuctionDto();
        dto.name = 'Auction';
        dto.description = 'Description';
        dto.startingPrice = 100 ;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
     
    });

    it('should fail if durationHours is not a number', async() => {
        const dto = new CreateAuctionDto();
        dto.name = 'Auction';
        dto.description = 'Desc';
        dto.startingPrice = 100 ;
        (dto as any).durationHours = 'wrong'; /// Cast to 'any' to test invalid type (TypeScript would normally block this)

        const errors = await validate(dto);
        const hoursError = errors.find((e) => e.property === 'durationHours');
        expect(hoursError).toBeDefined();
    });
});