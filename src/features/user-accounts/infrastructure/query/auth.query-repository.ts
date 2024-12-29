import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersQueryRepository } from './users.query-repository';
import { UserMeViewDto } from '../../api/output-dto/users.view-dto';
import { UserDocument } from '../../domain/users.entity';
import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../../domain/sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ActiveSessionsViewDto } from '../../api/output-dto/active-sessions.view-dto';

@Injectable()
export class AuthQueryRepository {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
  ) {}

  async getUserInfo(userId: string): Promise<UserMeViewDto> {
    const user: UserDocument | null =
      await this.usersQueryRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return UserMeViewDto.mapToMeView(user);
  }

  async findSessionsByUserId(userId: string): Promise<ActiveSessionsViewDto[]> {
    const sessions: SessionDocument[] | [] = await this.SessionModel.find({
      userId,
    });
    return sessions.map((session: SessionDocument): ActiveSessionsViewDto => {
      return this.mapToViewSessions(session);
    });
  }

  mapToViewSessions(sessions: SessionDocument): ActiveSessionsViewDto {
    return {
      ip: sessions.ip,
      title: sessions.deviceName,
      lastActiveDate: sessions.iat,
      deviceId: sessions.deviceId,
    };
  }
}
