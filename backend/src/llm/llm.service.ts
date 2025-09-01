// src/llm/llm.service.ts
import { Injectable } from '@nestjs/common';
import { Observable, interval, map, take } from 'rxjs';

@Injectable()
export class LlmService {
  simulate(tokens: string[]): Observable<string> {
    // ~150ms per token → ~12s for 80 tokens (adjust to taste)
    return interval(150).pipe(
      take(tokens.length),
      map((i) => tokens[i])
    );
  }
}
