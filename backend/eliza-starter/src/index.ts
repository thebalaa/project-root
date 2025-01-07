import readline from 'readline';
import { SimpleAgentRuntime } from '../myAgentRuntime';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('character', {
      alias: 'c',
      type: 'string',
      description: 'Path to character JSON file',
      demandOption: true
    })
    .argv;

  const runtime = new SimpleAgentRuntime(argv.character);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Chat started. Type "exit" to quit.');
  
  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      try {
        const response = await runtime.chat(input);
        console.log('\nAssistant:', response, '\n');
      } catch (error) {
        console.error('Error:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);
