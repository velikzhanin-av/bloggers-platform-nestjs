import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../../../core/utils/status-enam';
import { HydratedDocument, Model } from 'mongoose';
import { CreateLikeDto } from '../dto/create-like.dto';

@Schema({ timestamps: true })
export class PostLike {
  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({
    type: String,
    enum: Object.values(LikeStatus),
    required: true,
    default: LikeStatus.None,
  })
  status: LikeStatus;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  static createInstance(dto: CreateLikeDto): PostLikeDocument {
    const like = new this();
    like.postId = dto.postId;
    like.userId = dto.userId;
    like.userLogin = dto.userLogin;
    like.status = dto.status;

    return like as PostLikeDocument;
  }

  updateLikeStatus(status: LikeStatus) {
    this.status = status;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

PostLikeSchema.loadClass(PostLike);

export type PostLikeDocument = HydratedDocument<PostLike>;

export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;
