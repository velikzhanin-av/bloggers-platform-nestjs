export class AuthCreateSessionDto {
  userId: string;
  deviceId: string;
  iat: Date;
  exp: Date;
  ip: string;
  deviceName: string;
}
