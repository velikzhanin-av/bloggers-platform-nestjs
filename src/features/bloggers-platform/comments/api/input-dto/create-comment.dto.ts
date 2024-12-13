import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCommentInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @MinLength(20)
  content: string;
}