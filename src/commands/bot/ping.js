const { EmbedBuilder, SlashCommandBuilder } = require('@discordjs/builders')
const { version } = require('discord.js')
const { colors } = require('../../../config.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('View bot latency'),

  async execute(interaction) {
    try {
      const sent = await interaction.deferReply({ fetchReply: true })
      const uptime = formatUptime(interaction.client.uptime)

      const embed = new EmbedBuilder()
        .addFields([
          {
            name: 'Roundtrip ping',
            value: `\`${
              sent.createdTimestamp - interaction.createdTimestamp
            } ms\``,
            inline: false,
          },
          {
            name: 'Websocket ping',
            value: `\`${interaction.client.ws.ping} ms\``,
            inline: false,
          },
          { name: 'Uptime', value: `\`${uptime}\``, inline: false },
        ])
        .setColor(colors.green)

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      await interaction.editReply('Oops! There was an error.').then((msg) => {
        setTimeout(() => {
          msg.delete()
        }, 10000)
      })
      console.log(error)
    }
  },
}

function formatUptime(uptimeMilliseconds) {
  const seconds = Math.floor(uptimeMilliseconds / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor(((seconds % 86400) % 3600) / 60)
  const secondsLeft = ((seconds % 86400) % 3600) % 60

  return `${days}d ${hours}h ${minutes}m ${secondsLeft}s`
}
