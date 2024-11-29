import {NotFoundException} from "@nestjs/common";
import {BlogViewDto} from "../../api/output-dto/blogs.view-dto";
import {Blog, BlogDocument, BlogModelType} from "../../domain/blogs.entity";
import {InjectModel} from "@nestjs/mongoose";
import {User} from "../../../../user-accounts/domain/users.entity";

export class BlogsQueryRepository {
    constructor(
        @InjectModel(Blog.name)
        private BlogModel: BlogModelType
    ) {}

    async getByIdOrNotFoundFail(blogId: string): Promise<BlogViewDto> {
        const blog: BlogDocument | null = await this.BlogModel.findOne({_id: blogId});
        if (!blog) {
            throw new NotFoundException('blog not found');
        }

        return BlogViewDto.mapToView(blog)

    }
}