import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../domain/post-like.entity';

@Injectable()
export class PostsLikesRepository {
  constructor(
    @InjectModel(PostLike.name)
    private readonly PostLikeModel: PostLikeModelType,
  ) {}

  async save(like: PostLikeDocument): Promise<void> {
    await like.save();
  }

  async findLikeByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({ userId, postId });
  }
}
