import { DeleteCommentDto } from '../../dto/delete-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsCommandRepositorySql } from '../../infrastructure/postgres/comments.command-repository';

export class DeleteCommentByIdCommand {
  constructor(public dto: DeleteCommentDto) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByPostIdUseCase implements ICommandHandler {
  constructor(
    private readonly commentsCommandRepositorySql: CommentsCommandRepositorySql,
  ) {}

  async execute({ dto }: DeleteCommentByIdCommand): Promise<void> {
    const comment: Array<any> =
      await this.commentsCommandRepositorySql.findCommentById(dto.commentId);
    if (comment.length && comment[0].userId !== dto.userId)
      throw new ForbiddenException();
    await this.commentsCommandRepositorySql.deleteComment(dto.commentId);
  }
}
