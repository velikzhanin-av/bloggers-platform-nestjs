import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogDBType } from '../../domain/types';

@Injectable()
export class BlogsCommandRepositorySql {
  constructor(private readonly dataSource: DataSource) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blogId: BlogDBType = await this.dataSource.query(
      `
          INSERT INTO blogs(id, name, description, "websiteUrl", "isMembership")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id;`,
      [dto.id, dto.name, dto.description, dto.websiteUrl, dto.isMembership],
    );
    return blogId[0].id;
  }

  // async deleteBlog(blogId: string): Promise<boolean> {
  //   const result: DeleteResult = await this.BlogModel.deleteOne({
  //     _id: blogId,
  //   });
  //   return result.deletedCount !== 0;
  // }
  //
  // async updateBlog(blogId: string, body: CreateBlogInputDto): Promise<boolean> {
  //   const result: UpdateResult = await this.BlogModel.updateOne(
  //     { _id: blogId },
  //     {
  //       $set: {
  //         name: body.name,
  //         description: body.description,
  //         websiteUrl: body.websiteUrl,
  //       },
  //     },
  //   );
  //   return result.modifiedCount !== 0;
  // }
}
