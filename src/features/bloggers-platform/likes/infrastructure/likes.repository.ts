import {InjectModel} from "@nestjs/mongoose";
import {Like, LikeDocument, LikeModelType} from "../domain/likes.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name)
    private readonly LikeModel: LikeModelType,
  ) {}

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }

  async findLikeByCommentAndUser(userId: string, commentId: string): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({userId, commentId});
  }

}