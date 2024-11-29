import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findOrNotFoundFail(userId: string): Promise<UserDocument> {
    const user: UserDocument | null = await this.UserModel.findOne({
      _id: userId
    });

    if (!user) throw new NotFoundException('user not found');
    return user;
  }
}
