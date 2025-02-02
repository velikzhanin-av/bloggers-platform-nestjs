import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePostDto, CreatePostWithIdDto } from '../../dto/create-post.dto';
import { DeletionStatus } from '../../../../../core/utils/status-enam';

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
      `SELECT *
       FROM posts
       WHERE id = $1 AND "deletionStatus" != $2`,
      [postId, DeletionStatus.PermanentDeleted],
    );
    return post[0] ?? null;

    // const post: PostDocument | null = await this.PostModel.findOne({
    //   _id: postId,
    // });
    // if (!post) throw new NotFoundException(`Post with id ${postId} not found`);
    // return post;
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
