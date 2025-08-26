import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentDocument } from '../../domain/comments.entity';
import { DeletionStatus } from '../../../../../core/utils/status-enam';
import { DataSource } from 'typeorm';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CreateBlogInputDto } from '../../../blogs/api/input-dto/blogs.input-dto';

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

  async deleteComment(commentId: string): Promise<void> {
    await this.dataSource.query(
      `
          UPDATE comment
          SET "deletionStatus" = $2
          WHERE id = $1;`,
      [commentId, DeletionStatus.PermanentDeleted],
    );
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE comment
        SET content = $1
            WHERE id = $2
              AND "deletionStatus" != $3;`,
      [content, commentId, DeletionStatus.PermanentDeleted],
    );
  }

  async findCommentById(commentId: string): Promise<Array<any>> {
    const comment: Array<any> = await this.dataSource.query(
      `
        SELECT c.*,
               u.login as "userLogin",
               u."userId"
        FROM comment as c
               LEFT JOIN "users" as u ON c."userId" = u."userId"
        WHERE c."deletionStatus" != $1
          AND c.id = $2
      `,
      [DeletionStatus.PermanentDeleted, commentId],
    );

    if (!comment.length) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

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
