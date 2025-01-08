import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LikeStatus } from '../../../../../core/utils/status-enam';
import { UserDocument } from '../../../../user-accounts/domain/users.entity';
import { UsersCommandRepository } from '../../../../user-accounts/infrastructure/postgresql/users-command.repository';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../../../posts-likes/domain/post-like.entity';
import { PostDocument } from '../../domain/posts.entity';
import { PostsLikesRepository } from '../../../posts-likes/infrastructure/posts-likes.repository';
import { CreateLikeDto } from '../../../posts-likes/dto/create-like.dto';

export class UpdatePostLikeStatusCommand {
  constructor(
    public dto: { postId: string; userId: string; likeStatus: LikeStatus },
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly UsersCommandRepository: UsersCommandRepository,
    private readonly postsLikesRepository: PostsLikesRepository,
    @InjectModel(PostLike.name)
    private readonly LikeModel: PostLikeModelType,
  ) {}

  async execute({ dto }: UpdatePostLikeStatusCommand): Promise<void> {
    const { postId, userId, likeStatus } = dto;
    const post: PostDocument = await this.postsRepository.findPostById(postId);
    const user: UserDocument | null =
      await this.UsersCommandRepository.findOrNotFoundFail(userId);

    const findLike: PostLikeDocument | null =
      await this.postsLikesRepository.findLikeByPostAndUser(postId, userId);
    if (!findLike) {
      if (likeStatus === LikeStatus.Like) post.increaseLike();
      else if (likeStatus === LikeStatus.Dislike) post.increaseDislike();
      await this.postsRepository.save(post);

      const newLike: CreateLikeDto = {
        postId,
        userId,
        userLogin: user!.login,
        status: likeStatus,
      };
      const createLike: PostLikeDocument =
        this.LikeModel.createInstance(newLike);
      await this.postsLikesRepository.save(createLike);
    } else {
      if (findLike.status !== likeStatus) {
        switch (findLike.status) {
          case LikeStatus.Like:
            switch (likeStatus) {
              case LikeStatus.Dislike:
                post.decreaseLike();
                post.increaseDislike();
                break;
              case LikeStatus.None:
                post.clearLikesCount();
                post.clearDislikesCount();
                break;
            }
            break;

          case LikeStatus.Dislike:
            switch (likeStatus) {
              case LikeStatus.Like:
                post.decreaseDislike();
                post.increaseLike();
                break;
              case LikeStatus.None:
                post.clearLikesCount();
                post.clearDislikesCount();
                break;
            }
            break;

          case LikeStatus.None:
            switch (likeStatus) {
              case LikeStatus.Like:
                post.increaseLike();
                break;
              case LikeStatus.Dislike:
                post.increaseDislike();
                break;
            }
            break;
        }

        await this.postsRepository.save(post);

        findLike.updateLikeStatus(likeStatus);
        await this.postsLikesRepository.save(findLike);
      }
    }
  }
}
