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

@Injectable()
export class CommentsQueryRepositorySql {
  constructor(
    private readonly dataSource: DataSource,
    // private readonly CommentModel: CommentModelType,
    private readonly commentLikeRepository: LikesRepository,
  ) {}

  async getCommentsByPostId(
    @Query() query: GetPostsQueryParams,
    postId: string,
    userId: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const comments: any[] = await this.dataSource.query(
      `
        SELECT 
          c.*,
          u.login AS "userLogin"
        FROM 
          comment AS c
        LEFT JOIN 
            users AS u ON c."userId" = u."userId"
        WHERE c."deletionStatus" != $1
          AND c."postId" = $2
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        LIMIT $3 OFFSET $4`,
      [
        DeletionStatus.PermanentDeleted,
        postId,
        query.pageSize,
        query.calculateSkip(),
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
        const like = await this.commentLikeRepository.findLikeByCommentAndUser(
          userId,
          comment.id,
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
       FROM like_comment l
              LEFT JOIN users u
                        ON l."userId" = u."userId"
       WHERE l."deletionStatus" != $1
         AND l."commentId" = $2`,
      [DeletionStatus.PermanentDeleted, commentId],
    );

    return CommentViewDto.commentMapToViewNew(comment[0], LikeStatus.None);
  }
}
