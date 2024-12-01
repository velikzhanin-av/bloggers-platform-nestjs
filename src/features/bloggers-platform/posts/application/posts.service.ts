import { PostDocument, PostModelType } from '../domain/posts.entity';
import { CreatePostDto } from '../dto/create-post.dto';

export class PostsService {
  constructor(private PostModel: PostModelType) {}

  async createPost(dto: CreatePostDto): Promise<void> {
    //#TODO добавить метод save из репозитория
    const post: PostDocument = await this.PostModel.createInstance(dto);
  }
}
