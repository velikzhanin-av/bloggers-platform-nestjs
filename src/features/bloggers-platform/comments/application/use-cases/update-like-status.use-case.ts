import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentDocument } from '../../domain/comments.entity';

import { LikeStatus } from '../../../../../core/utils/status-enam';
import { UserDocument } from '../../../../user-accounts/domain/users.entity';
import { UsersCommandRepository } from '../../../../user-accounts/infrastructure/postgresql/users-command.repository';
import { InjectModel } from '@nestjs/mongoose';
import { LikesRepository } from '../../../comments-likes/infrastructure/likes.repository';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../../../comments-likes/domain/comment-like.entity';
import { CreateLikeDto } from '../../../comments-likes/dto/create.like.dto';

export class UpdateLikeStatusCommand {
  constructor(
    public dto: { commentId: string; userId: string; likeStatus: LikeStatus },
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesRepository: LikesRepository,
    private readonly UsersCommandRepository: UsersCommandRepository,
    @InjectModel(CommentLike.name)
    private readonly LikeModel: CommentLikeModelType,
  ) {}

  async execute({ dto }: UpdateLikeStatusCommand): Promise<void> {
    const { commentId, userId, likeStatus } = dto;
    const comment: CommentDocument =
      await this.commentsRepository.findCommentById(commentId);
    const user: UserDocument | null =
      await this.UsersCommandRepository.findOrNotFoundFail(userId);

    const findLike: CommentLikeDocument | null =
      await this.likesRepository.findLikeByCommentAndUser(userId, commentId);
    if (!findLike) {
      if (likeStatus === LikeStatus.Like) comment.increaseLike();
      else if (likeStatus === LikeStatus.Dislike) comment.increaseDislike();
      await this.commentsRepository.save(comment);

      const newLike: CreateLikeDto = {
        commentId,
        userId,
        userLogin: user!.login,
        status: likeStatus,
      };
      const createLike: CommentLikeDocument =
        this.LikeModel.createInstance(newLike);
      await this.likesRepository.save(createLike);
    } else {
      if (findLike.status !== likeStatus) {
        switch (findLike.status) {
          case LikeStatus.Like:
            switch (likeStatus) {
              case LikeStatus.Dislike:
                comment.decreaseLike();
                comment.increaseDislike();
                break;
              case LikeStatus.None:
                comment.clearLikesCount();
                comment.clearDislikesCount();
                break;
            }
            break;

          case LikeStatus.Dislike:
            switch (likeStatus) {
              case LikeStatus.Like:
                comment.decreaseDislike();
                comment.increaseLike();
                break;
              case LikeStatus.None:
                comment.clearLikesCount();
                comment.clearDislikesCount();
                break;
            }
            break;

          case LikeStatus.None:
            switch (likeStatus) {
              case LikeStatus.Like:
                comment.increaseLike();
                break;
              case LikeStatus.Dislike:
                comment.increaseDislike();
                break;
            }
            break;
        }

        await this.commentsRepository.save(comment);

        findLike.updateLikeStatus(likeStatus);
        await this.likesRepository.save(findLike);
      }
    }
  }
}
