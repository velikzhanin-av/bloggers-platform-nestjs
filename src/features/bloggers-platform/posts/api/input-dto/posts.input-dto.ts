import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogIsExist } from '../../../../../core/decorators/blog-is-exist';

export class CreatePostByBlogIdInputDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MaxLength(30)
  title: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

export class CreatePostInputDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @MaxLength(30)
  title: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @MaxLength(100)
  shortDescription: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @MaxLength(1000)
  content: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  // @BlogIsExist()
  blogId: string;
}
