import {LikeStatus} from "../../../../core/utils/status-enam";

export class UpdateLikeStatusDto {
  commentId: string;
  userId: string;
  likeStatus: LikeStatus
}
