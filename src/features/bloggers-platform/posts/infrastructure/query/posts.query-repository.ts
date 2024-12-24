import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../../domain/posts.entity';
import { PostViewDto } from '../../api/output-dto/posts.view-dto';
import { Query } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { LikeStatus } from '../../../../../core/utils/status-enam';
import { PostLikeDocument } from '../../../posts-likes/domain/post-like.entity';
import { PostsLikesRepository } from '../../../posts-likes/infrastructure/posts-likes.repository';
import { NewestLikesDto } from '../../dto/newest-likes.dto';
import { PostsLikesQueryRepository } from '../../../posts-likes/infrastructure/posts-likes-query.repository';

export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private readonly PostModel: PostModelType,
    private readonly postsLikesRepository: PostsLikesRepository,
    private readonly postsLikesQueryRepository: PostsLikesQueryRepository,
  ) {}

  async findAllPosts(
    @Query() query: GetPostsQueryParams,
    userId: string | null,
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

    const items: PostViewDto[] = await Promise.all(
      posts.map(async (post: PostDocument) => {
        const newestLikes: NewestLikesDto[] | undefined =
          await this.postsLikesQueryRepository.findNewestLikes(
            post._id!.toString(),
          );
        if (!userId)
          return PostViewDto.postMapToView(post, LikeStatus.None, newestLikes);
        const like: PostLikeDocument | null =
          await this.postsLikesRepository.findLikeByPostAndUser(
            post._id.toString(),
            userId,
          );
        if (!like)
          return PostViewDto.postMapToView(post, LikeStatus.None, newestLikes);
        return PostViewDto.postMapToView(post, like.status, newestLikes);
      }),
    );
    // const items: PostViewDto[] = posts.map(PostViewDto.newPostMapToView);
    // const items: PostViewDto[] = posts.map((post) =>
    //   PostViewDto.newPostMapToView(post, LikeStatus.None),
    // );

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
    return PostViewDto.postMapToView(post, LikeStatus.None, []);
  }
}
