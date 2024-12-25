import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../domain/post-like.entity';
import { NewestLikesDto } from '../../posts/dto/newest-likes.dto';

@Injectable()
export class PostsLikesQueryRepository {
  constructor(
    @InjectModel(PostLike.name)
    private readonly PostLikeModel: PostLikeModelType,
  ) {}

  async findNewestLikes(postId: string): Promise<NewestLikesDto[]> {
    const result: PostLikeDocument[] = await this.PostLikeModel.find({
      postId,
      status: 'Like',
    })
      .sort({ updatedAt: -1 })
      .limit(3);
    console.log(result);
    return result.map((like: PostLikeDocument): NewestLikesDto => {
      return this.mapToOutputNewestLikes(like);
    });
  }

  mapToOutputNewestLikes(like: PostLikeDocument): NewestLikesDto {
    return {
      addedAt: like.updatedAt.toString(),
      userId: like.userId,
      login: like.userLogin,
    };
  }

  async findLikeByCommentAndUser(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({ postId, userId });
  }
}
