const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { colors } = require('../../../config.json')
const Level = require('../../schemas/Level')
const Cooldown = require('../../schemas/Cooldown')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view')
    .setDMPermission(false)
    .setDescription('View a plant')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Whose plant do you want to view?')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply()

      const targetUser =
        interaction.options.getMember('user') || interaction.member
      const targetUserID = targetUser.id

      let level = await Level.findOne({ userId: targetUserID })

      if (!level) {
        level = new Level({ userId: targetUserID })
        await level.save()
      }

      let waterCooldown = await Cooldown.findOne({
        commandName: 'water',
        userId: targetUserID,
      })

      let harvestCooldown = await Cooldown.findOne({
        commandName: 'harvest',
        userId: targetUserID,
      })

      let description
      if (waterCooldown && Date.now() < waterCooldown.endsAt) {
        description = `${
          targetUserID === interaction.user.id
            ? 'Your'
            : `${targetUser.user.username}'s`
        } plant is growing right now! ${
          targetUserID === interaction.user.id
            ? 'You'
            : `${targetUser.user.username}`
        } can water it again in \`${getCooldownRemaining(
          waterCooldown.endsAt,
          Date.now()
        )}\``
      } else {
        description = `The plant is ready to be watered! Use \`/water\` to water your plant 💧.`
      }

      let description2
      if (harvestCooldown && Date.now() < harvestCooldown.endsAt) {
        description2 = `${
          targetUserID === interaction.user.id
            ? 'You'
            : `${targetUser.user.username}`
        } can harvest your plant again in \`${getCooldownRemaining(
          harvestCooldown.endsAt,
          Date.now()
        )}\``
      } else {
        description2 = `The plant is ready to be harvested! Use \`/harvest\` to collect your fruits 🍎.`
      }

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
      const embed = new EmbedBuilder()
        .setColor(colors.green)
        .setTitle('Grow a Plant')
        .setFooter({
          text: `${targetUser.user.username}'s plant is on level ${level.level} ${emote}`,
        })
        .setDescription(`${description}\n${description2}`)
        .setImage(image)
        .addFields([
          { name: 'Balance', value: `🪙 ${level.coins}`, inline: true },
          { name: 'Fruits', value: `🍎 ${level.fruits}`, inline: true },
        ])

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      const errEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setDescription(
          'There was an error while viewing your tree. Sorry for the inconvenience!'
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
