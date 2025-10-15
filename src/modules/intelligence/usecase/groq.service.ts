import { Injectable, BadRequestException } from '@nestjs/common';
import { Groq } from 'groq-sdk'; // npm install groq-sdk
import * as pdfParse from 'pdf-parse'; // npm install pdf-parse
import { Readable } from 'stream';
import * as puppeteer from 'puppeteer';

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

    /**
     * Scrapes job postings from Ethiopian Reporter Jobs website
     * @returns Array of job postings in the specified format
     */
    async scrapeEthiopianReporterJobs(): Promise<any[]> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            console.log('Navigating to Ethiopian Reporter Jobs...');
            await page.goto('https://www.ethiopianreporterjobs.com/jobs-in-ethiopia/', {
                waitUntil: 'networkidle0',
                timeout: 60000
            });

            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 5000));

            console.log('Page loaded, analyzing structure...');
            
            // First, let's analyze the page structure in detail
            const pageInfo = await page.evaluate(() => {
                // Get all possible containers
                const articles = document.querySelectorAll('article');
                const divs = document.querySelectorAll('div');
                const allLinks = document.querySelectorAll('a');
                const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                
                // Find elements with common job-related text
                const jobRelatedElements: any[] = [];
                divs.forEach((div, idx) => {
                    const text = div.textContent || '';
                    if (text.toLowerCase().includes('vacancy') || 
                        text.toLowerCase().includes('position') || 
                        text.toLowerCase().includes('deadline') ||
                        text.toLowerCase().includes('apply')) {
                        if (idx < 50) { // Limit to first 50
                            jobRelatedElements.push({
                                tag: div.tagName,
                                className: div.className,
                                id: div.id,
                                textPreview: text.substring(0, 100)
                            });
                        }
                    }
                });
                
                return {
                    articlesCount: articles.length,
                    totalDivs: divs.length,
                    totalLinks: allLinks.length,
                    totalHeaders: headers.length,
                    bodyClasses: document.body.className,
                    containerClasses: document.querySelector('#content, #main, .content, .main, .container')?.className || 'none',
                    jobRelatedElements: jobRelatedElements.slice(0, 10),
                    allClassesInBody: Array.from(new Set(
                        Array.from(divs).slice(0, 100).map(d => d.className).filter(c => c)
                    )).slice(0, 30),
                    sampleHTML: document.body.innerHTML.substring(0, 3000)
                };
            });

            console.log('=== PAGE STRUCTURE ANALYSIS ===');
            console.log('Articles found:', pageInfo.articlesCount);
            console.log('Total divs:', pageInfo.totalDivs);
            console.log('Total links:', pageInfo.totalLinks);
            console.log('Body classes:', pageInfo.bodyClasses);
            console.log('Container classes:', pageInfo.containerClasses);
            console.log('Classes found in page:', pageInfo.allClassesInBody);
            console.log('Job-related elements:', pageInfo.jobRelatedElements);
            console.log('Sample HTML:', pageInfo.sampleHTML);
            
            // Extract job data from the page with more adaptive selectors
            const jobs = await page.evaluate(() => {
                const extractedJobs: any[] = [];
                
                // Strategy 1: Try standard selectors
                let jobElements = document.querySelectorAll('article');
                console.log(`Strategy 1 (article): ${jobElements.length} elements`);
                
                // Strategy 2: Try WordPress post classes
                if (jobElements.length === 0) {
                    jobElements = document.querySelectorAll('.post, .hentry, .type-post');
                    console.log(`Strategy 2 (WordPress posts): ${jobElements.length} elements`);
                }
                
                // Strategy 3: Try job-specific classes
                if (jobElements.length === 0) {
                    jobElements = document.querySelectorAll('.job-listing, .job-item, .job-post, .listing-item, .vacancy');
                    console.log(`Strategy 3 (job classes): ${jobElements.length} elements`);
                }
                
                // Strategy 4: Try pattern matching on classes
                if (jobElements.length === 0) {
                    jobElements = document.querySelectorAll('[class*="job-"], [class*="post-"], [class*="listing-"]');
                    console.log(`Strategy 4 (pattern matching): ${jobElements.length} elements`);
                }
                
                // Strategy 5: Try finding by structure (divs with h2/h3 links)
                if (jobElements.length === 0) {
                    const potentialJobs = Array.from(document.querySelectorAll('div')).filter(div => {
                        const hasTitle = div.querySelector('h2, h3, h4');
                        const hasLink = div.querySelector('a');
                        const text = div.textContent || '';
                        const hasJobKeywords = text.toLowerCase().includes('deadline') || 
                                               text.toLowerCase().includes('position') ||
                                               text.toLowerCase().includes('vacancy');
                        return hasTitle && hasLink && hasJobKeywords && text.length > 100;
                    });
                    jobElements = potentialJobs as any;
                    console.log(`Strategy 5 (structural matching): ${jobElements.length} elements`);
                }
                
                // Strategy 6: Look for table rows (some sites use tables)
                if (jobElements.length === 0) {
                    jobElements = document.querySelectorAll('table tr, tbody tr');
                    console.log(`Strategy 6 (table rows): ${jobElements.length} elements`);
                }
                
                // Strategy 7: Ultra-broad - find all links and filter by job-related text
                if (jobElements.length === 0) {
                    const allLinks = Array.from(document.querySelectorAll('a'));
                    const jobLinks = allLinks.filter(link => {
                        const href = link.href.toLowerCase();
                        const text = link.textContent?.toLowerCase() || '';
                        return (href.includes('job') || href.includes('vacancy') || href.includes('position') ||
                                text.includes('position') || text.includes('vacancy')) && text.length > 10;
                    });
                    
                    // Group links by parent container
                    const containers = new Set();
                    jobLinks.forEach(link => {
                        let parent = link.parentElement;
                        // Go up 3 levels to find container
                        for (let i = 0; i < 3; i++) {
                            if (parent) parent = parent.parentElement;
                        }
                        if (parent) containers.add(parent);
                    });
                    
                    jobElements = Array.from(containers) as any;
                    console.log(`Strategy 7 (link-based): ${jobElements.length} elements`);
                }

                console.log(`Final: Found ${jobElements.length} potential job elements`);

                jobElements.forEach((jobEl, index) => {
                    try {
                        // Try multiple strategies to find job title
                        let titleEl = jobEl.querySelector('h2 a, h3 a, .entry-title a, .job-title a, h2, h3, .entry-title, .job-title');
                        if (!titleEl) {
                            titleEl = jobEl.querySelector('a[href*="job"], a[href*="vacancy"], a[href*="position"]');
                        }
                        
                        const jobTitle = titleEl?.textContent?.trim() || '';
                        const jobLink = titleEl && titleEl.tagName === 'A' ? (titleEl as HTMLAnchorElement).href : 
                                       (jobEl.querySelector('a')as HTMLAnchorElement)?.href || '';

                        // Skip if no title found
                        if (!jobTitle || jobTitle.length < 3) {
                            console.log(`Skipping element ${index}: No valid title`);
                            return;
                        }

                        // Extract all text content for analysis
                        const fullText = jobEl.textContent || '';
                        
                        // Try to find company/organization name
                        let tenantName = '';
                        const companyPatterns = [
                            jobEl.querySelector('.company, .company-name, .organization, .employer, .posted-by'),
                            jobEl.querySelector('[class*="company"], [class*="organization"], [class*="employer"]'),
                            jobEl.querySelector('strong, b, .meta')
                        ];
                        
                        for (const el of companyPatterns) {
                            if (el && el.textContent && el.textContent.trim().length > 0) {
                                tenantName = el.textContent.trim();
                                break;
                            }
                        }

                        // Extract deadline/closing date
                        let deadline = '';
                        const deadlinePatterns = [
                            jobEl.querySelector('.deadline, .expiry, .closing-date, .expire-date, time'),
                            jobEl.querySelector('[class*="deadline"], [class*="expiry"], [class*="closing"]')
                        ];
                        
                        for (const el of deadlinePatterns) {
                            if (el && el.textContent) {
                                deadline = el.textContent.trim();
                                break;
                            }
                        }
                        
                        // Try to extract from text if not found
                        if (!deadline) {
                            const deadlineMatch = fullText.match(/deadline:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
                                                 fullText.match(/closes?:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i) ||
                                                 fullText.match(/until:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
                            if (deadlineMatch) {
                                deadline = deadlineMatch[1];
                            }
                        }

                        // Extract location
                        let tenantAddress = '';
                        const locationEl = jobEl.querySelector('.location, .address, .job-location, [class*="location"]');
                        if (locationEl) {
                            tenantAddress = locationEl.textContent?.trim() || '';
                        }
                        
                        // Extract job type
                        let jobType = 'Full Time';
                        const jobTypeEl = jobEl.querySelector('.job-type, .employment-type, .type, [class*="job-type"]');
                        if (jobTypeEl) {
                            jobType = jobTypeEl.textContent?.trim() || 'Full Time';
                        } else if (fullText.toLowerCase().includes('part time')) {
                            jobType = 'Part Time';
                        } else if (fullText.toLowerCase().includes('contract')) {
                            jobType = 'Contract';
                        }

                        // Extract category/industry
                        let industry = '';
                        const categoryEl = jobEl.querySelector('.category, .categories, .industry, .sector, [class*="categor"]');
                        if (categoryEl) {
                            industry = categoryEl.textContent?.trim() || '';
                        }

                        // Extract description/excerpt
                        let description = '';
                        const descEl = jobEl.querySelector('.excerpt, .summary, .description, .entry-summary, p');
                        if (descEl) {
                            description = descEl.textContent?.trim() || '';
                        } else {
                            // Use full text as fallback, limit to 500 chars
                            description = fullText.substring(0, 500).trim();
                        }

                        console.log(`Extracted job ${index + 1}: ${jobTitle}`);

                        extractedJobs.push({
                            jobTitle,
                            tenantName: tenantName || 'Not Specified',
                            tenantAddress: tenantAddress || 'Addis Ababa, Ethiopia',
                            jobType,
                            industry: industry || 'General',
                            description,
                            deadline,
                            jobLink,
                            fullText: fullText.substring(0, 1000) // Keep more text for better parsing
                        });
                    } catch (err) {
                        console.error(`Error parsing job element ${index}:`, err);
                    }
                });

                return extractedJobs;
            });

            console.log(`Successfully extracted ${jobs.length} job listings`);

            if (jobs.length === 0) {
                console.error('❌ NO JOBS FOUND!');
                console.error('This likely means the page structure is different than expected.');
                console.error('Check the console logs above for page structure analysis.');
                
                // Return debug information
                throw new BadRequestException(
                    `No jobs found on the page. Debug info: Found ${pageInfo.articlesCount} articles, ` +
                    `${pageInfo.totalDivs} divs, ${pageInfo.totalLinks} links. ` +
                    `Check server logs for detailed HTML structure.`
                );
            }

            // Transform the scraped data to match the required format
            const formattedJobs = jobs.map(job => ({
                tenantName: job.tenantName || 'Not Specified',
                tenantAddress: job.tenantAddress || 'Addis Ababa, Ethiopia',
                tenantPhone: this.extractPhone(job.fullText) || null,
                jobType: this.normalizeJobType(job.jobType),
                worktype: this.extractWorkType(job.fullText),
                jobTitle: job.jobTitle,
                experienceLevel: this.extractExperienceLevel(job.fullText),
                jobRequirement: this.extractRequirements(job.fullText),
                responsibilities: this.extractResponsibilities(job.fullText),
                howToApply: this.extractHowToApply(job.fullText),
                email: this.extractEmail(job.fullText),
                skills: this.extractSkills(job.fullText),
                description: job.description,
                position: job.jobTitle,
                industry: job.industry || 'General',
                deadline: this.normalizeDeadline(job.deadline),
                gender: this.extractGender(job.fullText),
                numberOfPosition: this.extractNumberOfPositions(job.fullText),
                requiredYearOfExperience: this.extractYearsOfExperience(job.fullText),
                isAdminCreated: true,
                jobLink: job.jobLink
            }));

            await browser.close();
            return formattedJobs;
        } catch (error) {
            await browser.close();
            throw new BadRequestException(`Failed to scrape jobs: ${error.message}`);
        }
    }

    /**
     * Helper method to normalize job type
     */
    private normalizeJobType(jobType: string): string {
        const type = jobType.toLowerCase();
        if (type.includes('full') || type.includes('permanent')) return 'Full Time';
        if (type.includes('part')) return 'Part Time';
        if (type.includes('contract')) return 'Contract';
        if (type.includes('intern')) return 'Internship';
        return 'Full Time';
    }

    /**
     * Helper method to extract experience level from job description
     */
    private extractExperienceLevel(text: string): string {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('senior') || lowerText.includes('expert') || lowerText.includes('lead')) {
            return 'Senior';
        }
        if (lowerText.includes('junior') || lowerText.includes('entry')) {
            return 'Junior';
        }
        if (lowerText.includes('mid') || lowerText.includes('intermediate')) {
            return 'Mid';
        }
        return 'Mid';
    }

    /**
     * Helper method to extract years of experience
     */
    private extractYearsOfExperience(text: string): number {
        const match = text.match(/(\d+)\s*(?:\+)?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/i);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Helper method to extract email from text
     */
    private extractEmail(text: string): string | null {
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return emailMatch ? emailMatch[0] : null;
    }

    /**
     * Helper method to extract phone number from text
     */
    private extractPhone(text: string): string | null {
        const phonePatterns = [
            /(?:\+251|0)\s*\d{9,10}/,  // Ethiopian phone format
            /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,  // General format
            /\(?0\d{2,3}\)?[-.\s]?\d{6,7}/  // Alternative format
        ];
        
        for (const pattern of phonePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[0].trim();
            }
        }
        return null;
    }

    /**
     * Helper method to extract work type from text
     */
    private extractWorkType(text: string): string {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('remote') || lowerText.includes('work from home')) {
            return 'Remote';
        }
        if (lowerText.includes('hybrid')) {
            return 'Hybrid';
        }
        return 'On Site';
    }

    /**
     * Helper method to extract how to apply instructions
     */
    private extractHowToApply(text: string): string {
        const lowerText = text.toLowerCase();
        const applyIndex = lowerText.indexOf('how to apply');
        const applicationIndex = lowerText.indexOf('application');
        const applyByIndex = lowerText.indexOf('apply');
        
        let startIndex = -1;
        if (applyIndex !== -1) startIndex = applyIndex;
        else if (applicationIndex !== -1) startIndex = applicationIndex;
        else if (applyByIndex !== -1) startIndex = applyByIndex;
        
        if (startIndex !== -1) {
            // Extract next 200 characters after "how to apply" or similar
            const excerpt = text.substring(startIndex, startIndex + 300).trim();
            return excerpt || 'Please visit the job posting for application details';
        }
        
        return 'Please visit the job posting for application details';
    }

    /**
     * Helper method to extract gender requirement
     */
    private extractGender(text: string): string {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('male only') || lowerText.includes('males only')) {
            return 'Male';
        }
        if (lowerText.includes('female only') || lowerText.includes('females only')) {
            return 'Female';
        }
        return 'Both';
    }

    /**
     * Helper method to extract number of positions
     */
    private extractNumberOfPositions(text: string): number {
        const patterns = [
            /(\d+)\s*(?:position|vacancy|vacancies|opening)/i,
            /number\s*of\s*(?:position|vacancy|vacancies):\s*(\d+)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return parseInt(match[1]);
            }
        }
        return 1;
    }

    /**
     * Helper method to extract requirements from description
     */
    private extractRequirements(text: string): string[] {
        const requirements: string[] = [];
        const lines = text.split(/\n|•|·|-/).map(line => line.trim()).filter(line => line.length > 20);
        
        const reqKeywords = ['require', 'qualification', 'education', 'degree', 'experience', 'must have'];
        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            if (reqKeywords.some(keyword => lowerLine.includes(keyword))) {
                requirements.push(line);
            }
        });

        return requirements.length > 0 ? requirements : ['Please refer to the job description'];
    }

    /**
     * Helper method to extract responsibilities from description
     */
    private extractResponsibilities(text: string): string[] {
        const responsibilities: string[] = [];
        const lines = text.split(/\n|•|·|-/).map(line => line.trim()).filter(line => line.length > 20);
        
        const respKeywords = ['responsible', 'duty', 'duties', 'role', 'manage', 'develop', 'coordinate'];
        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            if (respKeywords.some(keyword => lowerLine.includes(keyword))) {
                responsibilities.push(line);
            }
        });

        return responsibilities.length > 0 ? responsibilities : ['Please refer to the job description'];
    }

    /**
     * Helper method to extract skills from description
     */
    private extractSkills(text: string): string[] {
        const skills: string[] = [];
        const skillKeywords = [
            'excel', 'word', 'powerpoint', 'office', 'communication', 'teamwork',
            'leadership', 'management', 'analytical', 'problem solving', 'ms office',
            'computer', 'english', 'software', 'programming', 'database'
        ];

        const lowerText = text.toLowerCase();
        skillKeywords.forEach(skill => {
            if (lowerText.includes(skill)) {
                skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
            }
        });

        return skills.length > 0 ? skills : ['Please refer to the job description'];
    }

    /**
     * Helper method to normalize deadline date
     */
    private normalizeDeadline(deadline: string): string {
        if (!deadline) {
            // Default to 30 days from now
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            return futureDate.toISOString().split('T')[0];
        }

        try {
            // Try to parse various date formats
            const parsed = new Date(deadline);
            if (!isNaN(parsed.getTime())) {
                return parsed.toISOString().split('T')[0];
            }
        } catch (e) {
            // Ignore parse errors
        }

        return deadline;
    }

    /**
     * Debug method to analyze the Ethiopian Reporter Jobs page structure
     * Returns detailed information about the page without extracting jobs
     */
    async debugEthiopianReporterPage(): Promise<any> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            console.log('Navigating to Ethiopian Reporter Jobs for debugging...');
            await page.goto('https://www.ethiopianreporterjobs.com/jobs-in-ethiopia/', {
                waitUntil: 'networkidle0',
                timeout: 60000
            });

            await new Promise(resolve => setTimeout(resolve, 5000));

            // Extract comprehensive page information
            const debugInfo = await page.evaluate(() => {
                const result: any = {
                    url: window.location.href,
                    title: document.title,
                    bodyClasses: document.body.className,
                    selectors: {},
                    sampleElements: [],
                    allUniqueClasses: [],
                    headers: []
                };

                // Test all selector strategies
                result.selectors['article'] = document.querySelectorAll('article').length;
                result.selectors['.post'] = document.querySelectorAll('.post').length;
                result.selectors['.hentry'] = document.querySelectorAll('.hentry').length;
                result.selectors['.type-post'] = document.querySelectorAll('.type-post').length;
                result.selectors['.job-listing'] = document.querySelectorAll('.job-listing').length;
                result.selectors['[class*="post-"]'] = document.querySelectorAll('[class*="post-"]').length;
                result.selectors['[class*="job"]'] = document.querySelectorAll('[class*="job"]').length;

                // Get all unique classes from first 200 elements
                const allElements = document.querySelectorAll('div, article, section, li');
                const classSet = new Set<string>();
                Array.from(allElements).slice(0, 200).forEach(el => {
                    if (el.className && typeof el.className === 'string') {
                        el.className.split(' ').forEach(cls => {
                            if (cls) classSet.add(cls);
                        });
                    }
                });
                result.allUniqueClasses = Array.from(classSet).slice(0, 100);

                // Get all headers with their text
                const headers = document.querySelectorAll('h1, h2, h3, h4');
                result.headers = Array.from(headers).slice(0, 20).map(h => ({
                    tag: h.tagName,
                    text: h.textContent?.substring(0, 100),
                    classes: h.className,
                    hasLink: !!h.querySelector('a')
                }));

                // Get sample elements from main content area
                const mainContent = document.querySelector('#content, #main, .content, .main, main, .site-content, #primary');
                if (mainContent) {
                    const children = mainContent.children;
                    for (let i = 0; i < Math.min(10, children.length); i++) {
                        const el = children[i];
                        result.sampleElements.push({
                            tag: el.tagName,
                            classes: el.className,
                            id: el.id,
                            textPreview: el.textContent?.substring(0, 150),
                            childCount: el.children.length,
                            hasH2: !!el.querySelector('h2'),
                            hasH3: !!el.querySelector('h3'),
                            hasLink: !!el.querySelector('a')
                        });
                    }
                }

                // Get raw HTML samples
                result.htmlSamples = {
                    full: document.documentElement.outerHTML.substring(0, 5000),
                    mainContent: mainContent?.innerHTML.substring(0, 3000) || 'No main content found'
                };

                return result;
            });

            await browser.close();
            return debugInfo;
        } catch (error) {
            await browser.close();
            throw new BadRequestException(`Debug failed: ${error.message}`);
        }
    }
}