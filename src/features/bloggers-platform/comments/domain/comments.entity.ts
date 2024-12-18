import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDto } from '../dto/create-comment.dto';
import {DeletionStatus} from "../../../../core/utils/status-enam";

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;
}

@Schema({ _id: false })
export class LikesInfo {
  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;
}

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: LikesInfo, required: true })
  likesInfo: LikesInfo;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static createInstance(dto: CreateCommentDto): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.commentatorInfo = {
      userId: dto.commentatorInfo.userId,
      userLogin: dto.commentatorInfo.userLogin,
    };
    comment.likesInfo = { likesCount: 0, dislikesCount: 0 };

    return comment as CommentDocument;
  }

  makeDeleted() {
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  updateContent(content: string) {
    this.content = content
  }

  increaseLike() {
    this.likesInfo.likesCount++
  }

  increaseDislike() {
    this.likesInfo.dislikesCount++
  }

  decreaseLike() {
    this.likesInfo.likesCount--
  }

  decreaseDislike() {
    this.likesInfo.dislikesCount--
  }

  clearLikesCount() {
    this.likesInfo.likesCount = 0
  }

  clearDislikesCount() {
    this.likesInfo.dislikesCount = 0
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
