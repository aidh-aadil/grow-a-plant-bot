const {
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js')
const { colors } = require('../../../config.json')
const Level = require('../../schemas/Level')
const calculateLevel = require('../../utils/calculateLevel')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compost')
    .setDMPermission(false)
    .setDescription('Buy compost to boost your plant growth'),

  async execute(interaction) {
    try {
      await interaction.deferReply()

      const userId = interaction.user.id
      let level = await Level.findOne({ userId })

      if (!level) {
        level = new Level({ userId })
        await level.save()
      }
      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Buy compost')
        .setDescription('Use compost to boost your plant growth.')
        .addFields([
          { name: 'Handful of compost', value: '🪙 100' },
          { name: 'Sack of compost', value: '🪙 250' },
          { name: 'Bucket of compost', value: '🪙 500' },
        ])
        .setFooter({
          text: `Your plant is on level ${level.level} | Your balance is 🪙 ${level.coins}`,
        })

      const handfulBtn = new ButtonBuilder()
        .setCustomId('handful')
        .setEmoji('💩')
        .setLabel('Buy a handful of compost')
        .setStyle(ButtonStyle.Secondary)

      const sackBtn = new ButtonBuilder()
        .setEmoji('💰')
        .setCustomId('sack')
        .setLabel('Buy a sack of compost')
        .setStyle(ButtonStyle.Secondary)

      const bucketBtn = new ButtonBuilder()
        .setEmoji('🪣')
        .setCustomId('bucket')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Buy a bucket of compost')

      const row = new ActionRowBuilder().addComponents(
        handfulBtn,
        sackBtn,
        bucketBtn
      )

      const reply = await interaction.editReply({
        embeds: [embed],
        components: [row],
      })

      const collector = reply.createMessageComponentCollector({
        time: 60_000 * 2,
      })
      collector.on('collect', async (i) => {
        if (i.user.id === interaction.user.id) {
          if (i.customId === 'handful' && level.coins >= 100) {
            level.coins -= 100
            level.xp += 100
            while (level.xp > calculateLevel(level.level)) {
              level.xp -= calculateLevel(level.level)
              level.level += 1
            }
            await level.save()
            const handfulEmbed = new EmbedBuilder()
              .setColor(colors.green)
              .setTitle('You bought a handful of compost')
              .setDescription('You gained a **100 xp boost** by the compost')
              .setImage('https://i.imgur.com/Vbhaj0m.png')
              .setFooter({
                text: `Your plant upgraded to level ${level.level} | Your new balance is 🪙 ${level.coins}`,
              })
            await i.reply({
              embeds: [handfulEmbed],
              ephemeral: true,
            })
          } else if (i.customId === 'sack' && level.coins >= 250) {
            level.coins -= 250
            level.xp += 250
            while (level.xp > calculateLevel(level.level)) {
              level.xp -= calculateLevel(level.level)
              level.level += 1
            }
            await level.save()
            const sackEmbed = new EmbedBuilder()
              .setColor(colors.green)
              .setTitle('You bought a sack of compost')
              .setDescription('You gained a **250 xp boost** by the compost')
              .setImage('https://i.imgur.com/KC9tbKX.png')
              .setFooter({
                text: `Your plant upgraded to level ${level.level} | Your new balance is 🪙 ${level.coins}`,
              })
            await i.reply({
              embeds: [sackEmbed],
              ephemeral: true,
            })
          } else if (i.customId === 'bucket' && level.coins >= 500) {
            level.coins -= 500
            level.xp += 500
            while (level.xp > calculateLevel(level.level)) {
              level.xp -= calculateLevel(level.level + 1)
              level.level += 1
            }
            await level.save()
            const bucketEmbed = new EmbedBuilder()
              .setColor(colors.green)
              .setTitle('You bought a bucket of compost')
              .setDescription('You gained a **500 xp boost** by the compost')
              .setImage('https://i.imgur.com/t2cEofm.png')
              .setFooter({
                text: `Your plant upgraded to level ${level.level} | Your new balance is 🪙 ${level.coins}`,
              })
            await i.reply({
              embeds: [bucketEmbed],
              ephemeral: true,
            })
          } else {
            const notEnoughCoinsEmbed = new EmbedBuilder()
              .setColor(colors.red)
              .setDescription(`You do not have enough 🪙 to buy compost`)
              .setFooter({ text: `Your current balance is 🪙 ${level.coins}` })

            await i.reply({
              embeds: [notEnoughCoinsEmbed],
              ephemeral: true,
            })
          }
        } else {
          await i.reply({
            content: 'You can only buy compost for your plant',
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
      const errEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setDescription(
          'There was an error while buying compost for your tree. Sorry for the inconvenience!'
        )

      await interaction.editReply({ embeds: [errEmbed] })
      console.log(error)
    }
  },
}
