import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CommentDocument} from "../../domain/comments.entity";
import {CommentsRepository} from "../../infrastructure/comments.repository";
import {ForbiddenException} from "@nestjs/common";
import {UpdateCommentDto} from "../../dto/update-comment.dto";

export class UpdateCommentByIdCommand {
  constructor(public dto: UpdateCommentDto) {
  }
}

@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByPostIdUseCase implements ICommandHandler {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({ dto }: UpdateCommentByIdCommand): Promise<void> {
    const comment: CommentDocument = await this.commentsRepository.findCommentById(dto.commentId)
    if (comment.commentatorInfo.userId !== dto.userId) throw new ForbiddenException()

    comment.updateContent(dto.content)
    await this.commentsRepository.save(comment);

  }
}