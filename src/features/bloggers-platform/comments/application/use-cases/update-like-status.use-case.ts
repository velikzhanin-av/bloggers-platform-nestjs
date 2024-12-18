import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CommentsRepository} from "../../infrastructure/comments.repository";
import {CommentDocument} from "../../domain/comments.entity";
import {LikesRepository} from "../../../likes/infrastructure/likes.repository";
import {Like, LikeDocument, LikeModelType} from "../../../likes/domain/likes.entity";
import {LikeStatus} from "../../../../../core/utils/status-enam";
import {CreateLikeDto} from "../../../likes/dto/create.like.dto";
import {UserDocument} from "../../../../user-accounts/domain/users.entity";
import {UsersRepository} from "../../../../user-accounts/infrastructure/users.repository";
import {InjectModel} from "@nestjs/mongoose";

export class UpdateLikeStatusCommand {
  constructor(public dto: { commentId: string, userId: string, likeStatus: LikeStatus}) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler {
  constructor(private readonly commentsRepository: CommentsRepository,
              private readonly likesRepository: LikesRepository,
              private readonly usersRepository: UsersRepository,
              @InjectModel(Like.name)
              private readonly LikeModel: LikeModelType,
              ) {}

  async execute({ dto }: UpdateLikeStatusCommand): Promise<void> {
    const {commentId, userId, likeStatus} = dto;
    const comment: CommentDocument = await this.commentsRepository.findCommentById(commentId)
    const user: UserDocument | null = await this.usersRepository.findOrNotFoundFail(userId)

    const findLike: LikeDocument | null = await this.likesRepository.findLikeByCommentAndUser(userId, commentId)
    if (!findLike) {
      if (likeStatus === LikeStatus.Like) comment.increaseLike()
      else if (likeStatus === LikeStatus.Dislike) comment.increaseDislike()
      await this.commentsRepository.save(comment)

      const newLike: CreateLikeDto = {
        commentId,
        userId,
        userLogin: user!.login,
        status: likeStatus
      }
      const createLike: LikeDocument = this.LikeModel.createInstance(newLike);
      await this.likesRepository.save(createLike);

      } else {
        if (findLike.status !== likeStatus) {
          switch (findLike.status) {

            case LikeStatus.Like:
              switch (likeStatus) {
                case LikeStatus.Dislike:
                  comment.decreaseLike()
                  comment.decreaseDislike()
                  break
                case LikeStatus.None:
                  comment.clearLikesCount()
                  comment.clearDislikesCount()
                  break
              }
              break

            case LikeStatus.Dislike:
              switch (likeStatus) {
                case LikeStatus.Like:
                  comment.decreaseDislike()
                  comment.increaseLike()
                  break
                case LikeStatus.None:
                  comment.clearLikesCount()
                  comment.clearDislikesCount()
                  break
              }
              break

            case LikeStatus.None:
              switch (likeStatus) {
                case LikeStatus.Like:
                  comment.increaseLike()
                  break
                case LikeStatus.Dislike:
                  comment.increaseDislike()
                  break
              }
              break
          }

          await this.commentsRepository.save(comment)

          findLike.updateLikeStatus(likeStatus)
          await this.likesRepository.save(findLike)
        }
      }
  }
}