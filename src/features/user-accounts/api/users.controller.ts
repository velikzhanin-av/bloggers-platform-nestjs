import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../application/users.service';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UserViewDto } from './output-dto/users.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../bloggers-platform/blogs/api/output-dto/blogs.view-dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.findAllUsers(query);
  }

  @Post()
  async postUser(@Body() body: CreateUserDto): Promise<UserViewDto | null> {
    const userId: string = await this.usersService.createUser(body);

    return await this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  async deleteUserById(@Param('id') id: string): Promise<void> {
    return await this.usersService.deleteUser(id);
  }
}
