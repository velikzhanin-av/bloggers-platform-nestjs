import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-user-from-request';
import { UserContext } from '../../../core/dto/user-context';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenAuthGuard } from '../../../core/guards/custom/refresh-token-auth.guard';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { DeleteSessionByDeviceIdCommand } from '../application/use-cases/delete-session-by-deviceId.use-case';
import { DeleteAllSessionsExceptCurrentCommand } from '../application/use-cases/delete-all-sessions-except-current.use-case';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authQueryRepository: AuthQueryRepository,
  ) {}

  @SkipThrottle()
  @Get()
  @UseGuards(RefreshTokenAuthGuard)
  async getDevices(@ExtractUserFromRequest() user: UserContext) {
    return await this.authQueryRepository.findSessionsByUserId(user.userId);
  }

  @SkipThrottle()
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenAuthGuard)
  async deleteDeviceById(
    @ExtractUserFromRequest() user: UserContext,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteSessionByDeviceIdCommand(user.userId, deviceId),
    );
  }

  @SkipThrottle()
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenAuthGuard)
  async deleteAllSessionsExceptCurrent(
    @ExtractUserFromRequest() user: UserContext,
  ) {
    await this.commandBus.execute(
      new DeleteAllSessionsExceptCurrentCommand(user.userId, user.deviceId),
    );
  }
}
