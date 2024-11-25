import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./domain/users.entity";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
})
export class UserAccountsModule {}
