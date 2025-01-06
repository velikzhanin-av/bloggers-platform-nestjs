import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UsersCommandRepository } from '../../infrastructure/postgresql/users-command.repository';
import { randomUUID } from 'crypto';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    private readonly usersCommandRepository: UsersCommandRepository,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const passwordHash: string = await bcrypt.hash(dto.password, 10);

    const user = {
      userId: randomUUID(),
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    };
    const newUser = await this.usersCommandRepository.createUser(user);

    return user.userId;
  }
}
