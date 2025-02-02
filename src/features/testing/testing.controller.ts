import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
import { DataSource } from 'typeorm';
import { DeletionStatus } from '../../core/utils/status-enam';

@Controller('testing')
export class TestingController {
  constructor(
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
    private readonly dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.dataSource.query(
      `UPDATE users
       SET "deletionStatus" = $1;`,
      [DeletionStatus.PermanentDeleted],
    );
    await this.dataSource.query(
      `UPDATE session
       SET "deletionStatus" = $1;`,
      [DeletionStatus.PermanentDeleted],
    );
    await this.dataSource.query(
      `UPDATE blogs
       SET "deletionStatus" = $1;`,
      [DeletionStatus.PermanentDeleted],
    );
    await this.dataSource.query(
      `UPDATE posts
       SET "deletionStatus" = $1;`,
      [DeletionStatus.PermanentDeleted],
    );
    await this.CommentModel.deleteMany({});
    await this.CommentLikeModel.deleteMany({});
    await this.PostLikeModel.deleteMany({});
  }
}
