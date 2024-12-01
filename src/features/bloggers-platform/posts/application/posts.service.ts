import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';

import { PostsRepository } from '../infrastructure/posts.repository';

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
}
