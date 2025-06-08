import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload-service';
import { BadRequestException } from '@nestjs/common';
import { extname } from 'path' ;


@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file', { //ogranicavam velicinu slike
    limits : { fileSize: 5 * 1024 * 1024 }, //5MB
  }))
  
  async uploadPublicFile(@UploadedFile() file: Express.Multer.File) {
    //validacije MIME tipa i ekstenzije
    const allowedMimeType = [ 'image/jpeg', 'image/png', 'image/webp'];
    const allowedExtension = [ '.jpeg', '.png', '.webp'];

    if(!allowedMimeType.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type'); 
    }

    const fileExt = extname(file.originalname).toLowerCase(); 
    //izvlaci ekstenziju iz imena fajla, normalizuje u mala slova i omogucava sigurnu validaciju eksntenzije

    if(!allowedExtension.includes(fileExt)) {
        throw new BadRequestException('Invalid file exntesion');
    }

    const url = await this.uploadService.uploadPublicFile(file);
    return { url } ;
  }

}
