/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly API_KEY = process.env.GEMINI_API_KEY;
  private readonly API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`;
  // or, if you have access: gemini-1.5-pro

  async ask(question: string): Promise<string> {
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: question }],
        },
      ],
    };
    try {
      const response = await axios.post(this.API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Gemini's response structure: check for the output in the first candidate
      const result =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No response from Gemini';
      const match =
        result.match(/```json\s*([\s\S]*?)\s*```/i) ||
        result.match(/```([\s\S]*?)\s*```/i);
      const jsonString = match ? match[1] : result;
      let jobDescription;
      try {
        jobDescription = JSON.parse(jsonString);
      } catch (e) {
        // fallback: try to find and extract the first {...} block
        const curlyMatch = jsonString.match(/{[\s\S]+}/);
        if (curlyMatch) {
          jobDescription = JSON.parse(curlyMatch[0]);
        } else {
          throw new Error('Failed to extract JSON');
        }
      }
      return jobDescription;
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error('Gemini API request failed');
    }
  }
  async match(question: string): Promise<string> {
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: question }],
        },
      ],
    };
    try {
      const response = await axios.post(this.API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Gemini's response structure: check for the output in the first candidate
      const result =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No response from Gemini';
      const match =
        result.match(/```json\s*([\s\S]*?)\s*```/i) ||
        result.match(/```([\s\S]*?)\s*```/i);
      const jsonString = match ? match[1] : result;
      let jobDescription;
      try {
        jobDescription = JSON.parse(jsonString);
      } catch (e) {
        // fallback: try to find and extract the first {...} block
        const curlyMatch = jsonString.match(/{[\s\S]+}/);
        if (curlyMatch) {
          jobDescription = JSON.parse(curlyMatch[0]);
        } else {
          throw new Error('Failed to extract JSON');
        }
      }
      return jobDescription;
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error('Gemini API request failed');
    }
  }
  catch(error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw new Error('Gemini API request failed');
  }
}
