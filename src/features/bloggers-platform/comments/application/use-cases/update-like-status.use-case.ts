import {LikeStatus} from "../../../../../core/utils/status-enam";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateLikeStatusDto} from "../../dto/update-like-status.dto";
import {CommentsRepository} from "../../infrastructure/comments.repository";
import {CommentDocument} from "../../domain/comments.entity";

export class UpdateLikeStatusCommand {
  constructor(public dto: UpdateLikeStatusDto) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({ dto }: UpdateLikeStatusCommand) {
    const { commentId, userId, likeStatus } = dto;
    const comment: CommentDocument | undefined = await this.commentsRepository.findCommentById(commentId)


    // TODO Здесь остановился, нужно понять как реализовывать. Через репу или через entity
    const findLike: LikesDbType | undefined | null = await this.commentsRepository.findLikeByCommentAndUser(user._id!.toString(), commentId)
    if (!findLike) {
      if (status === likeStatus.Like) comment.likesInfo.likesCount++
      else if (status === likeStatus.Dislike) comment.likesInfo.dislikesCount++

      const newLike: LikesDbType = {
        createdAt: new Date().toISOString(),
        commentId,
        userId: user._id!.toString(),
        userLogin: user.login,
        status
      }

      const createLike = await this.commentsRepository.createLike(newLike)

      let updateComment = await this.commentsRepository.updateLikesCountComment(commentId,
        comment.likesInfo.likesCount,
        comment.likesInfo.dislikesCount)
    } else {
      if (findLike.status !== status) {
        switch (findLike.status) {

          case likeStatus.Like:
            switch (status) {
              case likeStatus.Dislike:
                comment.likesInfo.likesCount--
                comment.likesInfo.dislikesCount++
                break
              case likeStatus.None:
                comment.likesInfo.likesCount = 0
                comment.likesInfo.dislikesCount = 0
                break
            }
            break

          case likeStatus.Dislike:
            switch (status) {
              case likeStatus.Like:
                comment.likesInfo.dislikesCount--
                comment.likesInfo.likesCount++
                break
              case likeStatus.None:
                comment.likesInfo.likesCount = 0
                comment.likesInfo.dislikesCount = 0
                break
            }
            break

          case likeStatus.None:
            switch (status) {
              case likeStatus.Like:
                comment.likesInfo.likesCount++
                break
              case likeStatus.Dislike:
                comment.likesInfo.dislikesCount++
                break
            }
            break
        }
        findLike.status = status
        const updateLike = await this.commentsRepository.updateLike(findLike._id!, status)
        const updateComment = await this.commentsRepository.updateLikesCountComment(commentId,
          comment.likesInfo.likesCount,
          comment.likesInfo.dislikesCount)
      }

    }

    return {
      statusCode: StatusCodeHttp.NoContent,
      data: null
    }
  }
}