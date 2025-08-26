import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../domain/comments.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException } from '@nestjs/common';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommentsCommandRepositorySql } from '../../infrastructure/postgres/comments.command-repository';

export class UpdateCommentByIdCommand {
  constructor(public dto: UpdateCommentDto) {}
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByPostIdUseCase implements ICommandHandler {
  constructor(
    private readonly commentsCommandRepositorySql: CommentsCommandRepositorySql,
  ) {}

  async execute({ dto }: UpdateCommentByIdCommand): Promise<void> {
    const comment: Array<any> =
      await this.commentsCommandRepositorySql.findCommentById(dto.commentId);
    if (comment.length && comment[0].userId !== dto.userId)
      throw new ForbiddenException();

    await this.commentsCommandRepositorySql.updateComment(
      dto.commentId,
      dto.content,
    );
  }
}
