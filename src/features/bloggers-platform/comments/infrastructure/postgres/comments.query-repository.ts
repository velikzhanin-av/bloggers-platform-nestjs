import { LikesRepository } from '../../../comments-likes/infrastructure/likes.repository';
import {
  DeletionStatus,
  LikeStatus,
} from '../../../../../core/utils/status-enam';
import { DataSource } from 'typeorm';
import { Injectable, Query } from '@nestjs/common';
import { CommentViewDto } from '../../api/output-dto/comment.view-dto';
import { GetPostsQueryParams } from '../../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentDocument } from '../../domain/comments.entity';
import { CommentLikeDocument } from '../../../comments-likes/domain/comment-like.entity';

@Injectable()
export class CommentsQueryRepositorySql {
  constructor(
    private readonly dataSource: DataSource,
    // private readonly CommentModel: CommentModelType,
    private readonly commentLikeRepository: LikesRepository,
  ) {}

  // TODO hразобраться, падает при не пустых комментариях, при лимит и офсет не находит комменты
  async getCommentsByPostId(
    @Query() query: GetPostsQueryParams,
    postId: string,
    userId: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const comments: any[] = await this.dataSource.query(
      `
        SELECT *
        FROM comment as c
        WHERE c."deletionStatus" = $1
          AND c."postId" = $2
        LIMIT $3 OFFSET $4`,
      [
        DeletionStatus.PermanentDeleted,
        postId,
        query.pageNumber,
        query.pageSize,
      ],
    );

    const counts = await this.dataSource.query(
      `SELECT COUNT(*)
       FROM comment as c
       WHERE c."deletionStatus" != $1
         AND c."postId" = $2`,
      [DeletionStatus.PermanentDeleted, postId],
    );

    const totalCount: number = Number(counts[0].count);

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

  async getCommentById(commentId: string): Promise<any | null> {
    const comment = await this.dataSource.query(
      `SELECT c.id, c.content, c."postId", c."userId", c."createdAt", u.login as "userLogin"
       FROM comment c
              LEFT JOIN users u
                        ON c."userId" = u."userId"
       WHERE c."deletionStatus" != $1
         AND c.id = $2`,
      [DeletionStatus.PermanentDeleted, commentId],
    );
    if (!comment[0]) return null;

    const commentLikes = await this.dataSource.query(
      `SELECT *
       FROM "like" l
              LEFT JOIN users u
                        ON l."userId" = u."userId"
       WHERE l."deletionStatus" != $1
         AND l."likedEntityId" = $2`,
      [DeletionStatus.PermanentDeleted, commentId],
    );

    return CommentViewDto.commentMapToViewNew(comment[0], LikeStatus.None);
  }
}
