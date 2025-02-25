import { Blog, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogInputDto } from '../api/input-dto/blogs.input-dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsCommandRepositorySql } from '../infrastructure/postgres/blogs.command-repository';
import { randomUUID } from 'crypto';
import { BlogDBType } from '../domain/types';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsCommandRepositorySql: BlogsCommandRepositorySql,
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
    const blog: BlogDBType | null =
      await this.blogsCommandRepositorySql.findOrNotFoundFail(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }
    await this.blogsCommandRepositorySql.deleteBlog(blogId);
  }

  async updateBlog(blogId: string, body: CreateBlogInputDto): Promise<void> {
    const blog: BlogDBType | null =
      await this.blogsCommandRepositorySql.findOrNotFoundFail(blogId);
    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }
    await this.blogsCommandRepositorySql.updateBlog(blogId, body);
  }
}
