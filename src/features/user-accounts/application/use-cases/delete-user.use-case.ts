import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../domain/users.entity';
import { NotFoundException } from '@nestjs/common';
import { UsersCommandRepository } from '../../infrastructure/postgresql/users-command.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersCommandRepository: UsersCommandRepository) {}

  async execute(dto: DeleteUserCommand): Promise<void> {
    const user: any = await this.usersCommandRepository.findOrNotFoundFail(
      dto.userId,
    );
    if (!user) {
      throw new NotFoundException('user not found');
    }

    await this.usersCommandRepository.updateDeletionStatus(user.userId);
  }
}
