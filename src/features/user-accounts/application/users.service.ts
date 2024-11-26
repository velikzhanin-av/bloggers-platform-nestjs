import { UsersRepository } from '../infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import bcrypt from 'bcrypt';

export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user: UserDocument = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }
}
