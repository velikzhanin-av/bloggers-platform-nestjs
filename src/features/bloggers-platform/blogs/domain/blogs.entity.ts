import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {CreateBlogDto} from "../dto/create-blog.dto";
import {HydratedDocument, Model} from "mongoose";

@Schema({timestamps: true})
export class Blog {
    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, required: true})
    description: string;

    @Prop({type: String, required: true})
    websiteUrl: string;

    @Prop({type: Date})
    createdAt: Date;

    @Prop({type: Boolean, required: true})
    isMembership: boolean;

    static createInstance(dto: CreateBlogDto): BlogDocument {
        const blog = new this()
        blog.name = dto.name;
        blog.description = dto.description;
        blog.websiteUrl = dto.websiteUrl;
        blog.isMembership = false

        return blog as BlogDocument;
    }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;

