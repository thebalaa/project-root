class MemoryManager {
    memories;
    constructor() {
        this.memories = new Map();
    }
    addMemory(userId, memory) {
        if (!this.memories.has(userId)) {
            this.memories.set(userId, []);
        }
        this.memories.get(userId)?.push(memory);
    }
    getRelevantMemories(userId, query) {
        return this.memories.get(userId) || [];
    }
}
class RAGProvider {
    character;
    memoryManager;
    constructor(character) {
        this.character = character;
        this.memoryManager = new MemoryManager();
        this.initializeKnowledge();
    }
    initializeKnowledge() {
        const knowledge = this.character.knowledge || [];
        knowledge.forEach(k => this.memoryManager.addMemory('system', k));
    }
    async getEnhancedPrompt(userId, userMessage) {
        const relevantMemories = this.memoryManager.getRelevantMemories(userId, userMessage);
        const context = relevantMemories.join('\n');
        return `Context:\n${context}\n\nUser message: ${userMessage}\n\nRespond as ${this.character.name}:`;
    }
}
export class SimpleAgentRuntime {
    character;
    ragProvider;
    baseUrl;
    model;
    constructor(character) {
        this.character = character;
        this.ragProvider = new RAGProvider(character);
        this.baseUrl = character.settings.baseUrl || 'http://localhost:11434/api';
        this.model = character.settings.model || 'llama2';
    }
    buildSystemPrompt() {
        const { bio, lore, style } = this.character;
        return `You are ${this.character.name}.\n\nBio:\n${bio?.join('\n')}\n\nLore:\n${lore?.join('\n')}\n\nStyle:\n${style?.all?.join('\n')}`;
    }
    async chat(userId, message) {
        try {
            console.log('Preparing chat request...');
            const enhancedPrompt = await this.ragProvider.getEnhancedPrompt(userId, message);
            const systemPrompt = this.buildSystemPrompt();
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: enhancedPrompt }
                    ]
                })
            });
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Response data:', data);
            if (data.error) {
                throw new Error(data.error);
            }
            return data.message.content;
        }
        catch (error) {
            console.error('Error in chat:', error);
            return `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
}
