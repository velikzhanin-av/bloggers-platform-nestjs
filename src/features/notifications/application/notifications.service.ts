import { Injectable } from '@nestjs/common';
import { NotificationsAdapter } from '../infrastructure/notifications.adapter';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsAdapter: NotificationsAdapter) {}

  sendEmail(login: string, email: string, confirmationCode: string) {
    this.notificationsAdapter.sendEmail(login, email, confirmationCode);
  }

  async sendEmailRecoveryPassword(
    login: string,
    email: string,
    recoveryCode: string,
  ) {
    const result = await this.notificationsAdapter.sendEmailRecoveryPassword(
      login,
      email,
      recoveryCode,
    );
    if (!result) {
      return;
    } else {
      return result.accepted;
    }
  }
}
