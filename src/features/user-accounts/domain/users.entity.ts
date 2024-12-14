import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { add } from 'date-fns';

export enum DeletionStatus {
  NotDeleted = 'not-deleted',
  PermanentDeleted = 'permanent-deleted',
}

@Schema({ _id: false })
export class EmailConfirmationType {
  @Prop({ type: String, required: false, default: '' })
  confirmationCode: string;

  @Prop({ type: String, required: false, default: '' })
  expirationDate: string;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean;
}

//флаг timestemp автоматичеки добавляет поля upDatedAt и createdAt
@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, required: true })
  email: string;

  //описываем явно поле createdAt несмотря на флаг timestamp: true
  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  @Prop({ type: EmailConfirmationType, required: true })
  emailConfirmation: EmailConfirmationType;

  static createInstance(dto: CreateUserDto): UserDocument {
    //userDocument!
    const user = new this(); //UserModel!
    user.email = dto.email;
    user.passwordHash = dto.password;
    user.login = dto.login;
    user.emailConfirmation = {
      confirmationCode: '',
      expirationDate: '',
      isConfirmed: false,
    };

    return user as UserDocument;
  }

  makeDeleted() {
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  setConfirmationCode(code: string) {
    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    }).toString();
  }

  confirmEmail(): void {
    this.emailConfirmation.isConfirmed = true;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
