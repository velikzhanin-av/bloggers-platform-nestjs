import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import {CreateBlogInputDto} from "../../blogs/api/input-dto/blogs.input-dto";
import {DeleteResult, UpdateResult} from "mongoose";
import {CreatePostInputDto} from "../api/input-dto/posts.input-dto";

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async updatePost(postId: string, body: CreatePostInputDto): Promise<boolean> {
    const result: UpdateResult = await this.PostModel.updateOne({_id: postId}, {
      $set: {
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId: body.blogId
      }
    })
    return result.modifiedCount !== 0;
  }

  async deleteBlog(postId: string): Promise<boolean> {
    const result: DeleteResult = await this.PostModel.deleteOne({
      _id: postId,
    });
    return result.deletedCount !== 0;
  }
}