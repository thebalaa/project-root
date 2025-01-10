import express from 'express';
import { 
  Client, 
  GatewayIntentBits, 
  TextChannel, 
  Message
} from 'discord.js';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();
const DEFAULT_CHANNEL_ID = '1327010450159702087'; // Your channel ID as fallback
const BULLDROID_ID = '1326005698261418034'; // Bulldroid's ID

// Create client with all necessary intents
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

// Initialize bot connection
let isReady = false;
client.login('MTMyNzAyMDE5OTYwOTYzMDg2MQ.GYwyRf.OYinrB1S8TTNmd87uXLgtnmx0zhM64UWhyYqK8')
  .then(() => {
    console.log('Messenger bot successfully logged in');
    isReady = true;
  })
  .catch(error => {
    console.error('Failed to login to Discord:', error);
  });

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

// Helper function to extract URLs from message content
function extractUrlsFromMessage(message: string): { text: string, urls: string[] } {
  // Common website patterns in Bulldroid's responses
  const websitePatterns = [
    {
      name: "Poetic French Bulldogs",
      url: "https://poeticfrenchbulldogs.com"
    },
    {
      name: "American Kennel Club",
      url: "https://www.akc.org/dog-breeds/french-bulldog"
    },
    // Add more common websites as needed
  ];

  let processedText = message;
  const foundUrls: string[] = [];

  // Replace numbered references with actual URLs
  websitePatterns.forEach(site => {
    if (message.toLowerCase().includes(site.name.toLowerCase())) {
      foundUrls.push(site.url);
      processedText = processedText.replace(
        new RegExp(`\\((\\d+)\\)`, 'g'),
        `(${site.url})`
      );
    }
  });

  return {
    text: processedText,
    urls: foundUrls
  };
}

router.post('/messages', async (req, res) => {
  try {
    if (!isReady) {
      throw new Error('Bot is not ready yet');
    }

    const { message } = req.body;
    console.log('Received message:', message);

    // Get the channel
    const channel = await client.channels.fetch(DEFAULT_CHANNEL_ID);
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error('Could not find the specified channel');
    }

    // Send the message with Bulldroid mention
    const formattedMessage = `<@${BULLDROID_ID}> ${message}`;
    const sentMessage = await channel.send(formattedMessage);

    // Wait for bot responses
    const botResponses = await waitForBotResponses(channel, sentMessage.id);

    res.json({
      success: true,
      messageId: sentMessage.id,
      responses: botResponses.map(msg => ({
        id: msg.id,
        content: msg.content
      }))
    });

  } catch (error) {
    console.error('Error in messages endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/chat', async (req, res) => {
  try {
    if (!isReady) {
      throw new Error('Bot is not ready yet');
    }

    const { message } = req.body;
    console.log('Received message:', message);

    // Get the channel
    const channel = await client.channels.fetch(DEFAULT_CHANNEL_ID);
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error('Could not find the specified channel');
    }

    // Send the message with Bulldroid mention
    const formattedMessage = `<@${BULLDROID_ID}> ${message}`;
    console.log('Sending formatted message:', formattedMessage);

    const sentMessage = await channel.send(formattedMessage);
    console.log('Message sent successfully:', sentMessage.content);

    // Wait for all bot responses
    const botResponses = await waitForBotResponses(channel, sentMessage.id);
    console.log('Received bot responses:', botResponses);

    // Combine all responses into a single message
    const combinedResponse = botResponses
      .map(msg => {
        const { text, urls } = extractUrlsFromMessage(msg.content);
        return text;
      })
      .join('\n\n');

    res.json({
      response: combinedResponse,
      discordMessageId: botResponses[0].id,
      additionalMessageIds: botResponses.slice(1).map(msg => msg.id)
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function waitForBotResponses(channel: TextChannel, messageId: string): Promise<Message[]> {
  return new Promise((resolve, reject) => {
    const responses: Message[] = [];
    let initialResponseReceived = false;
    let sequentialMessageTimeout: NodeJS.Timeout;

    // Initial timeout for first response (2 minutes)
    const initialTimeout = setTimeout(() => {
      client.off('messageCreate', messageHandler);
      reject(new Error('Timeout waiting for initial response'));
    }, 120000);

    const finalizeResponses = () => {
      client.off('messageCreate', messageHandler);
      console.log('Finalizing responses. Total messages:', responses.length);
      responses.forEach((msg, i) => {
        console.log(`Message ${i + 1}:`, msg.content.substring(0, 50) + '...');
      });
      resolve(responses);
    };

    const messageHandler = (message: Message) => {
      console.log('Message received:', {
        authorId: message.author.id,
        content: message.content.substring(0, 50) + '...',
        referenceId: message.reference?.messageId,
        currentMessageId: message.id,
        isFromBulldroid: message.author.id === BULLDROID_ID,
        responsesLength: responses.length
      });

      if (message.author.id === BULLDROID_ID) {
        const isReferencingOriginal = message.reference?.messageId === messageId;
        const isReferencingPrevious = responses.length > 0 && 
          message.reference?.messageId === responses[responses.length - 1].id;
        const isPartOfConversation = responses.length > 0 && 
          message.createdTimestamp - responses[responses.length - 1].createdTimestamp < 5000;

        if (!initialResponseReceived && isReferencingOriginal) {
          // First response received
          console.log('Initial response received');
          clearTimeout(initialTimeout);
          initialResponseReceived = true;
          responses.push(message);

          // Set timeout for sequential messages (3 seconds)
          sequentialMessageTimeout = setTimeout(finalizeResponses, 3000);
        } else if (initialResponseReceived && 
                  (isReferencingOriginal || isReferencingPrevious || isPartOfConversation)) {
          // Sequential message received
          console.log('Sequential message received:', {
            isReferencingOriginal,
            isReferencingPrevious,
            isPartOfConversation
          });
          
          clearTimeout(sequentialMessageTimeout);
          responses.push(message);

          // Reset timeout for next potential message
          sequentialMessageTimeout = setTimeout(finalizeResponses, 3000);
        }
      }
    };

    client.on('messageCreate', messageHandler);
  });
}

export default router;