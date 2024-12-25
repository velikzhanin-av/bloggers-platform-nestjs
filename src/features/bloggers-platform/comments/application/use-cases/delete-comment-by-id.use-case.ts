import { DeleteCommentDto } from '../../dto/delete-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../domain/comments.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException } from '@nestjs/common';

export class DeleteCommentByIdCommand {
  constructor(public dto: DeleteCommentDto) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByPostIdUseCase implements ICommandHandler {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({ dto }: DeleteCommentByIdCommand): Promise<void> {
    const comment: CommentDocument =
      await this.commentsRepository.findCommentById(dto.commentId);
    if (comment.commentatorInfo.userId !== dto.userId)
      throw new ForbiddenException();

    comment.makeDeleted();
    await this.commentsRepository.save(comment);
  }
}
