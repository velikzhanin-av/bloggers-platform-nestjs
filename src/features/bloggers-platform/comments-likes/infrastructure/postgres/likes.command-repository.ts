import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesCommentCommandRepositorySql {
  constructor(private readonly dataSource: DataSource) {}

  async save(like): Promise<void> {
    await like.save();
  }

  async findLikeByCommentAndUser(
    userId: string,
    commentId: string,
  ): Promise<any | null> {
    return this.dataSource.query(
      `
        SELECT *
        FROM like_comment
        WHERE "commentId" = $1 AND "userId" = $2`,
      [commentId, userId],
    );
  }
}
