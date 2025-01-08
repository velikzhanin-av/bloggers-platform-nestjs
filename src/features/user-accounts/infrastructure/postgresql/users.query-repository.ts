import { Injectable, Query } from '@nestjs/common';
import { User, UserDocument, UserModelType } from '../../domain/users.entity';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../api/output-dto/users.view-dto';
import { DeletionStatus } from '../../../../core/utils/status-enam';
import { DataSource } from 'typeorm';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const skip: number = (query.pageNumber - 1) * query.pageSize;

    const users = await this.dataSource.query(
      `SELECT *
       FROM users
       WHERE "deletionStatus" != $1
         AND (login ILIKE '%' || $4 || '%' OR email ILIKE '%' || $5 || '%')
       ORDER BY "${query.sortBy}" ${query.sortDirection}
       LIMIT $3 OFFSET $2`,
      [
        DeletionStatus.PermanentDeleted,
        skip,
        // query.sortBy,
        query.pageSize,
        query.searchLoginTerm,
        query.searchEmailTerm,
        // query.sortDirection,
      ],
    );

    const counts = await this.dataSource.query(
      `SELECT COUNT(*)
       FROM users
       WHERE "deletionStatus" != $1
         AND (login ILIKE '%' || $2 || '%' OR email ILIKE '%' || $3 || '%')`,
      [
        DeletionStatus.PermanentDeleted,
        query.searchLoginTerm,
        query.searchEmailTerm,
      ],
    );

    const totalCount: number = Number(counts[0].count);

    const items: UserViewDto[] = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });

    //     const users: UserDocument[] | null = await this.UserModel.find({
    //       ...filter,
    //       deletionStatus: DeletionStatus.NotDeleted,
    //     })
    //       .sort({ [query.sortBy]: query.sortDirection })
    //       .skip(query.calculateSkip())
    //       .limit(query.pageSize);
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
