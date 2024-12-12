import {Prop, Schema} from "@nestjs/mongoose";

@Schema({_id: false})
export class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string

  @Prop({ type: String, required: true })
  userLogin: string
}

@Schema({_id: false})
export class LikesInfo {
  @Prop({ type: Number, required: true })
  likesCount: number

  @Prop({ type: Number, required: true })
  dislikesCount: number
}


@Schema({timestamps: true})
export class Comment {
  @Prop({ type: String, required: true })
  content: string

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo

  @Prop({ type: Date, required: true })
  createdAt: Date

  @Prop({ type: String, required: true })
  postId: string

  @Prop({ type: LikesInfo, required: true })
  likesInfo: LikesInfo

  static createInstance(comment: Comment) {}
}

