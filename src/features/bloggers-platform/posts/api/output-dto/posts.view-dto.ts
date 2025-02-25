import { PostDocument } from '../../domain/posts.entity';
import { NewestLikesDto } from '../../dto/newest-likes.dto';
import { LikeStatus } from '../../../../../core/utils/status-enam';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: Array<NewestLikesDto>;
  };

  static postMapToView(
    post: PostDocument,
    likeStatus: LikeStatus,
    newestLikes: NewestLikesDto[],
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      // likesCount: post.extendedLikesInfo.likesCount,
      // dislikesCount: post.extendedLikesInfo.dislikesCount,
      // myStatus: likeStatus,
      // newestLikes,
      // stub
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };

    return dto;
  }
}
