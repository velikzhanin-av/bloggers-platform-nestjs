import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsQueryRepository } from '../../features/bloggers-platform/blogs/infrastructure/query/blogs.query-repository';
import { BlogViewDto } from '../../features/bloggers-platform/blogs/api/output-dto/blogs.view-dto';
import { Injectable } from '@nestjs/common';
import {
  CommentsQueryRepository
} from "../../features/bloggers-platform/comments/infrastructure/comments-query.repository";

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const blog: BlogViewDto | null =
      await this.blogsQueryRepository.getByIdOrNotFoundFail(value);
    if (!blog) return false;
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `BlogId ${validationArguments?.value} not exist`;
  }
}

export function BlogIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: String(propertyName),
      options: validationOptions,
      constraints: [property],
      validator: BlogIsExistConstraint,
    });
  };
}
