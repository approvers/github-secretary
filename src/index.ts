import dotenv from 'dotenv';
import {Client, Message} from 'discord.js';

dotenv.config();

const client = new Client();

client.on('ready', () => {
  console.log('I got ready.');
});

client.on('message', (msg: Message) => {
  if (msg.content === 'ラフィー') {
    msg.reply('じーー......');
  }
});

client.login(process.env.DISCORD_TOKEN);
