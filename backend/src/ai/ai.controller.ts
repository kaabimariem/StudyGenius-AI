import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { AnalyzeTextDto } from './dto/analyze-text.dto';
import { GenerateQcmDto } from './dto/generate-qcm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MulterFile } from '../common/types/multer-file.interface';
import '../common/polyfills/pdf-polyfills';

// Fonction pour charger pdf-parse de manière dynamique
async function loadPdfParse() {
  const pdfParseModule = require('pdf-parse');
  // pdf-parse exporte une classe PDFParse, on doit l'instancier
  const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse || pdfParseModule.default || pdfParseModule;
  return PDFParse;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-text')
  @UseGuards(JwtAuthGuard)
  analyzeText(@Body() analyzeTextDto: AnalyzeTextDto) {
    return this.aiService.analyzeText(analyzeTextDto);
  }

  @Post('analyze-document')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  analyzeDocument(@UploadedFile() file: MulterFile) {
    return this.aiService.analyzeDocument(file);
  }

  @Post('generate-qcm')
  @UseGuards(JwtAuthGuard)
  generateQcm(@Body() generateQcmDto: GenerateQcmDto) {
    return this.aiService.generateQcmFromDocument(generateQcmDto);
  }

  @Post('generate-qcm-from-document')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async generateQcmFromDocumentFile(
    @UploadedFile() file: MulterFile,
    @Body('numberOfQuestions') numberOfQuestions?: number,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    let documentText = '';

    // Vérifier le type de fichier
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      // Extraire le texte du PDF
      try {
        const PDFParse = await loadPdfParse();
        const pdfParser = new PDFParse({ data: file.buffer });
        const pdfData = await pdfParser.getText();
        documentText = pdfData.text;
      } catch (error) {
        throw new BadRequestException('Erreur lors de l\'extraction du texte du PDF: ' + (error as Error).message);
      }
    } else if (file.mimetype.includes('text') || file.originalname.toLowerCase().endsWith('.txt') || 
               file.originalname.toLowerCase().endsWith('.md') || file.originalname.toLowerCase().endsWith('.csv')) {
      // Lire le fichier texte
      documentText = file.buffer.toString('utf-8');
    } else {
      throw new BadRequestException('Type de fichier non supporté. Veuillez utiliser un PDF ou un fichier texte (.txt, .md, .csv)');
    }

    // Nettoyer le texte
    const cleanText = documentText
      .split('')
      .filter(char => {
        const code = char.charCodeAt(0);
        return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length < 100) {
      throw new BadRequestException('Le document ne contient pas assez de texte valide pour générer un QCM');
    }

    const generateQcmDto: GenerateQcmDto = {
      documentText: cleanText,
      numberOfQuestions: numberOfQuestions ? parseInt(numberOfQuestions.toString(), 10) : 5,
    };
    return this.aiService.generateQcmFromDocument(generateQcmDto);
  }
}

