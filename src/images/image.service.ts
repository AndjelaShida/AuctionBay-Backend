import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction } from 'entities/auction.entity';
import { Repository } from 'typeorm';
import { Image } from 'entities/image.entity';
import { User } from 'entities/user.entity';
import { Item } from 'entities/item.entity';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
  ) {}

  async createImage(
    filename: string,
    path: string,
    mimetype: string,
    userId: number,
    auction?: Auction, // ?-znaci da je opciono, ako ne prosledim nista bice underfined
    item?: Item,
  ): Promise<Image> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id${userId} is not found`);
    }
    const newImage = this.imageRepository.create({
      filename,
      path,
      mimetype,
      user,
      auction,
      item,
    });
    return this.imageRepository.save(newImage);
  }

  async findAll(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async findOne(id: number): Promise<Image | null> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image whit id ${id} is not found`);
    }
    return image;
  }

  //prikazivanje svih slika koje pripadaju jednoj aukciji
  async findImagesForAuction(auctionId: number): Promise<Image[]> {
    const images = await this.imageRepository.find({
      where: { auction: { id: auctionId } },
      relations: ['auction', 'item'],
    });

    return images;
  }

  //prikazivanje svih slika koje pripadaju jednom item
  async findImagesForItem(itemId: number): Promise<Image[]> {
    const images = await this.imageRepository.find({
      where: { item: { id: itemId } },
      relations: ['auction', 'item'],
    });
    return images;
  }

  async deleteImage(imageId: number): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    await this.imageRepository.delete(imageId);
  }
}
