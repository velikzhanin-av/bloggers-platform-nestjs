import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeletionStatus, LikeStatus } from '../../../../core/utils/status-enam';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/output-dto/posts.view-dto';
import { PostDocument } from '../../posts/domain/posts.entity';
import { NewestLikesDto } from '../../posts/dto/newest-likes.dto';
import { PostLikeDocument } from '../../posts-likes/domain/post-like.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly CommentModel: CommentModelType,
  ) {}

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findCommentById(commentId: string): Promise<CommentDocument> {
    const comment: CommentDocument | null = await this.CommentModel.findOne({
      _id: commentId,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
    if (!comment)
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    return comment;
  }

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
