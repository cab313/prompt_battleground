// API Client - OpenAI GPT-4o Integration

import { CONFIG } from './config.js';
import { log } from './utils.js';

console.log('[API] Initializing API client...');

class APIClient {
    constructor() {
        this.baseURL = CONFIG.API.BASE_URL;
        this.apiKey = CONFIG.API.API_KEY;
        this.model = CONFIG.API.MODEL;
        log.info('API Client initialized:', {
            baseURL: this.baseURL,
            model: this.model
        });
    }

    async callChatCompletion(messages, options = {}) {
        const endpoint = `${this.baseURL}${CONFIG.API.CHAT_ENDPOINT}`;

        const payload = {
            model: options.model || this.model,
            messages: messages,
            max_tokens: options.maxTokens || CONFIG.API.MAX_TOKENS,
            temperature: options.temperature !== undefined ? options.temperature : CONFIG.API.TEMPERATURE
        };

        log.api('Making chat completion request:', payload);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                log.error('API request failed:', response.status, errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            log.api('Chat completion response received:', data);

            return {
                success: true,
                content: data.choices[0].message.content,
                usage: data.usage,
                model: data.model
            };
        } catch (error) {
            log.error('Error calling chat completion:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async evaluatePrompt(userPrompt, scenario) {
        log.api('Evaluating prompt for scenario:', scenario.title);

        const evaluationMessages = [
            {
                role: 'system',
                content: `You are an expert prompt engineering evaluator. You will evaluate prompts based on:
1. AI Evaluation (40%): How well would this prompt work with an AI to accomplish the task?
2. Format Quality (20%): Is the prompt well-structured, clear, and properly formatted?
3. Efficiency (20%): Is the prompt concise yet complete? Does it avoid unnecessary words?
4. Technical Accuracy (20%): Does it use proper prompt engineering techniques (role definition, output format, examples, etc.)?

Score each category from 0-2.5 points (where 2.5 is excellent). Provide specific feedback.`
            },
            {
                role: 'user',
                content: `Scenario: ${scenario.title}
Description: ${scenario.description}
Criteria: ${scenario.criteria.join(', ')}

User's Prompt:
${userPrompt}

Please evaluate this prompt and return a JSON response with this structure:
{
    "scores": {
        "ai_evaluation": <number 0-4>,
        "format_quality": <number 0-2>,
        "efficiency": <number 0-2>,
        "technical_accuracy": <number 0-2>
    },
    "total_score": <number 0-10>,
    "feedback": {
        "strengths": ["<strength 1>", "<strength 2>"],
        "improvements": ["<improvement 1>", "<improvement 2>"],
        "tips": ["<tip 1>", "<tip 2>"]
    }
}`
            }
        ];

        const result = await this.callChatCompletion(evaluationMessages, { temperature: 0.3 });

        if (!result.success) {
            log.error('Failed to evaluate prompt:', result.error);
            return this.getFallbackEvaluation(userPrompt);
        }

        try {
            const evaluation = JSON.parse(result.content);
            log.api('Prompt evaluation completed:', evaluation);
            return evaluation;
        } catch (parseError) {
            log.error('Error parsing evaluation response:', parseError);
            return this.getFallbackEvaluation(userPrompt);
        }
    }

    async executePrompt(userPrompt, scenarioData) {
        log.api('Executing user prompt with scenario data');

        const messages = [
            {
                role: 'user',
                content: `${userPrompt}\n\nData:\n${scenarioData}`
            }
        ];

        return await this.callChatCompletion(messages);
    }

    async analyzePrompt(userPrompt) {
        log.api('Analyzing prompt structure');

        const messages = [
            {
                role: 'system',
                content: 'You are a prompt engineering assistant. Analyze the given prompt and provide quick feedback on its structure and potential effectiveness.'
            },
            {
                role: 'user',
                content: `Analyze this prompt and provide brief feedback (2-3 sentences):\n\n${userPrompt}`
            }
        ];

        return await this.callChatCompletion(messages, { maxTokens: 500, temperature: 0.5 });
    }

    getFallbackEvaluation(userPrompt) {
        log.warn('Using fallback evaluation');

        const length = userPrompt.length;
        const hasRole = /you are|act as|as a/i.test(userPrompt);
        const hasFormat = /format|json|list|table|bullet/i.test(userPrompt);
        const hasExample = /example|for instance|such as/i.test(userPrompt);

        let baseScore = 5;
        if (hasRole) baseScore += 1;
        if (hasFormat) baseScore += 1;
        if (hasExample) baseScore += 1;
        if (length > 50 && length < 500) baseScore += 1;

        const totalScore = Math.min(baseScore, 10);

        return {
            scores: {
                ai_evaluation: Math.min(totalScore * 0.4, 4),
                format_quality: hasFormat ? 1.5 : 1,
                efficiency: length < 500 ? 1.5 : 1,
                technical_accuracy: hasRole ? 1.5 : 1
            },
            total_score: totalScore,
            feedback: {
                strengths: [
                    hasRole ? "Good use of role definition" : "Prompt is clear",
                    hasFormat ? "Specifies output format" : "Addresses the task"
                ],
                improvements: [
                    !hasRole ? "Consider defining a role for the AI" : "Try adding more specific constraints",
                    !hasFormat ? "Specify the desired output format" : "Consider adding examples"
                ],
                tips: [
                    "Be specific about what you want the AI to do",
                    "Use structured formatting for complex tasks"
                ]
            }
        };
    }
}

const apiClient = new APIClient();

export default apiClient;

console.log('[API] API client ready');
