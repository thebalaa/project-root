import discord
import json
import sys
import os
import asyncio
from pathlib import Path
from contextlib import contextmanager

class DiscordMessageSender:
    def __init__(self):
        self.config = self.load_character_config()
        self.discord_token = self.config['settings']['secrets']['DISCORD_API_TOKEN']
        self.intents = discord.Intents.default()
        self.client = discord.Client(intents=self.intents)
        self.message_sent = False
        self.error_message = None

    @staticmethod
    def load_character_config():
        try:
            character_path = Path(__file__).parent.parent / "characters" / "bulldog.character.json"
            with open(character_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("Error: Character configuration file not found")
            sys.exit(1)
        except json.JSONDecodeError:
            print("Error: Invalid JSON in character configuration")
            sys.exit(1)

    @staticmethod
    def load_message_content(message_name):
        try:
            # Construct path to message file in channel-messages directory
            message_path = Path(__file__).parent / "channel-messages" / f"{message_name}.txt"
            
            # If file doesn't exist, show available messages
            if not message_path.exists():
                print(f"Error: {message_name}.txt not found")
                print("\nAvailable messages:")
                messages_dir = Path(__file__).parent / "channel-messages"
                for file in messages_dir.glob("*.txt"):
                    print(f"- {file.stem}")
                sys.exit(1)

            with open(message_path, 'r') as f:
                return f.read().strip()
        except Exception as e:
            print(f"Error reading message file: {str(e)}")
            sys.exit(1)

    async def setup_client(self, channel_id, message_content):
        try:
            @self.client.event
            async def on_ready():
                try:
                    channel = await self.client.fetch_channel(int(channel_id))
                    await channel.send(message_content)
                    print(f"Message sent successfully to channel {channel_id}")
                    self.message_sent = True
                except discord.NotFound:
                    self.error_message = f"Channel {channel_id} not found"
                except discord.Forbidden:
                    self.error_message = "Bot doesn't have permission to send messages"
                except Exception as e:
                    self.error_message = f"Error sending message: {str(e)}"
                finally:
                    await self.client.close()

        except Exception as e:
            print(f"Error setting up client: {str(e)}")
            sys.exit(1)

    async def send_message(self, channel_id, message_name):
        message_content = self.load_message_content(message_name)
        print(f"Message '{message_name}' loaded successfully")
        
        try:
            await self.setup_client(channel_id, message_content)
            
            async def timeout():
                await asyncio.sleep(30)
                if not self.message_sent:
                    print("Operation timed out after 30 seconds")
                    await self.client.close()
                    
            await asyncio.gather(
                self.client.start(self.discord_token),
                timeout()
            )

        except discord.LoginFailure:
            print("Error: Invalid Discord token")
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
        finally:
            if self.error_message:
                print(f"Error occurred: {self.error_message}")
            if not self.client.is_closed():
                await self.client.close()

def validate_inputs(channel_id, message_name):
    if not channel_id.isdigit():
        print("Error: Channel ID must be a number")
        return False
    if not message_name.strip():
        print("Error: Message name cannot be empty")
        return False
    return True

def list_available_messages():
    messages_dir = Path(__file__).parent / "channel-messages"
    print("\nAvailable messages:")
    for file in messages_dir.glob("*.txt"):
        print(f"- {file.stem}")

def main():
    try:
        # Show available messages first
        list_available_messages()
        
        channel_id = input("\nEnter Discord channel ID: ").strip()
        message_name = input("Enter message name (without .txt): ").strip()
        
        if not validate_inputs(channel_id, message_name):
            sys.exit(1)
        
        sender = DiscordMessageSender()
        asyncio.run(sender.send_message(channel_id, message_name))
        
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
