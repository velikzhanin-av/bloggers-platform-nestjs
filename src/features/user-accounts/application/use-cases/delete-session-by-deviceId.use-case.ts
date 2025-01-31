import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthCommandRepository } from '../../infrastructure/postgresql/auth.command-repository';

export class DeleteSessionByDeviceIdCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase implements ICommand {
  constructor(private readonly authCommandRepository: AuthCommandRepository) {}

  async execute(dto: DeleteSessionByDeviceIdCommand): Promise<void> {
    const { userId, deviceId } = dto;
    const session: object | null =
      await this.authCommandRepository.findSessionByDeviceId(deviceId);

    if (!session) throw new NotFoundException();
    // @ts-expect-error: fix after migrate typeorm
    if (session.userId !== userId) throw new ForbiddenException();

    await this.authCommandRepository.deleteSessionByDeviceId(deviceId);
  }
}
