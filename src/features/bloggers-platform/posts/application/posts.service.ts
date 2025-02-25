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

export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private readonly postsLikesQueryRepository: PostsLikesQueryRepository,
    private readonly postsCommandRepositorySql: PostsCommandRepositorySql,
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

    // const newestLikes: Array<NewestLikesDto> | null =
    //   await this.postsLikesQueryRepository.findNewestLikes(postId);
    // stub
    const newestLikes = [];
    // TODO поправить any
    const postOut: any = this.mapToOutputPostsFromBd(
      post,
      LikeStatus.None,
      newestLikes,
    );

    if (!userId) return postOut;

    // const like: PostLikeDocument | null =
    //   await this.postsLikesQueryRepository.findLikeByCommentAndUser(
    //     postId,
    //     userId,
    //   );
    // if (!like) return postOut;
    // stub
    const like = { status: LikeStatus.None };

    return this.mapToOutputPostsFromBd(post, like.status, newestLikes);
  }

  mapToOutputPostsFromBd(
    post: any,
    likeStatus: string,
    newestLikes: Array<any> | undefined,
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
        dislikesCount: 0,
        likesCount: 0,
        myStatus: likeStatus,
        newestLikes,
      },
    };
  }
}
