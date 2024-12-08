import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AuthCreateSessionDto } from '../dto/auth-create-session.dto';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class Session {
  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Date, required: true })
  iat: Date;

  @Prop({ type: Date, required: true })
  exp: Date;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  static createInstance(dto: AuthCreateSessionDto): SessionDocument {
    const session = new this();
    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.iat = dto.iat;
    session.exp = dto.exp;
    session.ip = dto.ip;
    session.deviceName = dto.deviceName;

    return session as SessionDocument;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.loadClass(Session);

export type SessionDocument = HydratedDocument<Session>;

export type SessionModelType = Model<SessionDocument> & typeof Session;
