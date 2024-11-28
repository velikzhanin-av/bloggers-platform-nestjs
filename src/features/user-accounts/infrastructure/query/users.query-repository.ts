import {Injectable, Query} from '@nestjs/common';
import {User, UserDocument, UserModelType} from '../../domain/users.entity';
import {InjectModel} from '@nestjs/mongoose';
import {Types} from "mongoose";
import {GetUsersQueryParams} from "../../api/input-dto/get-users-query-params.input-dto";
import {UserViewDto} from "../../api/output-dto/users.view-dto";

@Injectable()
export class UsersQueryRepository {
    constructor(
        @InjectModel(User.name)
        private UserModel: UserModelType,
    ) {
    }

    async findAllUsers(@Query() query: GetUsersQueryParams): Promise<UserViewDto[]> {
        const users = await this.UserModel.find({});
        return users.map(user => { return UserViewDto.mapToView(user) });
    }

    async getByIdOrNotFoundFail(userId: string): Promise<any> {
        return this.UserModel.findOne({_id: userId})
    }
}
