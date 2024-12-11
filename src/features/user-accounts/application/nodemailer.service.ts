import { Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { NodemailerAdapter } from "../infrastructure/adapters/nodemailer.adapter";

@Injectable()
export class NodemailerService {
  constructor(private readonly nodemailerAdapter: NodemailerAdapter) {}

  async sendEmail (login: string, email: string, confirmationCode: string){
    const result = await this.nodemailerAdapter.sendEmail(login, email, confirmationCode)
    if (!result) {
      return
    } else {
      return result.accepted
    }
  }

  async sendEmailRecoveryPassword (login: string, email: string, recoveryCode: string){
    const result = await this.nodemailerAdapter.sendEmailRecoveryPassword(login, email, recoveryCode)
    if (!result) {
      return
    } else {
      return result.accepted
    }

  }
}