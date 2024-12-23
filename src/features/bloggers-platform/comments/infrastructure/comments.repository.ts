import {InjectModel} from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import {Injectable, NotFoundException} from '@nestjs/common';
import {DeletionStatus} from "../../../../core/utils/status-enam";

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findCommentById(commentId: string): Promise<CommentDocument> {
    const comment: CommentDocument | null = await this.CommentModel.findOne({
      _id: commentId,
      deletionStatus: {$ne: DeletionStatus.PermanentDeleted}})
    if (!comment) throw new NotFoundException(`Comment with id ${commentId} not found`)
    return comment
  }

  }
