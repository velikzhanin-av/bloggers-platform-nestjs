import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, UpdateResult } from 'mongoose';
import { CreateBlogInputDto } from '../api/input-dto/blogs.input-dto';

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

  async updateBlog(blogId: string, body: CreateBlogInputDto): Promise<boolean> {
    const result: UpdateResult = await this.BlogModel.updateOne(
      { _id: blogId },
      {
        $set: {
          name: body.name,
          description: body.description,
          websiteUrl: body.websiteUrl,
        },
      },
    );
    return result.modifiedCount !== 0;
  }
}
