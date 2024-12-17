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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { BlogViewDto } from './output-dto/blogs.view-dto';
import {
  CreatePostByBlogIdInputDto,
  CreatePostInputDto,
} from '../../posts/api/input-dto/posts.input-dto';
import { PostsService } from '../../posts/application/posts.service';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../posts/api/output-dto/posts.view-dto';
import { GetUsersQueryParams } from '../../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../../../user-accounts/api/output-dto/users.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import {BasicAuthGuard} from "../../../../core/guards/basic-auth.guard";

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.findAllBlogs(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
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

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async putBlogById(
    @Param('blogId') blogId: string,
    @Body() body: CreateBlogInputDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(blogId, body);
    return;
  }

  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlogById(@Param('blogId') blogId: string): Promise<void> {
    await this.blogsService.deleteBlog(blogId);
    return;
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogIdInputDto,
  ): Promise<PostViewDto | null> {
    const blog: BlogViewDto | null =
      await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    if (!blog) throw new NotFoundException('blog not found');

    const dto: CreatePostDto = { ...body, blogId, blogName: blog.name };
    const postId: string = await this.postsService.createPost(dto);
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const blog: BlogViewDto | null =
      await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    if (!blog) throw new NotFoundException('blog not found');

    return this.postsQueryRepository.findAllPosts(query, blogId);
  }
}
