import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../../domain/users.entity';
import { InjectModel } from '@nestjs/mongoose';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../api/output-dto/users.view-dto';
import { DeletionStatus } from '../../../../core/utils/status-enam';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly dataSource: DataSource,
  ) {}

  async findAllUsers(
    @Query() query: GetUsersQueryParams,
  ) {
    return await this.dataSource.query<User[]>(
      `
        SELECT * FROM users
      `,
    );
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async getByIdOrNotFoundFail(userId: string): Promise<UserViewDto> {
    const user: UserDocument | null = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }
}
