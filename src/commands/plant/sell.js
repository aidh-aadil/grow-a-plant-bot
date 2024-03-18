const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { colors } = require('../../../config.json')
const Cooldown = require('../../schemas/Cooldown')
const Level = require('../../schemas/Level')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDMPermission(false)
    .setDescription('Sell your fruits and get some coins')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('How many fruits do you want to sell?')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply()
      const amount = interaction.options.getInteger('amount')

      const commandName = 'sell'
      const userId = interaction.user.id

      let cooldown = await Cooldown.findOne({ commandName, userId })

      if (cooldown && Date.now() < cooldown.endsAt) {
        const cooldownEmbed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(
            `You are on cooldown. You can sell your fruits again in \`${getCooldownRemaining(
              cooldown.endsAt,
              Date.now()
            )}\``
          )
        await interaction.editReply({
          embeds: [cooldownEmbed],
        })
        return
      }

      if (!cooldown) {
        cooldown = new Cooldown({ commandName, userId })
      }

      let level = await Level.findOne({ userId })

      if (!level) {
        level = new Level({ userId })
      }
      const embed = new EmbedBuilder()
        .setColor(colors.red)
        .setDescription(`You only have \`${level.fruits}\` fruits 🍎`)
      if (level.fruits < amount) {
        return await interaction.editReply({ embeds: [embed] })
      }

      const price = 10
      level.fruits -= amount
      level.coins += amount * price
      await level.save()

      cooldown.endsAt = Date.now() + 60_000
      await cooldown.save()

      let image = 'https://i.imgur.com/fD7kMYw.png'
      let emote = '🌱'

      if (level.level >= 50 && level.level < 100) {
        // Set variables for medium plant
        image = 'https://i.imgur.com/NQLgYGJ.png'
        emote = '🪴'
      }

      if (level.level >= 100) {
        // Set variables for big tree
        image = 'https://i.imgur.com/yWZSVOC.png'
        emote = '🌳'
      }
      embed
        .setImage(image)
        .setColor(colors.green)
        .setTitle('Sell your fruits')
        .setFooter({
          text: `Your new balance is 🪙 ${level.coins} | You have ${level.fruits} fruits 🍎 remaining`,
        })
        .setDescription(
          `You sold ${amount} fruits 🍎 and earned 🪙 ${amount * price}`
        )

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      const errEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setDescription(
          'There was an error while selling your fruits. Sorry for the inconvenience!'
        )

      await interaction.editReply({ embeds: [errEmbed] })
      console.log(error)
    }
  },
}

function getCooldownRemaining(cooldownEnd, currentTime) {
  const timeRemaining = cooldownEnd - currentTime

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}
