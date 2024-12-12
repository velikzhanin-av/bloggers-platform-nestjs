import {Injectable} from "@nestjs/common";
import {NotificationsAdapter} from "../infrastructure/notifications.adapter";

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsAdapter: NotificationsAdapter) {}

  async sendEmail (login: string, email: string, confirmationCode: string){
    const result = await this.notificationsAdapter.sendEmail(login, email, confirmationCode)
    if (!result) {
      return
    } else {
      return result.accepted
    }
  }

  async sendEmailRecoveryPassword (login: string, email: string, recoveryCode: string){
    const result = await this.notificationsAdapter.sendEmailRecoveryPassword(login, email, recoveryCode)
    if (!result) {
      return
    } else {
      return result.accepted
    }

  }
}