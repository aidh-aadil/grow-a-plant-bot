const { Events, ActivityType } = require('discord.js')

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}.`)

    client.user.setActivity({
      name: `🌱 Grow your plant now!`,
      type: ActivityType.Custom,
    })
  },
}
