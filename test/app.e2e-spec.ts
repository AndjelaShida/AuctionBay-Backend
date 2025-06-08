import * as request from 'supertest'; //supertest je biblioteka za slanje http zahteva aplikaciji, koristi se za e2e testove
import { Test } from '@nestjs/testing'; //koristi se za pravljenje test instatnce moje app
import { INestApplication, ValidationPipe } from '@nestjs/common'; //tip za celu Nest aplikaciju/omogucava validaciju DTO-a kao u realnom radu
import { AppModule } from 'app.module'; //glavni modul, da bi se aplikacija "digla" za testiranje


describe('AuctionController (e2e)', () => {
  //grupise sve testove vezane za AuctionController
  let app: INestApplication; //promenljiva gde cuvamo instancu Nest aplikacije tokom testa

  beforeAll(async () => {
    //pre svih testova, moramo da podignemo aplikaciju u memoriji(kao kad pokrecemo server)
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile(); //ovde pravimo test modul i ubacujemo AppModule, jer on povezuje sve kontrolore, servise i rute

    app = moduleFixture.createNestApplication(); //inicijalizujemo app kao pravu Nest aplikaciju(ali lokalno, bez pokretanja http servera)
    app.useGlobalPipes(new ValidationPipe()); //ako koristimo validaciju DTO(npr @IsString itd), moras ukljuciti i ovde, inace test nece odbiti pogresan unos
    await app.init(); //sad se aplikacija "pali" u test razimu(spremna je da prima zahteve preko supertest)
});

    afterAll(async () => {
          await app.close();
        }); //posle svih testova, aplikaciju gasimo


    it('GET / auction - should return all auctions', async () => {
      //ovo je test za GET rutu, naslov testa govori sta ocekujemo da ruta vrati
      const res = await request(app.getHttpServer())
        .get('/auction')
        .expect(200); //saljemo get zahtev na /auction i ocekujemo status kod 200 OK

      expect(Array.isArray(res.body)).toBe(true); //proveravamo da li je res.body zapravo niz ([])-sto znaci da je backend vratio listu aukcija
    }) ;

      it('POST /auction - should vreate a new auction (mock user)', async () => {
        //sledeci test-provera POST-kreiranje nove aukcije
        const mockAuction = {
          title: 'Test auction',
          description: 'This is test auction',
          startingPrice: 100, //pravimo lazni objekat koji saljemo u telo zahteva
        };

        const token = 'MOCKED_JWT_TOKEN'; //ovde se koristi pravi JWT token

        const res = await request(app.getHttpServer())
          .post('/auction')
          .set('Authorization', `Bearer ${token}`)
          .send(mockAuction)
          .expect(201); //saljemo POST zahtev sa Authorization, headerom i telom i ocekujemo status 201 Created

        expect(res.body).toHaveProperty('id');
        expect(res.body.tiitle).toBe(mockAuction.title); // Proveravamo da odgovor sadrži id i da title odgovara onome što smo poslali.

      });
    });

