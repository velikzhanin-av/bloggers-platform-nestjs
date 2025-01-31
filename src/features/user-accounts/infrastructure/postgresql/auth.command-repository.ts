import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DeletionStatus } from '../../../../core/utils/status-enam';

@Injectable()
export class AuthCommandRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findSessionByIatAndDeviceId(
    iat: number,
    deviceId: string,
  ): Promise<object | null> {
    const session = await this.dataSource.query(
      `SELECT *
       FROM session
       WHERE "deviceId" = $1
         AND iat = $2
         AND "deletionStatus" != $3`,
      [deviceId, new Date(iat * 1000), DeletionStatus.PermanentDeleted],
    );
    return session[0] ?? null;
  }

  async createSession(sessionDto: any): Promise<object> {
    const newSession = await this.dataSource.query(
      `INSERT INTO session(id, "deviceId", "userId", iat, exp, ip, "deviceName")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        sessionDto.id,
        sessionDto.deviceId,
        sessionDto.userId,
        sessionDto.iat,
        sessionDto.exp,
        sessionDto.ip,
        sessionDto.deviceName,
      ], // Параметры передаются вторым аргументом
    );
    return newSession[0];
  }

  async updateIat(sessionId: string, iat: Date): Promise<void> {
    await this.dataSource.query(
      `UPDATE session
       SET iat = $2
       where id = $1;`,
      [sessionId, iat],
    );
  }

  async findSessionByUserId(userId: string): Promise<object | null> {
    const session = await this.dataSource.query(
      `SELECT *
       FROM session
       WHERE "userId" = $1
         AND "deletionStatus" != $2`,
      [userId, DeletionStatus.PermanentDeleted],
    );
    return session[0] ?? null;
  }

  async findSessionByDeviceId(deviceId: string): Promise<object | null> {
    const session = await this.dataSource.query(
      `SELECT *
       FROM session
       WHERE "deviceId" = $1
         AND "deletionStatus" != $2`,
      [deviceId, DeletionStatus.PermanentDeleted],
    );
    return session[0] ?? null;
  }

  async deleteSessionByDeviceId(deviceId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE session
       SET "deletionStatus" = $2
       where "deviceId" = $1;`,
      [deviceId, DeletionStatus.PermanentDeleted],
    );
  }

  async findSessionByIat(iat: number): Promise<object | null> {
    const session = await this.dataSource.query(
      `SELECT *
       FROM session
       WHERE iat = $1
         AND "deletionStatus" != $2`,
      [new Date(iat * 1000), DeletionStatus.PermanentDeleted],
    );
    return session[0] ?? null;
  }

  async deleteSessions(deviceId: string, userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE session
       SET "deletionStatus" = $3
       where "userId" = $2
         AND "deviceId" != $1;`,
      [deviceId, userId, DeletionStatus.PermanentDeleted],
    );
  }
}
