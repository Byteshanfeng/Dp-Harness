import type { GetPromptResult, PromptArgument, PromptDefinition } from '../protocol/index.js';
import type { ToolContext } from '../context.js';
export interface Prompt {
    name: string;
    description: string;
    arguments?: PromptArgument[];
    /** Build the message list. Receives validated string args. */
    render(args: Record<string, string>, ctx: ToolContext): Promise<GetPromptResult> | GetPromptResult;
}
export declare class PromptRegistry {
    private prompts;
    register(prompt: Prompt): void;
    registerAll(prompts: Prompt[]): void;
    get(name: string): Prompt | null;
    list(): PromptDefinition[];
}
//# sourceMappingURL=types.d.ts.map