import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/users.entity';
import { UpdateWriteOpResult } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findOrNotFoundFail(userId: string): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.UserModel.findOne({
      _id: userId,
    });

    if (!user) return null;
    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async addJwtToken(id: string, token: string) {
    const res: UpdateWriteOpResult = await this.UserModel.updateOne(
      { _id: id },
      { $set: { jwtToken: token } },
    );
    return res.modifiedCount;
  }

  async addRefreshToken(id: string, token: string) {
    const res: UpdateWriteOpResult = await this.UserModel.updateOne(
      { _id: id },
      { $set: { refreshToken: token } },
    );
    return res.modifiedCount;
  }

  // TODO спросить правильно ли так делать
  async doesExistByLoginOrEmail(login: string, email: string): Promise<void> {
    if (await this.UserModel.findOne({ login })) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'login',
          },
        ],
      });
    }
    if (await this.UserModel.findOne({ email })) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'email',
          },
        ],
      });
    }
  }

  async findUserByConfirmationCode(code: string) {
    const user: UserDocument | null = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    if (!user)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'code',
          },
        ],
      });
    return user;
  }

  async findUserByEmail(email: string) {
    const user: UserDocument | null = await this.UserModel.findOne({ email });
    if (!user)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'string',
            field: 'email',
          },
        ],
      });
    return user;
  }
}
