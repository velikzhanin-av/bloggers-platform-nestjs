import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blogs.entity';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { Post, PostSchema } from './posts/domain/posts.entity';
import { PostsService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { CommentsService } from './comments/application/comments.service';
import { CommentsController } from './comments/api/comments.controller';
import { Comment, CommentSchema } from './comments/domain/comments.entity';
import { UsersRepository } from '../user-accounts/infrastructure/users.repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentsRepository } from './comments/infrastructure/comments.repository';

//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
  ],
  exports: [MongooseModule],
})
export class BloggersPlatformModule {}
