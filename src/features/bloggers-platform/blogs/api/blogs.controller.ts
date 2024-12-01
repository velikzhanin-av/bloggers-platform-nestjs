import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { BlogViewDto } from './output-dto/blogs.view-dto';
import { CreatePostInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { PostsService } from '../../posts/application/posts.service';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../posts/api/output-dto/posts.view-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs() {
    return { data: 'blogs' };
  }

  @Post()
  async postBlogs(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId: string = await this.blogsService.createBlog(body);
    const blog: BlogViewDto | null =
      await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    if (!blog) throw new InternalServerErrorException();
    return blog;
  }

  @Get(':blogId')
  async getBlogById(@Param('blogId') blogId: string): Promise<BlogViewDto> {
    const blog: BlogViewDto | null =
      await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    return blog;
  }

  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('blogId') blogId: string): Promise<void> {
    await this.blogsService.deleteBlog(blogId);
    return;
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostInputDto,
  ): Promise<PostViewDto | null> {
    const blog: BlogViewDto | null =
      await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    if (!blog) throw new NotFoundException('blog not found');

    const dto: CreatePostDto = { ...body, blogId, blogName: blog.name };
    const postId: string = await this.postsService.createPost(dto);
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
