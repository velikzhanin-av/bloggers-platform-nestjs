import { UsersRepository } from '../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { NotFoundException } from '@nestjs/common';

export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  // async createUser(dto: CreateUserDto): Promise<string> {
  //
  // }

  async deleteUser(userId: string): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findOrNotFoundFail(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
