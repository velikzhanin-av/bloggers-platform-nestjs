import {LikeStatus} from "../../../../core/utils/status-enam";

export class CreateLikeDto{
  postId: string
  userId: string
  userLogin: string
  status: LikeStatus;
}