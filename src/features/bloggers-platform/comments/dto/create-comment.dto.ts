export class CreateCommentDto {
  content: string;
  postId: string;
  commentatorInfo: { userId: string; userLogin: string };
}
