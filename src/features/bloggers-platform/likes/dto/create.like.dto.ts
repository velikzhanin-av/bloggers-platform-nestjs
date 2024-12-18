import {LikeStatus} from "../../../../core/utils/status-enam";

export class CreateLikeDto{
  commentId: string
  userId: string
  userLogin: string
  status: LikeStatus;
}