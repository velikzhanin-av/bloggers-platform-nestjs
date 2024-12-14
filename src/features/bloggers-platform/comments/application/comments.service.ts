import { Injectable } from '@nestjs/common';
import { CreateCommentServiceDto } from '../dto/create-comment-service.dto';
import { UserDocument } from '../../../user-accounts/domain/users.entity';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comments.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async createCommentByPostId(dto: CreateCommentServiceDto) {
    const user: UserDocument | null =
      await this.usersRepository.findOrNotFoundFail(dto.userId);
    const CreateCommentDto: CreateCommentDto = {
      content: dto.content,
      postId: dto.postId,
      commentatorInfo: {
        userId: dto.userId,
        userLogin: user!.login,
      },
    };

    const comment: CommentDocument =
      this.CommentModel.createInstance(CreateCommentDto);
    await this.commentsRepository.save(comment);
  }
}
