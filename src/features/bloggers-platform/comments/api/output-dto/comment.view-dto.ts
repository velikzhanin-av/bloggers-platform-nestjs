import {LikeStatus} from "../../../../../core/utils/status-enam";
import {CommentDocument} from "../../domain/comments.entity";

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  }

  static commentMapToView(comment: CommentDocument, likeStatus: LikeStatus): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString(),
    dto.content = comment.content,
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    }
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: likeStatus,
      }
    return dto;
  }

}
