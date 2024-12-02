export class CreatePostByBlogIdInputDto {
  title: string;
  shortDescription: string;
  content: string;
}

export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
