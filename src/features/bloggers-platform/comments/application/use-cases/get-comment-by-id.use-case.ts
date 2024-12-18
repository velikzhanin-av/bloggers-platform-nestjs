import {GetCommentById} from "../../dto/get-comment-by-id";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CommentsRepository} from "../../infrastructure/comments.repository";
import {CommentDocument} from "../../domain/comments.entity";
import {LikeStatus} from "../../../../../core/utils/status-enam";
import {GetCommentByIdViewDto} from "../../api/output-dto/get-comment-by-id.view-dto";
import {LikesRepository} from "../../../likes/infrastructure/likes.repository";
import {LikeDocument} from "../../../likes/domain/likes.entity";

export class getCommentByIdCommand {
  constructor(public dto: GetCommentById) {}
}

@CommandHandler(getCommentByIdCommand)
export class GetCommentByIdUserCase implements ICommandHandler {
  constructor(private readonly commentsRepository: CommentsRepository,
              private readonly likesRepository: LikesRepository,) {}

  async execute({ dto }: getCommentByIdCommand ): Promise<GetCommentByIdViewDto> {
    const { commentId, userId } = dto;
    const comment: CommentDocument = await this.commentsRepository.findCommentById(commentId)

    let result: GetCommentByIdViewDto = this.mapToUserViewComment(comment, LikeStatus.None)

    if (!userId) return result

    const like: LikeDocument | null = await this.likesRepository.findLikeByCommentAndUser(commentId, userId)
    if (!like) return result

    result = this.mapToUserViewComment(comment, like.status)
    return result
  }

  mapToUserViewComment(comment: CommentDocument, likeStatus: LikeStatus ): GetCommentByIdViewDto { //
    return {
      id: comment._id?.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin
      },
      createdAt: comment.createdAt.toString(),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: likeStatus
      }
    }
  }

}