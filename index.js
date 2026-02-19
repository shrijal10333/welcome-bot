const http = require("http");
const express = require("express");
const app = express();

app.get("/", (req, res) => res.sendStatus(200));
app.listen(process.env.PORT || 3000);

setInterval(() => {
  if (process.env.PROJECT_DOMAIN) {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
  }
}, 280000);

/* ============================= */

const {
  Client,
  GatewayIntentBits,
  Partials,
  AttachmentBuilder,
  ActivityType
} = require("discord.js");

const Canvas = require("canvas");

const {
  TOKEN,
  WelcomeChannel,
  WelcomeMessage,
  AutoRole,
  AutoRoleName,
  SetStatus,
  DM,
  DMMessage
} = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.GuildMember]
});

/* ============================= */

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: SetStatus, type: ActivityType.Playing }],
    status: "online"
  });
});

/* ============================= */

client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === WelcomeChannel
    );
    if (!channel) return;

    const role = member.guild.roles.cache.find(
      (r) => r.name === AutoRoleName
    );

    const background = await Canvas.loadImage(
      "https://i.ibb.co/g3yR7pS/welcome.png"
    );

    const avatar = await Canvas.loadImage(
      member.user.displayAvatarURL({ extension: "png", size: 256 })
    );

    const canvas = Canvas.createCanvas(800, 300);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0, 800, 300);

    ctx.font = "36px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(member.user.username, 545, 177);

    ctx.font = "20px Arial";
    ctx.fillText(
      `${member.guild.memberCount} Members`,
      580,
      210
    );

    ctx.beginPath();
    ctx.arc(169.5, 148, 126.9, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 36, 21, 260, 260);

    const welcomeMsg = WelcomeMessage
      .replace("[[user]]", `<@${member.id}>`)
      .replace("[[server]]", member.guild.name)
      .replace("[[members]]", member.guild.memberCount);

    const attachment = new AttachmentBuilder(
      canvas.toBuffer(),
      { name: "welcome.png" }
    );

    setTimeout(() => {
      channel.send({
        content: welcomeMsg,
        files: [attachment]
      });
    }, 2000);

    /* Auto Role */
    if (AutoRole === true && role) {
      await member.roles.add(role);
    }

    /* DM Message */
    if (DM === true && DMMessage) {
      await member.send(DMMessage);
    }

  } catch (err) {
    console.error("❌ Error in guildMemberAdd:", err);
  }
});

/* ============================= */

client.login(TOKEN);
