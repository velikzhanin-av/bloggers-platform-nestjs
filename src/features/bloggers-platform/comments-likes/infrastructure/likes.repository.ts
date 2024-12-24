import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../domain/comment-like.entity';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private readonly LikeModel: CommentLikeModelType,
  ) {}

  async save(like: CommentLikeDocument): Promise<void> {
    await like.save();
  }

  async findLikeByCommentAndUser(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeDocument | null> {
    return this.LikeModel.findOne({ userId, commentId });
  }
}
