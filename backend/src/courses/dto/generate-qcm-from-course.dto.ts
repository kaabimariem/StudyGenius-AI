import { IsNumber, IsOptional, Min } from 'class-validator';

export class GenerateQcmFromCourseDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  numberOfQuestions?: number;
}


