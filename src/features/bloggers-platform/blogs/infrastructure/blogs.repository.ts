import {Injectable} from "@nestjs/common";
import {BlogDocument} from "../domain/blogs.entity";

@Injectable()
export class BlogsRepository {
    constructor() {
    }

    async save(blog: BlogDocument): Promise<void> {
        await blog.save()
    }
}