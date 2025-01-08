import { UserDocument } from '../../domain/users.entity';
import { OmitType } from '@nestjs/mapped-types';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToView(user: any): UserViewDto {
    const dto = new UserViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user.userId;
    dto.createdAt = user.createdAt;

    return dto;
  }
}

export class UserMeViewDto extends OmitType(UserViewDto, ['createdAt']) {
  userId: string;

  static mapToMeView(user: UserDocument): UserMeViewDto {
    const dto = new UserMeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user.id;

    return dto;
  }
}
