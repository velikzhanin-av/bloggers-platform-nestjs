import {CreateCommentServiceDto} from "../../dto/create-comment-service.dto";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UserDocument} from "../../../../user-accounts/domain/users.entity";
import {Comment, CommentDocument, CommentModelType} from "../../domain/comments.entity";
import {UsersRepository} from "../../../../user-accounts/infrastructure/users.repository";
import {CommentsRepository} from "../../infrastructure/comments.repository";
import {InjectModel} from "@nestjs/mongoose";
import {CreateCommentDto} from "../../dto/create-comment.dto";

export class CreateCommentByPostIdCommand {
  constructor(public dto: CreateCommentServiceDto) {
  }
}

@CommandHandler(CreateCommentByPostIdCommand)
export class CreateCommentByPostIdUseCase implements ICommandHandler {
  constructor(private readonly usersRepository: UsersRepository,
              private readonly commentsRepository: CommentsRepository,
              @InjectModel(Comment.name)
              private CommentModel: CommentModelType,) {
  }

  async execute({ dto }: CreateCommentByPostIdCommand) {
    const user: UserDocument | null =
      await this.usersRepository.findOrNotFoundFail(dto.userId);
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
  }
}