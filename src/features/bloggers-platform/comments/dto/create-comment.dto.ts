import { CommentatorInfo } from '../domain/comments.entity';

export class CreateCommentDto {
  content: string;
  postId: string;
  commentatorInfo: { userId: string; userLogin: string };
}
