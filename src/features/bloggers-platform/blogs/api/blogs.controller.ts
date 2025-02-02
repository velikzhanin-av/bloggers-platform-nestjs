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
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../core/guards/optional-jwt-auth.guard';
import { GetUser } from '../../../../core/decorators/get-user';
import { UserContext } from '../../../../core/dto/user-context';
import { BlogsQueryRepositorySql } from '../infrastructure/postgres/blogs.query-repository';
import { PostsQueryRepositorySql } from '../../posts/infrastructure/postgres/posts.query-repository';
import { LikeStatus } from '../../../../core/utils/status-enam';

@Controller()
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsQueryRepositorySql: BlogsQueryRepositorySql,
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private postsQueryRepositorySql: PostsQueryRepositorySql,
  ) {}

  @Get('blogs')
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepositorySql.findAllBlogs(query);
  }

  @Get('sa/blogs')
  @UseGuards(BasicAuthGuard)
  async getBlogsSA(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepositorySql.findAllBlogs(query);
  }

  @Post('sa/blogs')
  @UseGuards(BasicAuthGuard)
  async postBlogs(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId: string = await this.blogsService.createBlog(body);
    const blog: BlogViewDto | null =
      await this.blogsQueryRepositorySql.getByIdOrNotFoundFail(blogId);
    if (!blog) throw new InternalServerErrorException('not create blog');
    return blog;
  }

  @Get('blogs/:blogId')
  async getBlogById(@Param('blogId') blogId: string): Promise<BlogViewDto> {
    const blog: BlogViewDto | null =
      await this.blogsQueryRepositorySql.getByIdOrNotFoundFail(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    return blog;
  }

  @Put('sa/blogs/:blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async putBlogById(
    @Param('blogId') blogId: string,
    @Body() body: CreateBlogInputDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(blogId, body);
    return;
  }

  @Delete('sa/blogs/:blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlogById(@Param('blogId') blogId: string): Promise<void> {
    await this.blogsService.deleteBlog(blogId);
    return;
  }

  @Post('sa/blogs/:blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogIdInputDto,
  ): Promise<PostViewDto | null> {
    const blog: BlogViewDto | null =
      await this.blogsQueryRepositorySql.getByIdOrNotFoundFail(blogId);
    if (!blog) throw new NotFoundException('blog not found');

    const dto: CreatePostDto = { ...body, blogId, blogName: blog.name };
    const postId: string = await this.postsService.createPost(dto);
    const post: PostViewDto | null =
      await this.postsQueryRepositorySql.getByIdOrNotFoundFail(postId);
    if (!post) throw new InternalServerErrorException('not create post');
    // stub
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };
    return post;
  }

  @Get('blogs/:blogId/posts')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostsByBlogId(
    @GetUser() user: UserContext,
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const userId: string | null = user ? user.userId : null;
    const blog: BlogViewDto | null =
      await this.blogsQueryRepositorySql.getByIdOrNotFoundFail(blogId);

    if (!blog) throw new NotFoundException('blog not found');

    return this.postsQueryRepositorySql.findAllPosts(query, userId, blogId);
  }
}
