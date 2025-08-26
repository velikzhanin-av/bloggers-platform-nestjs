import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../domain/post-like.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesPostsCommandRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(like: PostLikeDocument): Promise<void> {
    await like.save();
  }

  async findLikeByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<any | null> {
    const like: Array<any> = await this.dataSource.query(
      `
        SELECT *
        FROM like_post
        WHERE "postId" = $1
          AND "userId" = $2`,
      [postId, userId],
    );
    return like[0] || null;
  }
}
