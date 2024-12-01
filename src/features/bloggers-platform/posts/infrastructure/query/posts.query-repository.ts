import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../../domain/posts.entity';
import { PostViewDto } from '../../api/output-dto/posts.view-dto';

export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async getByIdOrNotFoundFail(postId: string): Promise<PostViewDto | null> {
    const post: PostDocument | null = await this.PostModel.findOne({
      _id: postId,
    });
    if (!post) return null;
    return PostViewDto.mapToView(post);
  }
}
