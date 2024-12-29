import { AuthRepository } from '../../infrastructure/auth.repository';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { SessionDocument } from '../../domain/sessions.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteSessionByDeviceIdCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase implements ICommand {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(dto: DeleteSessionByDeviceIdCommand): Promise<void> {
    const { userId, deviceId } = dto;
    const session: SessionDocument | null =
      await this.authRepository.findSessionByDeviceId(deviceId);

    if (!session) throw new NotFoundException();
    if (session.userId === userId) throw new ForbiddenException();

    await this.authRepository.deleteSessionByDeviceId(deviceId);
  }
}
