import {Post, PostDocument, PostModelType} from '../domain/posts.entity';
import {CreatePostDto} from '../dto/create-post.dto';
import {InjectModel} from '@nestjs/mongoose';
import {PostsRepository} from '../infrastructure/posts.repository';
import {NotFoundException} from '@nestjs/common';
import {CreatePostInputDto} from '../api/input-dto/posts.input-dto';
import {PostsLikesQueryRepository} from "../../posts-likes/infrastructure/posts-likes-query.repository";
import {PostLikeDocument} from "../../posts-likes/domain/post-like.entity";
import {NewestLikesDto} from "../dto/newest-likes.dto";
import {LikeStatus} from "../../../../core/utils/status-enam";
import {GetPostsQueryParams} from "../api/input-dto/get-posts-query-params.input-dto";

export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private readonly postsLikesQueryRepository: PostsLikesQueryRepository,
  ) {
  }

  async createPost(dto: CreatePostDto): Promise<string> {
    const post: PostDocument = this.PostModel.createInstance(dto);

    await this.postsRepository.save(post);
    return post._id.toString();
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
    const post: PostDocument = await this.postsRepository.findPostById(postId)

    const newestLikes: Array<NewestLikesDto> | null = await this.postsLikesQueryRepository.findNewestLikes(postId)
    // TODO поправить any
    let postOut: any = this.mapToOutputPostsFromBd(post, LikeStatus.None, newestLikes)

    if (!userId) return postOut

    const like: PostLikeDocument | null = await this.postsLikesQueryRepository.findLikeByCommentAndUser(postId, userId)
    if (!like) return postOut

    return this.mapToOutputPostsFromBd(post, like.status, newestLikes)
  }

   mapToOutputPostsFromBd(post: any, likeStatus: string, newestLikes: Array<any> | undefined) {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        likesCount: post.extendedLikesInfo.likesCount,
        myStatus: likeStatus,
        newestLikes
      },
    }
  }

}
