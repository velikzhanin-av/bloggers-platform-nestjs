import { LikeStatus } from '../../../../../core/utils/status-enam';
import { IsEnum } from 'class-validator';

export class UpdateLikeStatusCommentDto {
  @IsEnum(LikeStatus, { message: 'Like, Dislike, None' })
  likeStatus: LikeStatus;
}
