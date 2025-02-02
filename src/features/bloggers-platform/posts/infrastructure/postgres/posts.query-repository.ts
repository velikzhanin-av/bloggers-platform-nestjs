import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../../domain/posts.entity';
import { PostViewDto } from '../../api/output-dto/posts.view-dto';
import { Injectable, Query } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import {
  DeletionStatus,
  LikeStatus,
} from '../../../../../core/utils/status-enam';
import { PostLikeDocument } from '../../../posts-likes/domain/post-like.entity';
import { PostsLikesRepository } from '../../../posts-likes/infrastructure/posts-likes.repository';
import { NewestLikesDto } from '../../dto/newest-likes.dto';
import { PostsLikesQueryRepository } from '../../../posts-likes/infrastructure/posts-likes-query.repository';
import { BlogViewDto } from '../../../blogs/api/output-dto/blogs.view-dto';
import { DataSource } from 'typeorm';
import { BlogDBType } from '../../../blogs/domain/types';

@Injectable()
export class PostsQueryRepositorySql {
  constructor(
    private readonly postsLikesRepository: PostsLikesRepository,
    private readonly postsLikesQueryRepository: PostsLikesQueryRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAllPosts(
    @Query() query: GetPostsQueryParams,
    userId: string | null,
    blogId: string = '',
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const skip: number = (query.pageNumber - 1) * query.pageSize;

    const posts = await this.dataSource.query(
      `SELECT *
       FROM posts
       WHERE "deletionStatus" != $1
         AND "blogId" ILIKE '%' || $2 || '%'
       ORDER BY "${query.sortBy}" ${query.sortDirection}
       LIMIT $4 OFFSET $3`,
      [
        DeletionStatus.PermanentDeleted,
        blogId,
        skip,
        query.pageSize,
        // query.searchNameTerm,
      ],
    );

    const counts = await this.dataSource.query(
      `SELECT COUNT(*)
       FROM posts
       WHERE "deletionStatus" != $1
         AND "blogId" = $2`,
      [DeletionStatus.PermanentDeleted, blogId],
    );

    const totalCount: number = Number(counts[0].count);

    // const items: PostViewDto[] = posts.map(PostViewDto.postMapToView);

    const items: PostViewDto[] = posts.map((post) =>
      PostViewDto.postMapToView(post, LikeStatus.None, []),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getByIdOrNotFoundFail(postId: string): Promise<PostViewDto | null> {
    const post = await this.dataSource.query(
      `SELECT id, title, "shortDescription", content, "blogId", "createdAt", "blogName"
       FROM posts
       WHERE "deletionStatus" != $1
         AND id = $2`,
      [DeletionStatus.PermanentDeleted, postId],
    );
    return post[0] ?? null;
  }
}
