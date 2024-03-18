const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { colors } = require('../../../config.json')
const Cooldown = require('../../schemas/Cooldown')
const Level = require('../../schemas/Level')
const calculateLevel = require('../../utils/calculateLevel')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('water')
    .setDMPermission(false)
    .setDescription('Water your plant'),

  async execute(interaction) {
    try {
      await interaction.deferReply()

      const commandName = 'water'
      const userId = interaction.user.id

      let cooldown = await Cooldown.findOne({ commandName, userId })

      if (cooldown && Date.now() < cooldown.endsAt) {
        const cooldownEmbed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(
            `You are on cooldown. You can water your plant again in \`${getCooldownRemaining(
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

      const givenXp = getRandomXp(25, 50)

      let level = await Level.findOne({ userId })

      if (level) {
        level.xp += givenXp

        if (level.xp > calculateLevel(level.level)) {
          level.xp = 0
          level.level += 1

          await interaction.channel.send(
            `${interaction.user} Your plant has leveled up to **level ${level.level}**.`
          )
        }

        await level.save().catch((e) => {
          console.log(`Error when saving updated level: ${e}`)
          return
        })
      }

      if (!level) {
        level = new Level({ userId, xp: givenXp })
        await level.save()
      }

      cooldown.endsAt = Date.now() + 15 * 60_000
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
      const wateredEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Water your Plant')
        .setDescription(
          `You watered your plant 💧. You can water the plant again in \`15 minutes\``
        )
        .setImage(image)
        .setFooter({ text: `Your plant is on level ${level.level} ${emote}` })

      await interaction.editReply({ embeds: [wateredEmbed] })
    } catch (error) {
      const errEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setDescription(
          'There was an error while watering your plant. Sorry for the inconvenience!'
        )

      await interaction.editReply({ embeds: [errEmbed] })
      console.log(error)
    }
  },
}
function getRandomXp(min, max) {
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
