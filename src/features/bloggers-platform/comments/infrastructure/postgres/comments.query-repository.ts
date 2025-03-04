import { LikesRepository } from '../../../comments-likes/infrastructure/likes.repository';
import {
  DeletionStatus,
  LikeStatus,
} from '../../../../../core/utils/status-enam';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../api/output-dto/comment.view-dto';

@Injectable()
export class CommentsQueryRepositorySql {
  constructor(
    private readonly dataSource: DataSource,
    private readonly commentLikeRepository: LikesRepository,
  ) {
  }

  // async getCommentsByPostId(
  //   @Query() query: GetPostsQueryParams,
  //   postId: string,
  //   userId: string | null,
  // ): Promise<PaginatedViewDto<CommentViewDto[]>> {
  //   const filter = {
  //     postId,
  //     deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
  //   };
  //
  //   const comments = await this.CommentModel.find(filter)
  //     .sort({ [query.sortBy]: query.sortDirection })
  //     .skip(query.calculateSkip())
  //     .limit(query.pageSize);
  //
  //   const totalCount: number = await this.CommentModel.countDocuments(filter);
  //
  //   const items: any = await Promise.all(
  //     comments.map(async (comment: CommentDocument) => {
  //       if (!userId)
  //         return CommentViewDto.commentMapToView(comment, LikeStatus.None);
  //       const like: CommentLikeDocument | null =
  //         await this.commentLikeRepository.findLikeByCommentAndUser(
  //           userId,
  //           comment.id.toString(),
  //         );
  //       if (!like)
  //         return CommentViewDto.commentMapToView(comment, LikeStatus.None);
  //       return CommentViewDto.commentMapToView(comment, like.status);
  //     }),
  //   );
  //
  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }

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
