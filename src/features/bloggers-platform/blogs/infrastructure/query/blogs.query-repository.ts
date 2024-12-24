import { BlogViewDto } from '../../api/output-dto/blogs.view-dto';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Query } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly BlogModel: BlogModelType,
  ) {}

  async findAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const filter: FilterQuery<Blog> = {};

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        name: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const blogs: BlogDocument[] | null = await this.BlogModel.find({
      ...filter,
    })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount: number = await this.BlogModel.countDocuments(filter);

    const items: BlogViewDto[] = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getByIdOrNotFoundFail(blogId: string): Promise<BlogViewDto | null> {
    const blog: BlogDocument | null = await this.BlogModel.findOne({
      _id: blogId,
    });
    if (!blog) return null;
    return BlogViewDto.mapToView(blog);
  }
}
