import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';

import { PostsRepository } from '../infrastructure/posts.repository';
import {CreateBlogInputDto} from "../../blogs/api/input-dto/blogs.input-dto";
import {NotFoundException} from "@nestjs/common";
import {CreatePostInputDto} from "../api/input-dto/posts.input-dto";

export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const post: PostDocument = this.PostModel.createInstance(dto);

    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async updatePost(postId: string, body: CreatePostInputDto): Promise<void> {
    const result: boolean = await this.postsRepository.updatePost(postId, body);
    if (!result) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
  }

  async deleteBlog(postId: string): Promise<void> {
    const result: boolean = await this.postsRepository.deleteBlog(postId);
    if (!result) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
  }
}
