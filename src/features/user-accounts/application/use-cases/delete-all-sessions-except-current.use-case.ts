import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { AuthCommandRepository } from '../../infrastructure/postgresql/auth.command-repository';

export class DeleteAllSessionsExceptCurrentCommand implements ICommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllSessionsExceptCurrentCommand)
export class DeleteAllSessionsExceptCurrentUseCase implements ICommand {
  constructor(private readonly authCommandRepository: AuthCommandRepository) {}

  async execute(dto: DeleteAllSessionsExceptCurrentCommand): Promise<void> {
    const { userId, deviceId } = dto;
    await this.authCommandRepository.deleteSessions(deviceId, userId);
  }
}
