import { Blog, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogInputDto } from '../api/input-dto/blogs.input-dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { NotFoundException } from '@nestjs/common';
import { BlogsCommandRepositorySql } from '../infrastructure/postgres/blogs.command-repository';
import { randomUUID } from 'crypto';

export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
    private blogsCommandRepositorySql: BlogsCommandRepositorySql,
  ) {}

  async createBlog(dto: CreateBlogInputDto): Promise<string> {
    const id: string = randomUUID();
    return await this.blogsCommandRepositorySql.createBlog({
      id,
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
    });
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
