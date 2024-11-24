import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';

//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [],
  controllers: [BlogsController],
  providers: [],
  exports: [],
})
export class BloggersPlatformModule {}
