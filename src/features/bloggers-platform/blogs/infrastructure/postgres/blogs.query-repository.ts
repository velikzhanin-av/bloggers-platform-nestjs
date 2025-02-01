import { BlogViewDto } from '../../api/output-dto/blogs.view-dto';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Query } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { DataSource } from 'typeorm';
import { DeletionStatus } from '../../../../../core/utils/status-enam';
import { UserViewDto } from '../../../../user-accounts/api/output-dto/users.view-dto';
import { BlogDBType } from '../../domain/types';

@Injectable()
export class BlogsQueryRepositorySql {
  constructor(private readonly dataSource: DataSource) {}

  async findAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const skip: number = (query.pageNumber - 1) * query.pageSize;

    const blogs = await this.dataSource.query(
      `SELECT *
       FROM blogs
       WHERE "deletionStatus" != $1
         AND name ILIKE '%' || $4 || '%'
       ORDER BY "${query.sortBy}" ${query.sortDirection}
       LIMIT $3 OFFSET $2`,
      [
        DeletionStatus.PermanentDeleted,
        skip,
        query.pageSize,
        query.searchNameTerm,
      ],
    );

    const counts = await this.dataSource.query(
      `SELECT COUNT(*)
       FROM blogs
       WHERE "deletionStatus" != $1
         AND name ILIKE '%' || $2 || '%'`,
      [DeletionStatus.PermanentDeleted, query.searchNameTerm],
    );

    const totalCount: number = Number(counts[0].count);

    const items: BlogViewDto[] = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getByIdOrNotFoundFail(blogId: string): Promise<BlogViewDto | null> {
    const blog: BlogDBType = await this.dataSource.query(
      `SELECT id, name, description, "websiteUrl", "isMembership", "createdAt"
       FROM blogs
       WHERE "deletionStatus" != $1
         AND id = $2`,
      [DeletionStatus.PermanentDeleted, blogId],
    );
    console.log(blogId);
    return blog ?? null;
  }

  // async findAllBlogs(
  //   @Query() query: GetBlogsQueryParams,
  // ): Promise<PaginatedViewDto<BlogViewDto[]>> {
  //   const filter: FilterQuery<Blog> = {};
  //
  //   if (query.searchNameTerm) {
  //     filter.$or = filter.$or || [];
  //     filter.$or.push({
  //       name: { $regex: query.searchNameTerm, $options: 'i' },
  //     });
  //   }
  //
  //   const blogs: BlogDocument[] | null = await this.BlogModel.find({
  //     ...filter,
  //   })
  //     .sort({ [query.sortBy]: query.sortDirection })
  //     .skip(query.calculateSkip())
  //     .limit(query.pageSize);
  //
  //   const totalCount: number = await this.BlogModel.countDocuments(filter);
  //
  //   const items: BlogViewDto[] = blogs.map(BlogViewDto.mapToView);
  //
  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }
  //
  // async getByIdOrNotFoundFail(blogId: string): Promise<BlogViewDto | null> {
  //   const blog: BlogDocument | null = await this.BlogModel.findOne({
  //     _id: blogId,
  //   });
  //   if (!blog) return null;
  //   return BlogViewDto.mapToView(blog);
  // }
}
