import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserModelType} from "../../domain/users.entity";

@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType) {}
  // TODO куда обращаться? UserModel or queryUserRepository
  async get

}