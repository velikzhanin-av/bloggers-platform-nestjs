import {
  Body,
  Controller, Delete,
  Get, HttpCode, HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post, Put,
  Query, UseGuards,
} from '@nestjs/common';
import { PostViewDto } from './output-dto/posts.view-dto';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { BlogViewDto } from '../../blogs/api/output-dto/blogs.view-dto';
import { PostsService } from '../application/posts.service';
import { BlogsQueryRepository } from '../../blogs/infrastructure/query/blogs.query-repository';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import {JwtAuthGuard} from "../../../../core/guards/jwt-auth.guard";

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.findAllPosts(query);
  }

  @Get(':postId')
  async getPostById(@Param('postId') postId: string): Promise<PostViewDto> {
    const post: PostViewDto | null =
      await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    if (!post) throw new NotFoundException('post not found');
    return post;
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPostById(@Param('postId') postId: string,
                    @Body() body: CreatePostInputDto): Promise<void> {
    await this.postsService.updatePost(postId, body);
    return;
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(@Param('postId') postId: string): Promise<void> {
    await this.postsService.deleteBlog(postId);
    return;
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const blog: BlogViewDto | null =
      await this.blogsQueryRepository.getByIdOrNotFoundFail(body.blogId);

    if (!blog) throw new NotFoundException('blog not found');

    const dto = { ...body, blogName: blog.name };
    const postId: string = await this.postsService.createPost(dto);
    const post: PostViewDto | null =
      await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    if (!post) throw new InternalServerErrorException();
    return post;
  }
}
