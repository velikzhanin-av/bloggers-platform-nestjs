import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';

@Controller('blogs')
export class BlogsController {
  constructor() {}

  @Get()
  async getBlogs() {
    return { data: 'blogs' };
    // throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
