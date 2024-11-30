import { BlogViewDto } from '../../api/output-dto/blogs.view-dto';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';

export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async getByIdOrNotFoundFail(blogId: string): Promise<BlogViewDto | null> {
    const blog: BlogDocument | null = await this.BlogModel.findOne({
      _id: blogId,
    });
    if (!blog) return null;
    return BlogViewDto.mapToView(blog);
  }
}
