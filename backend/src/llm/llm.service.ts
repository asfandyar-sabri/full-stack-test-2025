import { Injectable } from '@nestjs/common';

@Injectable()
export class LlmService {
  async getSimulatedReply(_prompt: string): Promise<string> {
    const delay = 10000 + Math.floor(Math.random() * 10000); // 10–20s
    await new Promise(res => setTimeout(res, delay));
    return [
      'Here is a multi-sentence simulated AI reply.',
      'Imagine this came from a real LLM service.',
      'This delay helps you demonstrate proper long-running request handling on the frontend.'
    ].join(' ');
  }
}
