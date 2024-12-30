import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongoose';

export class AuthRepository {
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
  ) {}

  async save(session: SessionDocument): Promise<void> {
    await session.save();
  }

  async findSessionByIatAndDeviceId(iat: number, deviceId: string) {
    return this.SessionModel.findOne({ iat: new Date(iat * 1000), deviceId });
  }

  async findSessionByUserId(userId: string): Promise<SessionDocument[] | null> {
    return this.SessionModel.find({ userId });
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ deviceId });
  }

  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const result: DeleteResult = await this.SessionModel.deleteOne({
      deviceId,
    });
    return result.deletedCount !== 0;
  }

  async findSessionByIat(iat: number): Promise<SessionDocument | null> {
    return await this.SessionModel.findOne({ iat: new Date(iat * 1000) });
  }

  async deleteSessions(
    deviceId: string,
    userId: string,
  ): Promise<DeleteResult> {
    return await this.SessionModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
  }
}
