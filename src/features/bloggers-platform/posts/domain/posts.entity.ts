import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { HydratedDocument, Model } from 'mongoose';

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

  static createInstance(dto: CreatePostDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    // post.extendedLikesInfo = dto.extendedLikesInfo;

    return post as PostDocument;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
