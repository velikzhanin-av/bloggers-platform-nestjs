import {
  Body,
  Controller,
  Get, Post,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import {CreateUserDto} from "../dto/create-user.dto";
import {UsersRepository} from "../infrastructure/users.repository";
import {UsersService} from "../application/users.service";

@Controller('users')
export class UsersController {
  constructor(private usersQueryRepository: UsersQueryRepository,
              private usersService: UsersService,) {}

  @Get()
  async getAllUsers() {
    return this.usersQueryRepository.findAllUsers();
  }

  @Post()
  async postUser(@Body() body: CreateUserDto): Promise<void> {
    const userId: string = await this.usersService.createUser(body)

    return await this.usersQueryRepository.getByIdOrNotFoundFail(userId)
  }
}
