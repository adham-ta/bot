/* eslint-disable no-irregular-whitespace */
import { Command, CommandStore, CommandOptions, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { DefaultCommandOptions } from '../../constants';
import DiscordBioClient from '../../client';

const ProfileCommandOptions: CommandOptions = {
  ...DefaultCommandOptions,
  name: 'profile',
};

enum Gender {
  'Male',
  'Female',
  'Non-binary',
}

export default class extends Command {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory, ProfileCommandOptions);
  }

  public async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null> {
    const discordBioClient = (<DiscordBioClient> message.client).discordBioClient;
    const searchParam = message.content.split(' ')[1];
    let response;
    try {
      response = await discordBioClient.fetchUserDetails(searchParam).then((r) => r.payload);
    } catch (e) {
      return await message.sendMessage(e.message);
    }
    const { user, discord } = response;
    const name = `${discord.username}#${discord.discriminator}`;
    const url = `https://discord.bio/p/${user.details.slug}`;
    const avatar = discord.avatar
      ? `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`
      : null;

    const embed = new MessageEmbed();
    embed.setColor('PURPLE');
    embed.setAuthor(name, avatar || undefined, url);
    if (avatar) embed.setThumbnail(avatar);
    embed.setTitle(`${name} \`(${user.details.slug})\``);
    embed.setDescription(
      `🗒️**About:** ${user.details.description}\n​❤️ **${user.details.likes} like${
        user.details.likes !== 1 ? 's' : ''
      }**\n​`,
    );
    embed.addField('🆔 User ID', discord.id);
    embed.addField('🗺️ Location', user.details.location || 'No location', true);
    embed.addField('🎂 Birthday', user.details.birthday ? new Date(user.details.birthday) : 'No birthday', true);
    embed.addField('🚻 Gender', user.details.gender ? Gender[user.details.gender] : 'No gender', true);
    embed.addField('✉️ Mail', user.details.email || 'No email', true);
    embed.addField('🛠️ Occupation', user.details.occupation || 'No occupation', true);
    embed.addField('🗓️ Account Created', user.details.created_at || 'No creation date.', true);

    return message.send(embed);
  }
}
