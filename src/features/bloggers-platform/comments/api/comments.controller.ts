import { Controller, Injectable } from '@nestjs/common';
import { CommentsService } from '../application/comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
}
