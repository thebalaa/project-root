import readline from 'readline';
import { SimpleAgentRuntime } from '../myAgentRuntime.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import cors from 'cors';
import express from 'express';

const app = express();

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://localhost:3002',
  'https://localhost:3002'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Allow ngrok domains or local development
    if (origin.endsWith('.ngrok-free.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

async function main() {
  try {
    const argv = await yargs(hideBin(process.argv))
      .option('character', {
        alias: 'c',
        type: 'string',
        description: 'Path to character JSON file'
      })
      .option('discord', {
        alias: 'd',
        type: 'boolean',
        description: 'Start Discord bot'
      })
      .option('discord-url', {
        type: 'boolean',
        description: 'Get Discord authorization URL'
      })
      .strict()
      .parse();

    console.log('Loading character from:', argv.character);
    
    const runtime = new SimpleAgentRuntime(argv.character);

    if (argv['discord-url']) {
      try {
        const authUrl = runtime.getDiscordAuthUrl();
        console.log('\nDiscord Authorization URL:');
        console.log(authUrl);
        console.log('\nUse this URL to add the bot to your Discord server.');
        process.exit(0);
      } catch (error: any) {
        console.error('Error getting Discord authorization URL:', error.message);
        process.exit(1);
      }
    }

    if (argv.discord) {
      try {
        await runtime.startDiscordBot();
        console.log('Discord bot started. Press Ctrl+C to stop.');
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
          console.log('\nStopping Discord bot...');
          await runtime.stopDiscordBot();
          process.exit(0);
        });

        return; // Keep the process running for Discord bot
      } catch (error: any) {
        console.error('Error starting Discord bot:', error.message);
        process.exit(1);
      }
    }

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
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
