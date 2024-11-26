import {Injectable} from '@nestjs/common';
import {User, UserDocument, UserModelType} from '../../domain/users.entity';
import {InjectModel} from '@nestjs/mongoose';
import {Types} from "mongoose";

@Injectable()
export class UsersQueryRepository {
    constructor(
        @InjectModel(User.name)
        private UserModel: UserModelType,
    ) {
    }

    async findAllUsers() {
        const users = await this.UserModel.find({});
        return users;
    }

    async getByIdOrNotFoundFail(userId: string): Promise<any> {
        return await this.UserModel.findOne({_id: userId})
    }
}
