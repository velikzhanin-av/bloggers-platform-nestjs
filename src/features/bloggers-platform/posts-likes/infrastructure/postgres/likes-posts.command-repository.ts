import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateLikeDto } from '../../dto/create-like.dto';
import { DeletionStatus } from '../../../../../core/utils/status-enam';

@Injectable()
export class LikesPostsCommandRepositorySql {
  constructor(private readonly dataSource: DataSource) {}

  async findLikeByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<any | null> {
    const like: Array<any> = await this.dataSource.query(
      `
        SELECT *
        FROM like_post
        WHERE "postId" = $1
          AND "userId" = $2
          AND "deletionStatus" != $3`,
      [postId, userId, DeletionStatus.PermanentDeleted],
    );
    return like[0] || null;
  }

  async createLike(like: CreateLikeDto): Promise<any> {
    return await this.dataSource.query(
      `
        INSERT INTO like_post (id, "postId", "userId", status)
        VALUES ($1, $2, $3, $4)
        RETURNING id;`,
      [like.id, like.postId, like.userId, like.status],
    );
  }

  async updateLike({ status, postId, userId }: CreateLikeDto): Promise<any> {
    return await this.dataSource.query(
      `
      UPDATE like_post
      SET status = $1
      WHERE "postId" = $2
        AND "userId" = $3
    `,
      [status, postId, userId],
    );
  }

  async findLikeOrDislikePost(postId: string, status: string): Promise<number> {
    const result = await this.dataSource.query(
      `
        SELECT COUNT(id)
        FROM like_post
        WHERE status = $1
          AND "postId" = $2
          AND "deletionStatus" != $3`,
      [status, postId, DeletionStatus.PermanentDeleted],
    );
    return parseInt(result[0].count, 10);
  }

}
