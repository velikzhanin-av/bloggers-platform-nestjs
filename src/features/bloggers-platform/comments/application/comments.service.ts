import { GetCommentById } from '../dto/get-comment-by-id';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { Comment, CommentDocument } from '../domain/comments.entity';
import { LikeStatus } from '../../../../core/utils/status-enam';
import { CommentViewDto } from '../api/output-dto/comment.view-dto';
import { Injectable, Query } from '@nestjs/common';
import { LikesRepository } from '../../comments-likes/infrastructure/likes.repository';
import { CommentLikeDocument } from '../../comments-likes/domain/comment-like.entity';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { Post } from '../../posts/domain/posts.entity';
import { CommentsCommandRepositorySql } from '../infrastructure/postgres/comments.command-repository';
import { LikesCommentCommandRepositorySql } from '../../comments-likes/infrastructure/postgres/likes.command-repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsCommandRepositorySql: CommentsCommandRepositorySql,
    private readonly likesRepository: LikesRepository,
    private readonly likesCommentCommandRepositorySql: LikesCommentCommandRepositorySql,
  ) {}

  async getCommentById(dto: GetCommentById): Promise<CommentViewDto> {
    const { commentId, userId } = dto;
    const comment: Array<any> =
      await this.commentsCommandRepositorySql.findCommentById(commentId);

    let result: CommentViewDto = this.mapToUserViewComment(
      comment[0],
      LikeStatus.None,
    );

    if (!userId) return result;

    const like: Array<any> =
      await this.likesCommentCommandRepositorySql.findLikeByCommentAndUser(
        userId,
        commentId,
      );
    if (!like.length) return result;

    result = this.mapToUserViewComment(comment, like[0].status);
    return result;
  }

  mapToUserViewComment(comment: any, likeStatus: LikeStatus): CommentViewDto {
    //
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: likeStatus,
      },
    };
  }
}
