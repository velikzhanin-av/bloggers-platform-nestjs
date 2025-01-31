import { Injectable, NotFoundException } from '@nestjs/common';
import { UserMeViewDto } from '../../api/output-dto/users.view-dto';
import { UserDocument } from '../../domain/users.entity';
import { SessionDocument } from '../../domain/sessions.entity';
import { ActiveSessionsViewDto } from '../../api/output-dto/active-sessions.view-dto';
import { UsersQueryRepository } from '../postgresql/users.query-repository';
import { DataSource } from 'typeorm';
import { DeletionStatus } from '../../../../core/utils/status-enam';

@Injectable()
export class AuthQueryRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersQueryRepository: UsersQueryRepository,
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
    const sessions: SessionDocument[] | [] = await this.dataSource.query(
      `SELECT *
       FROM session
       WHERE "userId" = $1 AND "deletionStatus" != $2`,
      [userId, DeletionStatus.PermanentDeleted],
    );
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
