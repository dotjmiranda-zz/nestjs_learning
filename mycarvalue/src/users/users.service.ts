import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password: string) {
    const user = this.repo.create({
      email: email,
      password: password,
    });

    return this.repo.save(user);
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }

    return this.repo.findOne(id);
  }

  find(email: string): Promise<User[]> {
    return this.repo.find({ email });
  }

  async update(id: number, attrs: Partial<User>) {
    let user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, attrs);

    return this.repo.save(user);
  }

  async remove(id: number) {
    let user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    return this.repo.remove(user);
  }
}
