import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogDBType } from '../../domain/types';
import { CreateBlogInputDto } from '../../api/input-dto/blogs.input-dto';
import { DeletionStatus } from '../../../../../core/utils/status-enam';
import { UserDocument } from '../../../../user-accounts/domain/users.entity';

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

  async findOrNotFoundFail(blogId: string): Promise<BlogDBType | null> {
    const blog = await this.dataSource.query(
      `SELECT *
       FROM blogs
       WHERE id = $1
         AND "deletionStatus" != $2`,
      [blogId, DeletionStatus.PermanentDeleted],
    );
    return blog[0] ?? null;
  }

  async updateBlog(blogId: string, body: CreateBlogInputDto): Promise<void> {
    await this.dataSource.query(
      `
          UPDATE blogs
          SET name         = $1,
              description  = $2,
              "websiteUrl" = $3
          WHERE id = $4
            AND "deletionStatus" != $5;`,
      [
        body.name,
        body.description,
        body.websiteUrl,
        blogId,
        DeletionStatus.PermanentDeleted,
      ],
    );
  }

  async deleteBlog(blogId: string): Promise<void> {
    await this.dataSource.query(
      `
          UPDATE blogs
          SET "deletionStatus" = $2
          WHERE id = $1;`,
      [blogId, DeletionStatus.PermanentDeleted],
    );
  }
}
