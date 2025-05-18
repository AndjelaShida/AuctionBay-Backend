//service je odgovoran za obradu podataka, komunikacijom sa bazom i implementacijom pravila aplikacije.
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'entities/item.entity';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}
  //KREIRANJE PREDMETA
  async create(itemData: CreateItemDto): Promise<Item> {
    const newItem = this.itemRepository.create(itemData);
    return await this.itemRepository.save(newItem);
  }
  //DOHVATANJE SVIH PREDMETA
  async findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  //DOHVATANJE PO ID-JU
  async findOne(id: number): Promise<Item | null> {
    return this.itemRepository.findOneBy({ id });
  }

  //AZURIRANJE PREDMETA
  async update(
    id: number,
    updateItemDto: UpdateItemDto,
    userId: any,
  ): Promise<Item> {
    //pronalazimo predmet po id-ju
    const item = await this.itemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item is not found');
    }
    //azuriramo pronadjeni predmet novim podacima
    Object.assign(item, updateItemDto);
    //Cuvamo azurirani predmet
    return await this.itemRepository.save(item);
  }

  //BRISANJE PREDMETA
  async remove(id: number): Promise<void> {
    const item = await this.itemRepository.findOne({ where: { id } }); //proveravam da li predmet sa tim id-jem postoji
    if (!item) {
      throw new NotFoundException(`Item whit ID ${id} not found`);
    }
    //brisanje predmeta iz baze
    await this.itemRepository.delete(id);
  }
}
