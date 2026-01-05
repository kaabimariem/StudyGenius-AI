import { IsObject, IsNotEmpty } from 'class-validator';

export class SubmitExamDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<number, string | string[]>; // questionId -> réponse(s)
}


