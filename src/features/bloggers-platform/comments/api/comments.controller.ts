import {Body, Controller, Delete, Injectable, Param, Put, UseGuards} from '@nestjs/common';
import {CommandBus} from "@nestjs/cqrs";
import {DeleteCommentByIdCommand} from "../application/use-cases/delete-comment-by-id.use-case";
import {ExtractUserFromRequest} from "../../../../core/decorators/extract-user-from-request";
import {UserContext} from "../../../../core/dto/user-context";
import {JwtAuthGuard} from "../../../../core/guards/jwt-auth.guard";
import {CreateCommentInputDto} from "./input-dto/create-comment.dto";
import {UpdateCommentByIdCommand} from "../application/use-cases/update-comment-by-id.use-case";
import {UpdateLikeStatusCommentDto} from "./input-dto/update-like-status-comment.dto";
import {UpdateLikeStatusCommand} from "../application/use-cases/update-like-status.use-case";
import {CommentDocument} from "../domain/comments.entity";

@Controller('/comments')
export class CommentsController {
  constructor(private readonly commandBus: CommandBus,) {
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  async deleteCommentById(@ExtractUserFromRequest() user: UserContext,
                          @Param('commentId') commentId: string): Promise<void> {
    return await this.commandBus.execute(new DeleteCommentByIdCommand({commentId, userId: user.userId}));
  };

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  async putCommentById(@ExtractUserFromRequest() user: UserContext,
                       @Param('commentId') commentId: string,
                       @Body() body: CreateCommentInputDto): Promise<void> {

    return await this.commandBus.execute(new UpdateCommentByIdCommand({
      commentId,
      userId: user.userId,
      content: body.content
    }));
  }

  @Put(':commentId/like-status')
  @UseGuards(JwtAuthGuard)
  async putLikeStatusCommentById(@ExtractUserFromRequest() user: UserContext,
                                 @Param('commentId') commentId: string,
                                 @Body() body: UpdateLikeStatusCommentDto) {
    const result = await this.commandBus.execute(new UpdateLikeStatusCommand({commentId, userId: user.userId, likeStatus: body.likeStatus});



  }
}
