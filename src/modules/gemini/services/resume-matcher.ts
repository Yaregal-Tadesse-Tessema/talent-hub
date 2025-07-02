/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import { OpenAI } from 'openai';
import { GeminiService } from './gemini';
// import * as fs from 'fs';

@Injectable()
export class ResumeMatchingService {
  private openai: OpenAI;

  constructor(private readonly geminiService: GeminiService) {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    const text = data.text.replace(/(\r?\n){2,}/g, '\n').trim();
    return text;
  }

  keywordScore(resumeText: string, keywords: string[]): number {
    const text = resumeText.toLowerCase();
    return keywords.reduce(
      (score, kw) => score + (text.includes(kw.toLowerCase()) ? 1 : 0),
      0,
    );
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (!this.openai) throw new Error('OpenAI not configured');
    const res = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return res.data[0].embedding;
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async matchResumes(
    files: Express.Multer.File[],
    jobDescription: string,
    useAI = false,
  ): Promise<
    { filename: string; keywordScore: number; aiSimilarity?: number }[]
  > {
    const jobKeywords = jobDescription.match(/\b\w+\b/g)?.slice(0, 100) || [];

    let jobEmbedding: number[] = [];
    if (useAI && this.openai) {
      jobEmbedding = await this.getEmbedding(jobDescription);
    }

    const results = [];
    for (const file of files) {
      const text = await this.extractTextFromPDF(file.buffer);
      const keywordScore = this.keywordScore(text, jobKeywords);

      let aiSimilarity: number | undefined = undefined;
      if (useAI && this.openai) {
        const resumeEmbedding = await this.getEmbedding(text);
        aiSimilarity = this.cosineSimilarity(jobEmbedding, resumeEmbedding);
      }

      results.push({
        filename: file.originalname,
        keywordScore,
        ...(useAI && this.openai ? { aiSimilarity } : {}),
      });
    }

    // Sort by aiSimilarity if present, else by keywordScore
    results.sort((a, b) =>
      b.aiSimilarity && a.aiSimilarity
        ? b.aiSimilarity - a.aiSimilarity
        : b.keywordScore - a.keywordScore,
    );

    return results;
  }
  async matchResume(
    file: Express.Multer.File,
    jobDescription: string,
    useAI = false,
  ): Promise<{
    filename: string;
    keywordScore: number;
    aiSimilarity?: number;
  }> {
    const jobKeywords = jobDescription.match(/\b\w+\b/g)?.slice(0, 100) || [];

    let jobEmbedding: number[] = [];
    if (useAI && this.openai) {
      jobEmbedding = await this.getEmbedding(jobDescription);
    }

    const text = await this.extractTextFromPDF(file.buffer);
    const keywordScore = this.keywordScore(text, jobKeywords);

    let aiSimilarity: number | undefined = undefined;
    if (useAI && this.openai) {
      const resumeEmbedding = await this.getEmbedding(text);
      aiSimilarity = this.cosineSimilarity(jobEmbedding, resumeEmbedding);
    }

    const results = {
      filename: file.originalname,
      keywordScore,
      ...(useAI && this.openai ? { aiSimilarity } : {}),
    };
    // Sort by aiSimilarity if present, else by keywordScore
    // results.sort((a, b) =>
    //   b.aiSimilarity && a.aiSimilarity
    //     ? b.aiSimilarity - a.aiSimilarity
    //     : b.keywordScore - a.keywordScore,
    // );
    return results;
  }
  async matchingWithAi(
    file: Express.Multer.File,
    jobDescription: string,
  ): Promise<any> {
    try {
      const text = await this.extractTextFromPDF(file.buffer);
      text.replace(/[^a-zA-Z0-9\s.,@+]/g, ' ');
      const result: any = await this.geminiService.match(
        `Give matching result as JSON with keys: score:number and description: for the job desctiption : ${jobDescription} and resume : ${text} `,
      );
      let score = result?.score;
      if (score || score !== 0) {
        score = score * 100;
        result.score = score;
      }
      return result;
    } catch (error) {
      return null;
    }
  }
}
