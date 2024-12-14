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
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.UserModel.deleteMany({});
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.SessionModel.deleteMany({});
    await this.CommentModel.deleteMany({});
  }
}
