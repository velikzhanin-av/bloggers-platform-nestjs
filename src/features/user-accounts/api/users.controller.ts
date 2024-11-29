import {
  Body,
  Controller,
  Get, Post, Query,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import {CreateUserDto} from "../dto/create-user.dto";
import {UsersService} from "../application/users.service";
import {GetUsersQueryParams} from "./input-dto/get-users-query-params.input-dto";
import {UserViewDto} from "./output-dto/users.view-dto";
import {PaginatedViewDto} from "../../../core/dto/base.paginated.view-dto";

@Controller('users')
export class UsersController {
  constructor(private usersQueryRepository: UsersQueryRepository,
              private usersService: UsersService,) {}

  @Get()
  async getAllUsers(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.findAllUsers(query);
  }

  @Post()
  async postUser(@Body() body: CreateUserDto): Promise<UserViewDto | null> {
    const userId: string = await this.usersService.createUser(body)

    return await this.usersQueryRepository.getByIdOrNotFoundFail(userId)
  }

}
