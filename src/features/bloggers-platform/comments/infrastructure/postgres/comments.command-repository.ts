import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../domain/comments.entity';
import { DeletionStatus } from '../../../../../core/utils/status-enam';
import { DataSource } from 'typeorm';
import { CreatePostWithIdDto } from '../../../posts/dto/create-post.dto';
import { CreateCommentDto } from '../../dto/create-comment.dto';

@Injectable()
export class CommentsCommandRepositorySql {
  constructor(private readonly dataSource: DataSource) {}

  async createComment(dto: CreateCommentDto): Promise<string> {
    const commentId = await this.dataSource.query(
      `
          INSERT INTO comment(id, content, "postId", "userId")
          VALUES ($1, $2, $3, $4)
          RETURNING id;`,
      [dto.id, dto.content, dto.postId, dto.userId],
    );
    return commentId[0].id;
  }

  // async findCommentById(commentId: string): Promise<CommentDocument> {
  //   const comment: CommentDocument | null = await this.CommentModel.findOne({
  //     _id: commentId,
  //     deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
  //   });
  //   if (!comment)
  //     throw new NotFoundException(`Comment with id ${commentId} not found`);
  //   return comment;
  // }

  // const items: [] = await Promise.all(
  //   comments.map(async (comment: CommentDocument) => {
  //     const newestLikes: NewestLikesDto[] | undefined = await this.postsLikesQueryRepository.findNewestLikes(post._id!.toString())
  //     if (!userId) return PostViewDto.postMapToView(post, LikeStatus.None, newestLikes);
  //     const like: PostLikeDocument | null =
  //       await this.postsLikesRepository.findLikeByPostAndUser(
  //         post._id.toString(),
  //         userId,
  //       );
  //     if (!like) return PostViewDto.postMapToView(post, LikeStatus.None, newestLikes);
  //     return PostViewDto.postMapToView(post, like.status, newestLikes);
  //   }),
}
