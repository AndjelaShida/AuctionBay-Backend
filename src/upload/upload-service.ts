//upload file-a na AWS S3

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; //S3 klijent-klijent koji zna da komunicira sa bucketom na Amazonu/ PutObjectCommand-komada kojom saljem fajl na S3
import { randomUUID } from 'crypto'; //randomUUID pravi jedinstveni ID

@Injectable()
export class UploadService {
  //moze da se koristi kroz ceo Nestjs + deklarisemo 2 promenljive
  private s3: S3Client; //klijent koji ce slati fajlove na Amazon
  private bucket: string; // bucket je ime mesta gde se fajlovi cuvaju

  constructor(private readonly configService: ConfigService) {
    //configService koristimo da dohvatimo sve podatke iz .env
    // Uzimamo sve vrednosti iz .env fajla
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID'); //uzimamo vrednosti iz .env fajla, i ocekujemo string
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const region = this.configService.get<string>('AWS_REGION');
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    //ako je bilo koja vrednost prazna ili nije definisana-odmah bacamo gresku
    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      throw new Error('Missing AWS configuration values in .env file');
    }

    //pravimo konekciju sa AWS-om. S3Client koristi moje kredencijale i region da zna s kim prica
    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    //Sačuvamo ime bucketa u lokalnoj promenljivoj klase, da mozemo da koristimo lako kasnije
    this.bucket = bucket;
  }

  //Funkcija koje prima 1 fajl(npr sliku) i vraca link do te slike nakon sto se uploaduje
  async uploadPublicFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `${randomUUID()}-${file.originalname}`; //pravimo jedinstveno ime fajla da nema duplikata

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed!');
    }

    await this.s3.send(
      new PutObjectCommand({
        //saljemo PutObjectCommand sa sledecim info:
        Bucket: this.bucket, //gde saljemo
        Key: fileKey, //ime fajla
        Body: file.buffer, //sadrzaj fajla
        ContentType: file.mimetype, //tip fajla
        ACL: 'public-read', // čini fajl javnim
      }),
    );

    //Vraćamo URL fajla koji se sada nalazi u S3
    return `https://${this.bucket}.s3.amazonaws.com/${fileKey}`;
  }
}
