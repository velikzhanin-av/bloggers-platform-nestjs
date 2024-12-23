import {GetCommentById} from "../dto/get-comment-by-id";
import {CommentsRepository} from "../infrastructure/comments.repository";
import {CommentDocument} from "../domain/comments.entity";
import {LikeStatus} from "../../../../core/utils/status-enam";
import {GetCommentByIdViewDto} from "../api/output-dto/get-comment-by-id.view-dto";
import {Injectable} from "@nestjs/common";
import {LikesRepository} from "../../comments-likes/infrastructure/likes.repository";
import {CommentLikeDocument} from "../../comments-likes/domain/comment-like.entity";

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository,
              private readonly likesRepository: LikesRepository,) {}

  async getCommentById(dto: GetCommentById ): Promise<GetCommentByIdViewDto> {
    const { commentId, userId } = dto;
    const comment: CommentDocument = await this.commentsRepository.findCommentById(commentId)

    let result: GetCommentByIdViewDto = this.mapToUserViewComment(comment, LikeStatus.None)

    if (!userId) return result

    const like: CommentLikeDocument | null = await this.likesRepository.findLikeByCommentAndUser(userId, commentId)
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
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: likeStatus
      }
    }
  }

}