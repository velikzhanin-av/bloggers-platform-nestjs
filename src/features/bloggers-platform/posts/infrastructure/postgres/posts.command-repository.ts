import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePostDto, CreatePostWithIdDto } from '../../dto/create-post.dto';
import { DeletionStatus } from '../../../../../core/utils/status-enam';
import { NewestLikesDto } from '../../dto/newest-likes.dto';
import { PostLikeDocument } from '../../../posts-likes/domain/post-like.entity';

@Injectable()
export class PostsCommandRepositorySql {
  constructor(private readonly dataSource: DataSource) {}

  async createPost(dto: CreatePostWithIdDto): Promise<string> {
    const postId = await this.dataSource.query(
      `
          INSERT INTO posts(id, title, "shortDescription", content, "blogId", "blogName")
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id;`,
      [
        dto.id,
        dto.title,
        dto.shortDescription,
        dto.content,
        dto.blogId,
        dto.blogName,
      ],
    );
    return postId[0].id;
  }

  async findPostById(postId: string): Promise<any> {
    const post = await this.dataSource.query(
      `SELECT 
                p.*,
                l.status
       FROM posts AS p
              LEFT JOIN like_post AS l ON p.id = l."postId"
       WHERE p.id = $1
         AND p."deletionStatus" != $2`,
      [postId, DeletionStatus.PermanentDeleted],
    );
    return post[0] ?? null;
  }

  async findNewestLikes(postId: string): Promise<NewestLikesDto[]> {
    const posts = await this.dataSource.query(
      `
      SELECT l."createdAt", 
             u.login AS "userLogin",
             u."userId"
      FROM like_post AS l
      LEFT JOIN users AS u ON u."userId" = l."userId"
      WHERE l."postId" = $1 AND l.status = 'Like'
      ORDER BY l."createdAt" DESC
      LIMIT 3

    `,
      [postId],
    );

    return posts.map((like: PostLikeDocument): NewestLikesDto => {
      return this.mapToOutputNewestLikes(like);
    });
  }

  mapToOutputNewestLikes(like): NewestLikesDto {
    return {
      addedAt: like.createdAt.toString(),
      userId: like.userId,
      login: like.userLogin,
    };
  }

  // async updatePost(postId: string, body: CreatePostInputDto): Promise<boolean> {
  //   const result: UpdateResult = await this.PostModel.updateOne(
  //     { _id: postId },
  //     {
  //       $set: {
  //         title: body.title,
  //         shortDescription: body.shortDescription,
  //         content: body.content,
  //         blogId: body.blogId,
  //       },
  //     },
  //   );
  //   return result.modifiedCount !== 0;
  // }
  //
  // async deleteBlog(postId: string): Promise<boolean> {
  //   const result: DeleteResult = await this.PostModel.deleteOne({
  //     _id: postId,
  //   });
  //   return result.deletedCount !== 0;
  // }
  //
}
