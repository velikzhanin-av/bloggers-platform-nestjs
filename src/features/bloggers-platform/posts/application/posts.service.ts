import { Post, PostDocument, PostModelType } from '../domain/posts.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';
import { CreatePostInputDto } from '../api/input-dto/posts.input-dto';
import { PostsLikesQueryRepository } from '../../posts-likes/infrastructure/posts-likes-query.repository';
import { PostLikeDocument } from '../../posts-likes/domain/post-like.entity';
import { NewestLikesDto } from '../dto/newest-likes.dto';
import { LikeStatus } from '../../../../core/utils/status-enam';
import { PostsCommandRepositorySql } from '../infrastructure/postgres/posts.command-repository';
import { randomUUID } from 'crypto';
import {
  LikesPostsCommandRepositorySql
} from '../../posts-likes/infrastructure/postgres/likes-posts.command-repository';
import * as string_decoder from 'node:string_decoder';

export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private readonly postsLikesQueryRepository: PostsLikesQueryRepository,
    private readonly postsCommandRepositorySql: PostsCommandRepositorySql,
    private readonly likesPostsCommandRepositorySql: LikesPostsCommandRepositorySql,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const id: string = randomUUID();
    return await this.postsCommandRepositorySql.createPost({
      id,
      ...dto,
    });
  }

  async updatePost(postId: string, body: CreatePostInputDto): Promise<void> {
    const result: boolean = await this.postsRepository.updatePost(postId, body);
    if (!result) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
  }

  async deleteBlog(postId: string): Promise<void> {
    const result: boolean = await this.postsRepository.deleteBlog(postId);
    if (!result) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
  }

  async findPostById(postId: string, userId: string | null): Promise<any> {
    const post: PostDocument =
      await this.postsCommandRepositorySql.findPostById(postId);
    if (!post) throw new NotFoundException(`Post with id ${postId} not found`);

    const countLikes: number =
      await this.likesPostsCommandRepositorySql.findLikeOrDislikePost(
        postId,
        'Like',
      );

    const countDisLikes: number =
      await this.likesPostsCommandRepositorySql.findLikeOrDislikePost(
        postId,
        'Dislike',
      );

    const newestLikes: Array<NewestLikesDto> | null =
      await this.postsCommandRepositorySql.findNewestLikes(postId);
    // TODO поправить any
    const postOut: any = this.mapToOutputPostsFromBd(
      post,
      LikeStatus.None,
      newestLikes,
      countLikes,
      countDisLikes,
    );

    if (!userId) return postOut;

    const like =
      await this.likesPostsCommandRepositorySql.findLikeByPostAndUser(
        postId,
        userId,
      );

    if (!like) return postOut;

    return this.mapToOutputPostsFromBd(
      post,
      like.status,
      newestLikes,
      countLikes,
      countDisLikes,
    );
  }

  mapToOutputPostsFromBd(
    post: any,
    likeStatus: string,
    newestLikes: Array<any> | undefined,
    countLikes: number,
    countDisLikes: number,
  ) {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        // stub
        // dislikesCount: post.extendedLikesInfo.dislikesCount,
        // likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: countDisLikes,
        likesCount: countLikes,
        myStatus: likeStatus,
        newestLikes,
      },
    };
  }
}
