import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { Query } from '@nestjs/common';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { DeletionStatus, LikeStatus } from '../../../../core/utils/status-enam';
import { CommentViewDto } from '../api/output-dto/comment.view-dto';
import { CommentLikeDocument } from '../../comments-likes/domain/comment-like.entity';
import { LikesRepository } from '../../comments-likes/infrastructure/likes.repository';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly CommentModel: CommentModelType,
    private readonly commentLikeRepository: LikesRepository,
  ) {}

  async getCommentsByPostId(
    @Query() query: GetPostsQueryParams,
    postId: string,
    userId: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter = {
      postId,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    };

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.CommentModel.countDocuments(filter);

    const items: any = await Promise.all(
      comments.map(async (comment: CommentDocument) => {
        if (!userId)
          return CommentViewDto.commentMapToView(comment, LikeStatus.None);
        const like: CommentLikeDocument | null =
          await this.commentLikeRepository.findLikeByCommentAndUser(
            userId,
            comment.id.toString(),
          );
        if (!like)
          return CommentViewDto.commentMapToView(comment, LikeStatus.None);
        return CommentViewDto.commentMapToView(comment, like.status);
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
