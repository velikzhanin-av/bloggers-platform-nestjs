import nodemailer from "nodemailer";
import {Injectable} from "@nestjs/common";
import {Config} from "../../../config/config";

@Injectable()
export class NotificationsAdapter {

  async sendEmail(login: string, email: string, confirmationCode: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "backendincubator@gmail.com",
        pass: Config.GMAIL_PASS,
      },
    })
    try {
      const result = transporter.sendMail({
        from: '"backend incubator" <backendincubator@gmail.com>', // sender address
        to: email,
        subject: `Hi ${login}!`,
        text: `Hi ${login}!`,
        html: " <h1>Thank for your registration</h1>\n" +
          " <p>To finish registration please follow the link below:\n" +
          `     <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>\n` +
          " </p>",
      })
      return (result)
    } catch (e) {
      console.error('Send email error', e)
      return
    }
  }

  async sendEmailRecoveryPassword(login: string, email: string, recoveryCode: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "backendincubator@gmail.com",
        pass: Config.GMAIL_PASS,
      },
    })
    try {
      const result = transporter.sendMail({
        from: '"backend incubator" <backendincubator@gmail.com>', // sender address
        to: email,
        subject: `Hi ${login}!`,
        text: `Hi ${login}!`,
        html: " <h1>Password recovery</h1>\n" +
          " <p>To finish password recovery please follow the link below:\n" +
          `     <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>\n` +
          " </p>",
      })
      return (result)
    } catch (e) {
      console.error('Send email error', e)
      return
    }
  }
}


