import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersQueryRepository } from './users.query-repository';
import {
  UserMeViewDto,
  UserViewDto,
} from '../../api/output-dto/users.view-dto';
import { UserDocument } from '../../domain/users.entity';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async getUserInfo(userId: string): Promise<UserMeViewDto> {
    const user: UserDocument | null =
      await this.usersQueryRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return UserMeViewDto.mapToMeView(user);
  }
}
