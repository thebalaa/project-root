import { readFile } from 'fs/promises';
import { SimpleAgentRuntime } from './myAgentRuntime';
import readline from 'readline';
async function main() {
    try {
        const characterPath = process.argv.find(arg => arg.startsWith('--character='))?.split('=')[1];
        if (!characterPath) {
            throw new Error('Please provide a character file path using --character=<path>');
        }
        console.log('Loading character from:', characterPath);
        const characterData = await readFile(characterPath, 'utf-8');
        const character = JSON.parse(characterData);
        console.log(`Initializing ${character.name}...`);
        const runtime = new SimpleAgentRuntime(character);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        console.log('\nChat initialized. Type your messages (or "exit" to quit):\n');
        const userId = 'user-1'; // Simple user ID for demonstration
        rl.on('line', async (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
                return;
            }
            try {
                const response = await runtime.chat(userId, input);
                console.log(`\n${character.name}: ${response}\n`);
            }
            catch (error) {
                console.error('Error processing message:', error);
            }
        });
        rl.on('close', () => {
            console.log('\nGoodbye!');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Initialization error:', error);
        process.exit(1);
    }
}
main();
