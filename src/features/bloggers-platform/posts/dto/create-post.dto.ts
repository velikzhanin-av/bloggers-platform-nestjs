import { extendedLikesInfo } from '../domain/posts.entity';

export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  // extendedLikesInfo: extendedLikesInfo;
}
