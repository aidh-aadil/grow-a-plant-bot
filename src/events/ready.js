const { Events, ActivityType } = require('discord.js')

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}.`)

    client.user.setActivity({
      name: `🌱 Touch some grass now!`,
      type: ActivityType.Custom,
    })
  },
}
