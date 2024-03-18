const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { colors } = require('../../../config.json')
const Cooldown = require('../../schemas/Cooldown')
const Level = require('../../schemas/Level')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('harvest')
    .setDMPermission(false)
    .setDescription('Harvest your fruits'),

  async execute(interaction) {
    try {
      await interaction.deferReply()

      const commandName = 'harvest'
      const userId = interaction.user.id

      let cooldown = await Cooldown.findOne({ commandName, userId })

      if (cooldown && Date.now() < cooldown.endsAt) {
        const cooldownEmbed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(
            `You are on cooldown. You can harvest your plant again in \`${getCooldownRemaining(
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
      const fruits = getRandomNumber(1, 10)
      level.fruits += fruits
      await level.save()

      cooldown.endsAt = Date.now() + 30 * 60_000
      await cooldown.save()

      // Default variables (small plant)
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

      const harvestEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Harvest your Plant')
        .setDescription(
          `You collected ${fruits} fruits 🍎. You can harvest the plant again in \`30 minutes\``
        )
        .setImage(image)
        .setFooter({
          text: `Your plant is on level ${level.level} ${emote} | You have ${level.fruits} fruits 🍎 now`,
        })

      await interaction.editReply({ embeds: [harvestEmbed] })
    } catch (error) {
      const errEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setDescription(
          'There was an error while collecting fruits from your plant. Sorry for the inconvenience!'
        )

      await interaction.editReply({ embeds: [errEmbed] })
      console.log(error)
    }
  },
}

function getRandomNumber(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getCooldownRemaining(cooldownEnd, currentTime) {
  const timeRemaining = cooldownEnd - currentTime

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
}
