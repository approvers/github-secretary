import dotenv from 'dotenv';
import { Client, Message } from 'discord.js';
import { NowRequest, NowResponse } from '@now/node';

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

export default (_request: NowRequest, response: NowResponse): void => {
  response.status(500).send(`Something went wrong!`);
};
