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
import {PostViewDto} from './output-dto/posts.view-dto';
import {PostsQueryRepository} from '../infrastructure/query/posts.query-repository';
import {CreatePostInputDto} from './input-dto/posts.input-dto';
import {BlogViewDto} from '../../blogs/api/output-dto/blogs.view-dto';
import {PostsService} from '../application/posts.service';
import {BlogsQueryRepository} from '../../blogs/infrastructure/query/blogs.query-repository';
import {PaginatedViewDto} from '../../../../core/dto/base.paginated.view-dto';
import {GetPostsQueryParams} from './input-dto/get-posts-query-params.input-dto';
import {CreateCommentInputDto} from '../../comments/api/input-dto/create-comment.dto';
import {ExtractUserFromRequest} from '../../../../core/decorators/extract-user-from-request';
import {UserContext} from '../../../../core/dto/user-context';
import {JwtAuthGuard} from '../../../../core/guards/jwt-auth.guard';
import {CommandBus} from "@nestjs/cqrs";
import {CreateCommentByPostIdCommand} from "../../comments/application/use-cases/create-comment-by-post-id.use-case";
import {GetCommentByIdViewDto} from "../../comments/api/output-dto/get-comment-by-id.view-dto";
import {UpdateLikeStatusCommentDto} from "../../comments/api/input-dto/update-like-status-comment.dto";
import {UpdatePostLikeStatusCommand} from "../application/use-cases/update-post-like-status";
import {OptionalJwtAuthGuard} from "../../../../core/guards/optional-jwt-auth.guard";
import {GetUser} from "../../../../core/decorators/get-user";

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus
  ) {
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
    @GetUser() user: UserContext,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const userId: string | null = user ? user.userId : null;
    return this.postsQueryRepository.findAllPosts(query, userId);
  }

  @Get(':postId')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostById(@GetUser() user: UserContext,
                    @Param('postId') postId: string): Promise<PostViewDto> {
    const userId: string | null = user ? user.userId : null;
    const post: PostViewDto | null = await this.postsService.findPostById(postId, userId)
    if (!post) throw new NotFoundException('post not found');
    return post;
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putPostById(
    @Param('postId') postId: string,
    @Body() body: CreatePostInputDto,
  ): Promise<void> {
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

    const dto = {...body, blogName: blog.name};
    const postId: string = await this.postsService.createPost(dto);
    const post: PostViewDto | null =
      await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    if (!post) throw new InternalServerErrorException();
    return post;
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('postId') postId: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContext,
  ): Promise<GetCommentByIdViewDto> {
    const dto = {...body, postId, userId: user.userId};
    return await this.commandBus.execute(new CreateCommentByPostIdCommand(dto));
  };

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async putLikeStatusPostById(@ExtractUserFromRequest() user: UserContext,
                              @Param('postId') postId: string,
                              @Body() body: UpdateLikeStatusCommentDto) {
    return await this.commandBus.execute(new UpdatePostLikeStatusCommand({
      postId,
      userId: user.userId,
      likeStatus: body.likeStatus
    }));
  };

}
