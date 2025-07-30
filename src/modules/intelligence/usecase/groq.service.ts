import { Injectable, BadRequestException } from '@nestjs/common';
import { Groq } from 'groq-sdk'; // npm install groq-sdk
import * as pdfParse from 'pdf-parse'; // npm install pdf-parse
import { Readable } from 'stream';

@Injectable()
export class GroqService {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }

    /**
     * Extracts text from a PDF buffer.
     * @param pdfBuffer Buffer containing PDF data.
     */
    private async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
        try {
            const data = await pdfParse(pdfBuffer);
            return data.text;
        } catch (error) {
            throw new BadRequestException('Failed to parse PDF');
        }
    }

    /**
     * Sends the extracted text to Groq AI to extract CV information.
     * @param cvText The extracted text from the CV PDF.
     */
    private async extractCvInfoWithGroq(cvText: string): Promise<any> {
        const prompt = `
You are an expert at parsing CVs. Given the following CV text, extract the following information in a JSON object:
{
  "name": "",
  "email": "",
  "phone": "",
  "address": "",
  "sex": "",
  "ABOUTME": "",
   "CONTACT": "",
   "SocialMediaaddresses":[],
   "interests":[],
   "portfolio":[],
   "LANGUAGES":[],
   "Projects":[],
  "skills": [],
  "experience": [],
  "education": [],
  "certificates": []
}
- "experience" should be an array of objects with fields: company, position, startDate, endDate, description.
- "education" should be an array of objects with fields: institution, degree, field, startDate, endDate.
- "certificates" should be an array of objects with fields: name, issuer, date.
If any field is missing, leave it as an empty string or empty array.

CV Text:
${cvText}
Return only the JSON object I want a json object That I can parse latter using JSON.parse(content)
    `.trim();



        // The response should be a JSON string
        try {
            // Use a currently supported Groq model, e.g., 'llama-2-70b-4096'
            // Use a currently available Groq model, e.g., 'mixtral-8x7b-32768'
            const response = await this.groq.chat.completions.create({
                model: 'llama-3.1-8b-instant', // Updated to a supported Groq model
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that extracts structured data from CVs.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.2,
                max_tokens: 4096,
            });
            let content = response.choices[0].message.content;
            const result = this.extractJsonObjectFromString(content);
            return result;
        } catch (e) {
            throw new BadRequestException('Failed to parse Groq response as JSON' + e);
        }
    }
    private extractJsonObjectFromString(input: string) {
        console.log('Input received:', input);
        console.log('Input length:', input.length);
        
        // Replace literal \n with real newlines
        const normalizedInput = input.replace(/\\n/g, '\n'); // replaces literal backslash-n with actual newline
        console.log('Normalized input:', normalizedInput);
        
        // First try to match complete markdown code blocks
        let match = normalizedInput.match(/```json\s*([\s\S]*?)\s*```/i);
        console.log('First match attempt:', match);
        
        if (!match) {
            // If no complete code block found, try to extract JSON after ```json
            match = normalizedInput.match(/```json\s*([\s\S]*)/i);
            console.log('Second match attempt:', match);
        }
        
        if (!match) {
            // If still no match, try to find JSON object directly
            match = normalizedInput.match(/\{[\s\S]*\}/);
            console.log('Third match attempt:', match);
        }
        
        if (!match) {
            console.log('No JSON found in input');
            throw new Error('No JSON block found');
        }
    
        const jsonString = match[1] || match[0];
        console.log('Extracted JSON string:', jsonString);
        
        // Try to parse the JSON string
        try {
            return JSON.parse(jsonString);
        } catch (parseError) {
            console.log('JSON parse error:', parseError);
            console.log('JSON string length:', jsonString.length);
            console.log('Last 100 characters:', jsonString.slice(-100));
            
            // If JSON is incomplete, try to find the last complete object
            const lastBraceIndex = jsonString.lastIndexOf('}');
            if (lastBraceIndex > 0) {
                const truncatedJson = jsonString.substring(0, lastBraceIndex + 1);
                console.log('Attempting to parse truncated JSON:', truncatedJson);
                try {
                    return JSON.parse(truncatedJson);
                } catch (truncatedError) {
                    console.log('Truncated JSON also failed:', truncatedError);
                    throw new Error(`Failed to parse JSON: ${parseError.message}. The response appears to be truncated.`);
                }
            }
            
            throw new Error(`Failed to parse JSON: ${parseError.message}`);
        }
    }
    
    /**
     * Main method to process a PDF buffer and return extracted CV info.
     * @param pdfBuffer Buffer containing the PDF file.
     */

    async extractCvInfoFromPdf(pdfBuffer: Buffer): Promise<any> {
        const cvText = await this.extractTextFromPdf(pdfBuffer);
        return await this.extractCvInfoWithGroq(cvText);
    }
}