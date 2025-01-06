import { Injectable, Query } from '@nestjs/common';
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

  async findAllUsers(@Query() query: GetUsersQueryParams) {
    return await this.dataSource.query(
      `
          SELECT *
          FROM users
      `,
    );
  }

  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.dataSource.query(
      `SELECT *
                                  FROM users
                                  WHERE "userId" = $1 
                                    AND "deletionStatus" != $2`,
      [id, DeletionStatus.PermanentDeleted],
    );
    return user[0] ?? null;
  }

  async getByIdOrNotFoundFail(userId: string): Promise<UserViewDto | null> {
    const user: UserDocument | null = await this.findById(userId);
    if (!user) return null;

    return UserViewDto.mapToView(user);
  }
}
