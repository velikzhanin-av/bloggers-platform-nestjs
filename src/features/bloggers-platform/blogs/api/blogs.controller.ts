import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { BlogViewDto } from './output-dto/blogs.view-dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async getBlogs() {
    return { data: 'blogs' };
  }

  @Post()
  async postBlogs(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId: string = await this.blogsService.createBlog(body);
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Get(':blogId')
  async getBlogById(@Param('blogId') blogId: string): Promise<BlogViewDto> {
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('blogId') blogId: string): Promise<void> {
    await this.blogsService.deleteBlog(blogId);
    return;
  }
}
