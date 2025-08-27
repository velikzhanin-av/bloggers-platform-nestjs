import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatus } from '../../../../../core/utils/status-enam';
import { UserDocument } from '../../../../user-accounts/domain/users.entity';
import { UsersCommandRepository } from '../../../../user-accounts/infrastructure/postgresql/users-command.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostLikeDocument } from '../../../posts-likes/domain/post-like.entity';
import { PostDocument } from '../../domain/posts.entity';
import { PostsLikesRepository } from '../../../posts-likes/infrastructure/posts-likes.repository';
import { CreateLikeDto } from '../../../posts-likes/dto/create-like.dto';
import { PostsCommandRepositorySql } from '../../infrastructure/postgres/posts.command-repository';
import { LikesCommentCommandRepositorySql } from '../../../comments-likes/infrastructure/postgres/likes.command-repository';
import { LikesPostsCommandRepositorySql } from '../../../posts-likes/infrastructure/postgres/likes-posts.command-repository';
import { randomUUID } from 'crypto';
import { NotFoundException } from '@nestjs/common';

export class UpdatePostLikeStatusCommand {
  constructor(
    public dto: { postId: string; userId: string; status: LikeStatus },
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersCommandRepository: UsersCommandRepository,
    private readonly postsLikesRepository: PostsLikesRepository,
    private readonly likesCommentCommandRepositorySql: LikesCommentCommandRepositorySql,
    private readonly likesPostsCommandRepositorySql: LikesPostsCommandRepositorySql,
    private readonly postsCommandRepositorySql: PostsCommandRepositorySql,
  ) {}

  async execute({ dto }: UpdatePostLikeStatusCommand): Promise<void> {
    const { postId, userId, status } = dto;
    const post: PostDocument =
      await this.postsCommandRepositorySql.findPostById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user: UserDocument | null =
      await this.usersCommandRepository.findOrNotFoundFail(userId);

    const like: PostLikeDocument | null =
      await this.likesPostsCommandRepositorySql.findLikeByPostAndUser(
        postId,
        userId,
      );

    if (!like) {
      const id: string = randomUUID();
      const newLike: CreateLikeDto = {
        id,
        postId,
        userId,
        status: status,
      };
      await this.likesPostsCommandRepositorySql.createLike(newLike);
    } else {
      await this.likesPostsCommandRepositorySql.updateLike(dto);
    }
  }
}
