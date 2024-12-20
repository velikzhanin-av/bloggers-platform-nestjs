import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../../domain/posts.entity';
import { PostViewDto } from '../../api/output-dto/posts.view-dto';
import { Query } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';

export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async findAllPosts(
    @Query() query: GetPostsQueryParams,
    blogId: string | null = null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    let filter: FilterQuery<Post> = {};
    if (blogId) {
      filter = { blogId };
    }

    const posts: PostDocument[] | null = await this.PostModel.find({
      ...filter,
    })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.PostModel.countDocuments(filter);
    
    const items: PostViewDto[] = posts.map(PostViewDto.newPostMapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getByIdOrNotFoundFail(postId: string): Promise<PostViewDto | null> {
    const post: PostDocument | null = await this.PostModel.findOne({
      _id: postId,
    });
    if (!post) return null;
    return PostViewDto.newPostMapToView(post);
  }
}
