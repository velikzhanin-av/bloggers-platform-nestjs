import { CreateCommentServiceDto } from '../../dto/create-comment-service.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../../../user-accounts/domain/users.entity';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../domain/comments.entity';
import { UsersCommandRepository } from '../../../../user-accounts/infrastructure/postgresql/users-command.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CommentsService } from '../comments.service';
import { CommentViewDto } from '../../api/output-dto/comment.view-dto';

export class CreateCommentByPostIdCommand {
  constructor(public dto: CreateCommentServiceDto) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase implements ICommandHandler {
  constructor(
    private readonly UsersCommandRepository: UsersCommandRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsService: CommentsService,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async execute({
    dto,
  }: CreateCommentByPostIdCommand): Promise<CommentViewDto> {
    const user: UserDocument | null =
      await this.UsersCommandRepository.findOrNotFoundFail(dto.userId);
    const CreateCommentDto: CreateCommentDto = {
      content: dto.content,
      postId: dto.postId,
      commentatorInfo: {
        userId: dto.userId,
        userLogin: user!.login,
      },
    };

    const comment: CommentDocument =
      this.CommentModel.createInstance(CreateCommentDto);
    await this.commentsRepository.save(comment);

    return this.commentsService.getCommentById({
      commentId: comment._id.toString(),
      userId: dto.userId,
    });
  }
}
