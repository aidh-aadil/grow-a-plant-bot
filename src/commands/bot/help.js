const {
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js')
const { colors } = require('../../../config.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDMPermission(false)
    .setDescription('Get a simple overview of how the bot works'),

  async execute(interaction) {
    try {
      await interaction.deferReply()

      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Grow a Plant: Guide')
        .setFooter({
          text: 'This bot was made with ❤️ by Aidh Aadil',
        })
        .setDescription(
          `'Grow a Plant' is a bot that let's you plant a (virtual) tree and contribute to it. Watch as your small plant grows into a big tree. Compete among your friends to grow the tallest tree.`
        )
        .addFields([
          {
            name: '🔗 Links',
            value:
              '> **[GitHub Repository](https://github.com/aidh-aadil/grow-a-plant-bot)**',
          },
        ])

      const smallPlantEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setImage('https://i.imgur.com/fD7kMYw.png')
        .setTitle('🌱 Small plant')
        .setDescription(
          'We all start from the small plant. Take care of it well and you will soon upgrade into the next plant size'
        )

      const mediumPlantEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setImage('https://i.imgur.com/NQLgYGJ.png')
        .setTitle('🪴 Medium plant: Level 50+')
        .setDescription(
          'When you reach level 50, your small plant will grow into a medium plant.'
        )

      const bigTreeEmbed = new EmbedBuilder()
        .setImage('https://i.imgur.com/yWZSVOC.png')
        .setColor(colors.green)
        .setTitle('🌳 Big tree: Level 100+')
        .setDescription(
          'The final level is the big tree. Your plant is in maximum size now. You can still continue on growing your plant from here.'
        )

      const handfulCompostEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Handful of compost')
        .setDescription('Get a **100 xp** boost for 🪙 100')
        .setImage('https://i.imgur.com/Vbhaj0m.png')

      const sackCompostEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Sack of compost')
        .setDescription('Get a **250 xp** boost for 🪙 250')
        .setImage('https://i.imgur.com/KC9tbKX.png')

      const bucketCompostEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Bucket of compost')
        .setDescription('Get a **500 xp** boost for 🪙 500')
        .setImage('https://i.imgur.com/t2cEofm.png')

      const plantsBtn = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🌱')
        .setLabel('Plants')
        .setCustomId('plants')

      const compostBtn = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💩')
        .setLabel('Compost')
        .setCustomId('compost')

      const row = new ActionRowBuilder().addComponents(plantsBtn, compostBtn)

      const reply = await interaction.editReply({
        embeds: [embed],
        components: [row],
      })

      const collector = reply.createMessageComponentCollector({
        time: 60_000 * 5,
      })

      collector.on('collect', async (i) => {
        if (i.customId === 'plants') {
          await i.reply({
            embeds: [smallPlantEmbed, mediumPlantEmbed, bigTreeEmbed],
            ephemeral: true,
          })
        }
        if (i.customId === 'compost') {
          await i.reply({
            embeds: [handfulCompostEmbed, sackCompostEmbed, bucketCompostEmbed],
            ephemeral: true,
          })
        }
      })
      collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          await reply.edit({ components: [] })
        }
      })
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
