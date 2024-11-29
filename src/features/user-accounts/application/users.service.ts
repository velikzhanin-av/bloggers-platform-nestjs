import { UsersRepository } from '../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import {DeletionStatus, User, UserDocument, UserModelType} from '../domain/users.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import bcrypt from 'bcrypt';

export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const passwordHash: string = await bcrypt.hash(dto.password, 10);

    const user: UserDocument = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(userId: string): Promise<void> {
    const user: UserDocument = await this.usersRepository.findOrNotFoundFail(userId);

    user.makeDeleted()

    await this.usersRepository.save(user);
  }
}
