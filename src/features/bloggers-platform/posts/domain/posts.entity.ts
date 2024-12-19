import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { HydratedDocument, Model } from 'mongoose';
import {DeletionStatus} from "../../../../core/utils/status-enam";

@Schema({ _id: false })
export class extendedLikesInfo {
  @Prop({ type: Number, require: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, require: true, default: 0 })
  dislikesCount: number;
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, require: true })
  title: string;

  @Prop({ type: String, require: true })
  shortDescription: string;

  @Prop({ type: String, require: true })
  content: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: String, require: true })
  blogId: string;

  @Prop({ type: String, require: true })
  blogName: string;

  @Prop({ type: extendedLikesInfo, require: true })
  extendedLikesInfo: extendedLikesInfo;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static createInstance(dto: CreatePostDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.extendedLikesInfo = { likesCount: 0, dislikesCount: 0 };

    return post as PostDocument;
  }

  makeDeleted() {
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }

  updateContent(content: string) {
    this.content = content
  }

  increaseLike() {
    this.extendedLikesInfo.likesCount++
  }

  increaseDislike() {
    this.extendedLikesInfo.dislikesCount++
  }

  decreaseLike() {
    this.extendedLikesInfo.likesCount--
  }

  decreaseDislike() {
    this.extendedLikesInfo.dislikesCount--
  }

  clearLikesCount() {
    this.extendedLikesInfo.likesCount = 0
  }

  clearDislikesCount() {
    this.extendedLikesInfo.dislikesCount = 0
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
