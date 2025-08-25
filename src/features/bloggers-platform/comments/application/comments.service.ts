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

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsCommandRepositorySql: CommentsCommandRepositorySql,
    private readonly likesRepository: LikesRepository,
  ) {}

  async getCommentById(dto: GetCommentById): Promise<CommentViewDto> {
    const { commentId, userId } = dto;
    const comment: CommentDocument =
      await this.commentsCommandRepositorySql.findCommentById(commentId);

    let result: CommentViewDto = this.mapToUserViewComment(
      comment,
      LikeStatus.None,
    );

    if (!userId) return result;

    const like: CommentLikeDocument | null =
      await this.likesRepository.findLikeByCommentAndUser(userId, commentId);
    if (!like) return result;

    result = this.mapToUserViewComment(comment, like.status);
    return result;
  }

  mapToUserViewComment(comment: any, likeStatus: LikeStatus): CommentViewDto {
    //
    return {
      id: comment._id?.toString(),
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
