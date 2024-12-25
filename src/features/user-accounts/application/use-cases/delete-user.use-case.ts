import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../domain/users.entity';
import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersRepository) {}
  async execute(dto: DeleteUserCommand): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findOrNotFoundFail(dto.userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
