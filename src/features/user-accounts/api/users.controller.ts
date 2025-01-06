import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from '../dto/create-user.dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UserViewDto } from './output-dto/users.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user.use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user.use-case';
import { UsersQueryRepository } from '../infrastructure/postgresql/users.query-repository';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.findAllUsers(query);
  }

  @Post()
  async postUser(@Body() body: CreateUserDto): Promise<UserViewDto> {
    const userId: string = await this.commandBus.execute<
      CreateUserCommand,
      string
    >(new CreateUserCommand(body));

    const user: UserViewDto | null =
      await this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id') id: string): Promise<void> {
    return await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
