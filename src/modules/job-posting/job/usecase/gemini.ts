/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class GeminiService {
  private readonly API_KEY = process.env.GEMINI_API_KEY;
  private readonly API_URL = `https://generativelanguage.googleapis.com/v1beta2/models/embedding-gecko-001:generateEmbedding?key=${this.API_KEY}`;
  async ask(question: string): Promise<string> {
    const payload = {
      prompt: {
        messages: [{ author: 'user', content: 'Say hello in Amharic' }],
      },
      temperature: 0.7,
      candidateCount: 1,
    };
    try {
      const response = await axios.post(this.API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = response.data?.candidates?.[0]?.output;
      return result ?? 'No response from Gemini';
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error('Gemini API request failed');
    }
  }
}
