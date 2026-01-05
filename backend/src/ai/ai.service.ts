import { Injectable } from '@nestjs/common';
import { AnalyzeTextDto } from './dto/analyze-text.dto';
import { GenerateQcmDto } from './dto/generate-qcm.dto';
import { QcmResponseDto, QcmQuestion } from './dto/qcm-response.dto';
import { MulterFile } from '../common/types/multer-file.interface';
import '../common/polyfills/pdf-polyfills';

// Fonction pour charger pdf-parse de manière dynamique
async function loadPdfParse() {
  const pdfParseModule = require('pdf-parse');
  // pdf-parse exporte une classe PDFParse, on doit l'instancier
  const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse || pdfParseModule.default || pdfParseModule;
  return PDFParse;
}

@Injectable()
export class AiService {
  /**
   * Analyse un texte et génère un résumé automatique
   * Note: Cette implémentation est basique. Pour une vraie IA, intégrer OpenAI, Claude, etc.
   */
  async analyzeText(analyzeTextDto: AnalyzeTextDto): Promise<{ summary: string; wordCount: number; sentences: number }> {
    const { text } = analyzeTextDto;

    // Compter les mots
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Compter les phrases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    // Générer un résumé basique (première phrase + phrases clés)
    // En production, utiliser une API d'IA comme OpenAI
    const sentencesArray = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentencesArray[0] || '';
    const keySentences = sentencesArray.slice(1, Math.min(3, sentencesArray.length - 1));
    const summary = [firstSentence, ...keySentences].join('. ').trim() + '.';

    return {
      summary: summary || 'Résumé non disponible',
      wordCount,
      sentences,
    };
  }

  /**
   * Analyse un document (extrait le texte et génère un résumé)
   * Supporte les PDFs et fichiers texte
   */
  async analyzeDocument(file: MulterFile): Promise<{ summary: string; wordCount: number; sentences: number }> {
    let text = '';

    // Vérifier le type de fichier
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      // Extraire le texte du PDF
      try {
        const PDFParse = await loadPdfParse();
        const pdfParser = new PDFParse({ data: file.buffer });
        const pdfData = await pdfParser.getText();
        text = pdfData.text;
      } catch (error) {
        throw new Error('Erreur lors de l\'extraction du texte du PDF: ' + (error as Error).message);
      }
    } else if (file.mimetype.includes('text') || file.originalname.toLowerCase().endsWith('.txt')) {
      // Lire le fichier texte
      text = file.buffer.toString('utf-8');
    } else {
      throw new Error('Type de fichier non supporté. Veuillez utiliser un PDF ou un fichier texte (.txt)');
    }

    // Nettoyer le texte
    const cleanText = text
      .split('')
      .filter(char => {
        const code = char.charCodeAt(0);
        return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanText.length < 50) {
      throw new Error('Le document ne contient pas assez de texte valide');
    }

    // Analyser le texte
    return this.analyzeText({ text: cleanText });
  }

          /**
           * Génère un QCM à partir d'un document
           * Note: En production, utiliser un script Python avancé ou une API IA (OpenAI, Claude)
           */
          async generateQcmFromDocument(generateQcmDto: GenerateQcmDto): Promise<QcmResponseDto> {
            const { documentText, numberOfQuestions = 5 } = generateQcmDto;

            // Nettoyer le texte : supprimer les caractères binaires restants
            const cleanText = documentText
              .split('')
              .filter(char => {
                const code = char.charCodeAt(0);
                return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
              })
              .join('')
              .replace(/\s+/g, ' ') // Normaliser les espaces multiples
              .trim();

            if (cleanText.length < 100) {
              throw new Error('Le texte fourni est trop court ou contient trop de caractères invalides. Veuillez fournir un document texte valide.');
            }

            // Diviser le texte en phrases significatives
            const sentences = cleanText
              .split(/[.!?]+/)
              .map(s => s.trim())
              .filter(s => s.length > 20 && s.length < 500); // Filtrer les phrases trop courtes ou trop longues

    const questions: QcmQuestion[] = [];
    const maxQuestions = Math.min(numberOfQuestions, sentences.length);

    for (let i = 0; i < maxQuestions; i++) {
      const sentence = sentences[i];
      const words = sentence.split(/\s+/);
      
      // Créer une question basée sur la phrase
      let questionText = '';
      if (words.length > 10) {
        questionText = `Quel est le sujet principal de cette phrase : "${sentence.substring(0, 80)}..." ?`;
      } else {
        questionText = `Que signifie cette phrase : "${sentence}" ?`;
      }

      // Générer des options
      const correctAnswer = sentence.length > 100 ? sentence.substring(0, 100) : sentence;
      const options = [
        correctAnswer,
        this.generateWrongOption(sentences, i),
        this.generateWrongOption(sentences, i + 1),
        this.generateWrongOption(sentences, i + 2),
      ];

      // Mélanger les options (sauf la première qui est correcte)
      const shuffledOptions = [options[0], ...this.shuffleArray(options.slice(1))];

      questions.push({
        question: questionText,
        options: shuffledOptions,
        correctAnswer: correctAnswer,
        explanation: `La réponse correcte est basée sur le contenu de la phrase analysée : "${sentence.substring(0, 150)}..."`,
      });
    }

    return {
      questions,
      documentSummary: `Document analysé avec ${sentences.length} phrases clés. ${maxQuestions} questions générées.`,
    };
  }

  /**
   * Génère une option incorrecte à partir d'autres phrases
   */
  private generateWrongOption(sentences: string[], index: number): string {
    if (sentences.length > index && index >= 0) {
      const sentence = sentences[index];
      return sentence.length > 100 ? sentence.substring(0, 100) : sentence;
    }
    return 'Cette option ne correspond pas au contenu du document';
  }

  /**
   * Mélange un tableau
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Génère un QCM basique si le script Python échoue
   */
  private generateBasicQcm(text: string, numberOfQuestions: number): QcmResponseDto {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const questions: QcmQuestion[] = [];

    for (let i = 0; i < Math.min(numberOfQuestions, sentences.length); i++) {
      const sentence = sentences[i].trim();
      questions.push({
        question: `Question ${i + 1}: Quel est le sujet principal de cette phrase ? "${sentence.substring(0, 100)}..."`,
        options: [
          sentence.substring(0, 80),
          'Autre sujet 1',
          'Autre sujet 2',
          'Autre sujet 3',
        ],
        correctAnswer: sentence.substring(0, 80),
        explanation: `La réponse correcte est basée sur le contenu de la phrase analysée.`,
      });
    }

    return {
      questions,
      documentSummary: `Document analysé avec ${sentences.length} phrases clés. QCM généré automatiquement.`,
    };
  }
}

