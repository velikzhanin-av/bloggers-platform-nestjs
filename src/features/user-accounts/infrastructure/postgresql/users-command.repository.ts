import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserDocument } from '../../domain/users.entity';
import { DeletionStatus } from '../../../../core/utils/status-enam';

@Injectable()
export class UsersCommandRepository {
  constructor(private readonly dataSource: DataSource) {}

  async createUser(user: any): Promise<object> {
    const newUser = await this.dataSource.query(
      `INSERT INTO users("userId", login, email, "passwordHash")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.userId, user.login, user.email, user.passwordHash], // Параметры передаются вторым аргументом
    );
    return newUser[0];
  }

  async findOrNotFoundFail(userId: string): Promise<UserDocument | null> {
    const user = await this.dataSource.query(
      `SELECT *
       FROM users
       WHERE "userId" = $1
         AND "deletionStatus" != $2`,
      [userId, DeletionStatus.PermanentDeleted],
    );
    return user[0] ?? null;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const user = await this.dataSource.query(
      `SELECT *
       FROM users
       WHERE (email = $1 OR login = $1)
         AND "deletionStatus" != $2`,
      [loginOrEmail, DeletionStatus.PermanentDeleted],
    );
    return user[0] ?? null;
  }

  // async addJwtToken(id: string, token: string) {
  //   const res: UpdateWriteOpResult = await this.UserModel.updateOne(
  //     { _id: id },
  //     { $set: { jwtToken: token } },
  //   );
  //   return res.modifiedCount;
  // }
  //
  // async addRefreshToken(id: string, token: string) {
  //   const res: UpdateWriteOpResult = await this.UserModel.updateOne(
  //     { _id: id },
  //     { $set: { refreshToken: token } },
  //   );
  //   return res.modifiedCount;
  // }

  // TODO спросить правильно ли так делать
  async doesExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<string | null> {
    const IsExistEmail = await this.dataSource.query(
      `
          SELECT email
          FROM users
          WHERE email = $1;`,
      [email],
    );
    if (IsExistEmail[0]) return 'email';

    const IsExistLogin = await this.dataSource.query(
      `
          SELECT login
          FROM users
          WHERE login = $1;`,
      [login],
    );
    if (IsExistLogin[0]) return 'login';

    return null;
  }

  async findUserByConfirmationCode(code: string) {
    const user = await this.dataSource.query(
      `SELECT *
       FROM users
       WHERE "emailConfirmationCode" = $1;`,
      [code],
    );
    return user[0] ?? null;
  }

  async findUserByEmail(email: string) {
    const user = await this.dataSource.query(
      `SELECT email
       FROM users
       WHERE email = $1;`,
      [email],
    );
    return user[0] ?? null;
  }

  async updateConfirmationCode(dto): Promise<void> {
    await this.dataSource.query(
      `UPDATE users
       SET "emailConfirmationCode" = $1, "emailExpirationDate" = $2
       where "userId" = $3;`,
      [dto.emailConfirmationCode, dto.emailExpirationDate, dto.userId],
    );
  }

  async updateIsConfirmed(userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users
       SET "isConfirmed" = true
       where "userId" = $1;`,
      [userId],
    );
  }

  async updateDeletionStatus(userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users
       SET "deletionStatus" = $2
       where "userId" = $1;`,
      [userId, DeletionStatus.PermanentDeleted],
    );
  }
}
