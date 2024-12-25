import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogInputDto {
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim()) // Удаляем пробелы по краям строки
  @IsString()
  @MaxLength(15)
  name: string;
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(500)
  description: string;
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Matches('^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$')
  @MaxLength(100)
  websiteUrl: string;
}
