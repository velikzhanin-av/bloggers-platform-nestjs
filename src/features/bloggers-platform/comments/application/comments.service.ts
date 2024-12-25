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
import { Injectable } from '@nestjs/common';
import { CreateCommentServiceDto } from '../dto/create-comment-service.dto';
import { UserDocument } from '../../../user-accounts/domain/users.entity';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesRepository: LikesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async getCommentById(dto: GetCommentById): Promise<CommentViewDto> {
    const { commentId, userId } = dto;
    const comment: CommentDocument =
      await this.commentsRepository.findCommentById(commentId);

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

  mapToUserViewComment(
    comment: CommentDocument,
    likeStatus: LikeStatus,
  ): CommentViewDto {
    //
    return {
      id: comment._id?.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: likeStatus,
      },
    };

  ) {}

  async createCommentByPostId(dto: CreateCommentServiceDto) {
    const user: UserDocument | null =
      await this.usersRepository.findOrNotFoundFail(dto.userId);
    const CreateCommentDto: CreateCommentDto = {
      content: dto.content,
      postId: dto.postId,
      commentatorInfo: {
        userId: dto.userId,
        userLogin: user!.login,
      },
    };

    const comment: CommentDocument =
      this.CommentModel.createInstance(CreateCommentDto);
    await this.commentsRepository.save(comment);
  }
}
