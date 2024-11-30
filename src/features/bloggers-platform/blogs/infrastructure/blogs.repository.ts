import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    const result: DeleteResult = await this.BlogModel.deleteOne({
      _id: blogId,
    });
    return result.deletedCount !== 0;
  }
}
