import { CreateCommentServiceDto } from '../../dto/create-comment-service.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Comment, CommentModelType } from '../../domain/comments.entity';
import { UsersCommandRepository } from '../../../../user-accounts/infrastructure/postgresql/users-command.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CommentsService } from '../comments.service';
import { randomUUID } from 'crypto';
import { CommentsCommandRepositorySql } from '../../infrastructure/postgres/comments.command-repository';

export class CreateCommentByPostIdCommand {
  constructor(public dto: CreateCommentServiceDto) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase implements ICommandHandler {
  constructor(
    private readonly UsersCommandRepository: UsersCommandRepository,
    private readonly commentsCommandRepositorySql: CommentsCommandRepositorySql,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsService: CommentsService,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async execute({ dto }: CreateCommentByPostIdCommand): Promise<string> {
    // const user: UserDocument | null =
    //   await this.UsersCommandRepository.findOrNotFoundFail(dto.userId);
    const createCommentDto: CreateCommentDto = {
      id: randomUUID(),
      content: dto.content,
      postId: dto.postId,
      userId: dto.userId,
    };

    return this.commentsCommandRepositorySql.createComment(createCommentDto);
  }
}
