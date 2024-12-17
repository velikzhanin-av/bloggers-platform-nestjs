import { Injectable, NotFoundException, Query } from '@nestjs/common';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../domain/users.entity';
import { InjectModel } from '@nestjs/mongoose';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../api/output-dto/users.view-dto';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import {DeletionStatus} from "../../../../core/utils/status-enam";

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async findAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = {};

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users: UserDocument[] | null = await this.UserModel.find({
      ...filter,
      deletionStatus: DeletionStatus.NotDeleted,
    })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.UserModel.countDocuments(filter);

    const items: UserViewDto[] = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
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
