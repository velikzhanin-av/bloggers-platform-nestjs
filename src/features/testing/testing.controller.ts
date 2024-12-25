import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../user-accounts/domain/users.entity';
import {
  Blog,
  BlogModelType,
} from '../bloggers-platform/blogs/domain/blogs.entity';
import {
  Post,
  PostModelType,
} from '../bloggers-platform/posts/domain/posts.entity';
import {
  Session,
  SessionModelType,
} from '../user-accounts/domain/sessions.entity';
import {
  Comment,
  CommentModelType,
} from '../bloggers-platform/comments/domain/comments.entity';
import {
  CommentLike,
  CommentLikeModelType,
} from '../bloggers-platform/comments-likes/domain/comment-like.entity';
import {
  PostLike,
  PostLikeModelType,
} from '../bloggers-platform/posts-likes/domain/post-like.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    @InjectModel(PostLike.name)
    private PostLikeModel: PostLikeModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.UserModel.deleteMany({});
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.SessionModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.CommentLikeModel.deleteMany({});
    await this.PostLikeModel.deleteMany({});
  }
}
