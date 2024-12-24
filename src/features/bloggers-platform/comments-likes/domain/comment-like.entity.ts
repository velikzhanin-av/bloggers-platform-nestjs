import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {LikeStatus} from "../../../../core/utils/status-enam";
import {CreateLikeDto} from "../dto/create.like.dto";
import {HydratedDocument, Model} from "mongoose";

@Schema({ timestamps: true })
export class CommentLike {
  @Prop({ type: String, required: true })
  commentId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({ type: String, enum: Object.values(LikeStatus), required: true, default: LikeStatus.None })
  status: LikeStatus;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  static createInstance(dto: CreateLikeDto): CommentLikeDocument {
    const like = new this();
    like.commentId = dto.commentId;
    like.userId = dto.userId;
    like.userLogin = dto.userLogin;
    like.status = dto.status;

    return like as CommentLikeDocument;
  }

  updateLikeStatus(status: LikeStatus) {
    this.status = status
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

CommentLikeSchema.loadClass(CommentLike);

export type CommentLikeDocument = HydratedDocument<CommentLike>;

export type CommentLikeModelType = Model<CommentLikeDocument> & typeof CommentLike;