import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { Image } from 'entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('image')
@Controller('images')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post()
  async create(createImageDto: CreateImageDto): Promise<Image> {
    return this.imageService.createImage(
      createImageDto.filename,
      createImageDto.mimetype,
      createImageDto.path,
      createImageDto.userId,
      createImageDto.auction,
      createImageDto.item,
    );
  }

  @Get()
  async findAll(): Promise<Image[]> {
    return this.imageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Image | null> {
    return this.imageService.findOne(id);
  }

  @Get('auction/auctionId')
  async findImagesForAuction(
    @Param('auctionId') auctionId: number,
  ): Promise<Image[]> {
    // Pozivanje metode iz servisa za pronalaženje slika za dati aukcijski ID
    const images = await this.imageService.findImagesForAuction(auctionId);
    if (!images || images.length === 0) {
      throw new NotFoundException(
        `No image found for auction with auction id ${auctionId}`,
      );
    }
    return images;
  }

  @Get('item/itemId')
  async findImagesForItem(@Param('itemId') itemId: number): Promise<Image[]> {
    const images = await this.imageService.findImagesForItem(itemId);
    if (!images || images.length === 0) {
      throw new NotFoundException(
        `No image found for item with auction id ${itemId}`,
      );
    }
    return images;
  }

  @Delete(':id')
  async deleteImage(@Param('id') id: number): Promise<void> {
    await this.imageService.deleteImage(id);
  }
}
