import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogInputDto } from '../api/input-dto/blogs.input-dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { NotFoundException } from '@nestjs/common';

export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogInputDto): Promise<string> {
    const blog: BlogDocument = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
    });

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async deleteBlog(blogId: string): Promise<void> {
    const result: boolean = await this.blogsRepository.deleteBlog(blogId);
    if (!result) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }
  }

  async updateBlog(blogId: string, body: CreateBlogInputDto): Promise<void> {
    const result: boolean = await this.blogsRepository.updateBlog(blogId, body);
    if (!result) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }
  }
}
