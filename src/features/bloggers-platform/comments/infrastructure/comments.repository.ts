import {InjectModel} from "@nestjs/mongoose";
import {Comment, CommentDocument, CommentModelType} from "../domain/comments.entity";
import {PostDocument} from "../../posts/domain/posts.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,) {
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}