import { LikeStatus } from '../../../../core/utils/status-enam';

export class CreateLikeDto {
  id?: string;
  postId: string;
  userId: string;
  status: LikeStatus;
}
