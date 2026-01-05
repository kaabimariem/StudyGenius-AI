import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AnalyzeTextDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  language?: string;
}


