import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class GenerateQcmDto {
  @IsString()
  @IsNotEmpty()
  documentText: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  numberOfQuestions?: number;
}


