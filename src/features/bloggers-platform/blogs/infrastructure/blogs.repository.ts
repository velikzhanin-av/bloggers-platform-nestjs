import { Injectable, NotFoundException } from '@nestjs/common';
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

  async deleteBlog(blogId: string): Promise<void> {
    const result: DeleteResult = await this.BlogModel.deleteOne({
      _id: blogId,
    });
    if (result.deletedCount === 0)
      throw new NotFoundException(`Blog with id ${blogId} not found`);
  }
}
