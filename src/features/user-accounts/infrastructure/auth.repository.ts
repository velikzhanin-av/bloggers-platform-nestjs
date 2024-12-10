import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/sessions.entity';
import { InjectModel } from '@nestjs/mongoose';

export class AuthRepository {
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
  ) {}

  async save(session: SessionDocument): Promise<void> {
    await session.save();
  }
}
