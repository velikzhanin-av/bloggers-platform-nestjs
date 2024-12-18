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
import { CommentsController } from './comments/api/comments.controller';
import { Comment, CommentSchema } from './comments/domain/comments.entity';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import {CreateCommentByPostIdUseCase} from "./comments/application/use-cases/create-comment-by-post-id.use-case";
import {DeleteCommentByPostIdUseCase} from "./comments/application/use-cases/delete-comment-by-id.use-case";
import {CqrsModule} from "@nestjs/cqrs";
import {UpdateCommentByPostIdUseCase} from "./comments/application/use-cases/update-comment-by-id.use-case";
import {UpdateLikeStatusUseCase} from "./comments/application/use-cases/update-like-status.use-case";
import {LikesRepository} from "./likes/infrastructure/likes.repository";
import {Like, LikeSchema} from "./likes/domain/likes.entity";
import {GetCommentByIdUserCase} from "./comments/application/use-cases/get-comment-by-id.use-case";

const useCases: Array<any> = [
  CreateCommentByPostIdUseCase,
  DeleteCommentByPostIdUseCase,
  UpdateCommentByPostIdUseCase,
  UpdateLikeStatusUseCase,
  GetCommentByIdUserCase,
]

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    UserAccountsModule,
    CqrsModule
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    LikesRepository,
    ...useCases
  ],
  exports: [MongooseModule],
})
export class BloggersPlatformModule {}
