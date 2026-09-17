const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  WebhookClient,
} = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

const PREFIX = '!';

// Commands that require admin access to run.
// Add/remove command names here.
const ADMIN_ONLY = ['nuke', 'rename', 'banish', 'mute', 'lottery', 'superspam'];

// Optional: set a specific role ID here to allow that role too,
// in addition to server Administrators. Leave as null to require
// Administrator permission only.
const ADMIN_ROLE_ID = null; // e.g. '123456789012345678'

function isAdmin(message) {
  const member = message.member;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  if (ADMIN_ROLE_ID && member.roles.cache.has(ADMIN_ROLE_ID)) return true;
  return false;
}

// ---------- helper ----------
function getTarget(message) {
  return message.mentions.members.first();
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// crude zalgo-ish text glitcher
function glitchText(text) {
  const marks = ['̸', '̷', '̶', '̵', '̴', '͎', '҉'];
  return text
    .split('')
    .map((c) => c + (Math.random() > 0.5 ? randomFrom(marks) : ''))
    .join('');
}

// ---------- command list ----------
const commands = {
  // 1. Fake countdown + "explosion" flood in channel
  async nuke(message, target) {
    if (!target) return message.reply('Mention someone to nuke.');
    await message.channel.send(`🎯 Locking onto **${target.displayName}**...`);
    for (const n of ['3', '2', '1']) {
      await new Promise((r) => setTimeout(r, 700));
      await message.channel.send(n);
    }
    await new Promise((r) => setTimeout(r, 500));
    await message.channel.send(`💥💥💥 **${target.displayName} HAS BEEN NUKED** 💥💥💥`);
    await message.channel.send(glitchText(`${target.displayName} survived with 1 HP.`));
  },

  // 2. Roast with preset harmless lines
  async roast(message, target) {
    if (!target) return message.reply('Mention someone to roast.');
    const roasts = [
      'is the human equivalent of a loading screen that never finishes.',
      'has the energy of a Wi-Fi signal with one bar in a basement.',
      'types with the confidence of autocorrect and the accuracy of a coin flip.',
      'is proof that natural selection takes weekends off.',
      'once lost a staring contest with a buffering icon and still brings it up.',
      "has the personality of a terms-and-conditions page — nobody's actually read it.",
      'peaked in a group chat that no longer exists.',
      'is what happens when a participation trophy gains sentience.',
      'brings the same energy as a phone at 1% battery: unreliable and about to die.',
      'is the reason group projects have a "does not contribute" checkbox.',
      "has main character syndrome with a side character's storyline.",
      'is living proof that confidence and competence are unrelated.',
      "talks like they're paid by the word and paid nothing.",
      'is the human version of a CAPTCHA nobody wants to solve.',
      'has the aim of a Nerf gun and the ego of a sniper.',
    ];
    message.channel.send(`${target}, ${randomFrom(roasts)}`);
  },

  // 3. Cursed emoji reactions on their next message
  curse(message, target) {
    if (!target) return message.reply('Mention someone to curse.');
    const cursedEmoji = ['🤡', '💀', '🫠', '🐸', '👁️', '🌀'];
    message.channel.send(`😈 ${target} has been cursed for the next 3 messages...`);
    let count = 0;
    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === target.id,
      time: 5 * 60 * 1000,
    });
    collector.on('collect', async (m) => {
      for (const e of [randomFrom(cursedEmoji), randomFrom(cursedEmoji)]) {
        await m.react(e).catch(() => {});
      }
      count++;
      if (count >= 3) collector.stop();
    });
  },

  // 4. Simulated message "glitch" by editing the BOT's own message repeatedly
  async glitch(message, target) {
    if (!target) return message.reply('Mention someone to glitch.');
    const sent = await message.channel.send(`${target.displayName} is stable.`);
    const stages = [
      `${target.displayName} is stable.`,
      glitchText(`${target.displayName} is stable.`),
      glitchText(`${target.displayName} is d̷e̷s̷t̷a̷b̷i̷l̷i̷z̷i̷n̷g̷`),
      glitchText('C O R R U P T I O N   D E T E C T E D'),
      '💾 recovering...',
      `${target.displayName} is back to normal. Mostly.`,
    ];
    for (const stage of stages.slice(1)) {
      await new Promise((r) => setTimeout(r, 900));
      await sent.edit(stage).catch(() => {});
    }
  },

  // 5. DM emoji/ASCII spam (fails gracefully if DMs closed)
  async spam(message, target) {
    if (!target) return message.reply('Mention someone to spam.');
    const line = '🚨'.repeat(20);
    try {
      for (let i = 0; i < 5; i++) {
        await target.send(line);
      }
      message.channel.send(`📬 ${target.displayName}'s DMs have been... blessed.`);
    } catch {
      message.channel.send(`❌ Couldn't DM ${target.displayName} — their DMs are locked.`);
    }
  },

  // 5b. Admin-only DM flood with custom text and count
  async superspam(message, target, args) {
    if (!target) return message.reply('Mention someone to superspam.');
    // args = [cmdName, mention, count?, ...text]
    // strip the mention token itself out of args before parsing
    const rest = args.slice(1).filter((a) => !a.startsWith('<@'));
    let count = 10;
    let textParts = rest;
    if (rest[0] && /^\d+$/.test(rest[0])) {
      count = parseInt(rest[0]);
      textParts = rest.slice(1);
    }
    count = Math.min(Math.max(count, 1), 99); // hard cap at 99
    const text = textParts.join(' ').trim() || '🚨 SUPERSPAM 🚨';

    try {
      for (let i = 0; i < count; i++) {
        await target.send(text);
        await new Promise((r) => setTimeout(r, 300)); // avoid rate limit
      }
      message.channel.send(`📬 Sent "${text}" to ${target.displayName} ${count} times.`);
    } catch {
      message.channel.send(`❌ Couldn't DM ${target.displayName} — their DMs are locked.`);
    }
  },

  // 6. DM ASCII jumpscare
  async jumpscare(message, target) {
    if (!target) return message.reply('Mention someone to jumpscare.');
    try {
      await target.send('```\n\n\n\n\n  👻 BOO 👻\n\n\n\n\n```');
      message.channel.send(`👻 ${target.displayName} has been jumpscared.`);
    } catch {
      message.channel.send(`❌ Couldn't DM ${target.displayName} — their DMs are locked.`);
    }
  },

  // 7. Temporary nickname change, auto-reverts
  async rename(message, target) {
    if (!target) return message.reply('Mention someone to rename.');
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return message.reply('I need Manage Nicknames permission for this.');
    }
    if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("Can't rename someone with an equal/higher role than me.");
    }
    const original = target.nickname;
    await target.setNickname('🤡 CLOWN 🤡').catch(() => {});
    message.channel.send(`${target.displayName} has been renamed for 60 seconds.`);
    setTimeout(async () => {
      await target.setNickname(original).catch(() => {});
    }, 60 * 1000);
  },

  // 8. Move to a "timeout" voice channel and back
  async banish(message, target) {
    if (!target) return message.reply('Mention someone to banish.');
    if (!target.voice.channel) return message.reply('They need to be in a voice channel.');
    const originalChannel = target.voice.channel;
    let timeoutChannel = message.guild.channels.cache.find(
      (c) => c.name === 'the-shadow-realm' && c.type === 2
    );
    if (!timeoutChannel) {
      timeoutChannel = await message.guild.channels.create({
        name: 'the-shadow-realm',
        type: 2, // GUILD_VOICE
      });
    }
    await target.voice.setChannel(timeoutChannel).catch(() => {
      return message.reply("Couldn't move them — check my Move Members permission.");
    });
    message.channel.send(`${target.displayName} has been banished to the shadow realm for 30 seconds.`);
    setTimeout(async () => {
      await target.voice.setChannel(originalChannel).catch(() => {});
    }, 30 * 1000);
  },

  // 9. Short timeout (server mute via Discord's built-in timeout feature)
  async mute(message, target, args) {
    if (!target) return message.reply('Mention someone to mute.');
    const seconds = parseInt(args[1]) || 10;
    if (seconds > 60) return message.reply('Max 60 seconds for the prank mute.');
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('I need Timeout Members permission for this.');
    }
    await target.timeout(seconds * 1000, 'Prank mute').catch(() => {
      return message.reply("Couldn't mute them — check role hierarchy/permissions.");
    });
    message.channel.send(`🔇 ${target.displayName} has been silenced for ${seconds} seconds.`);
  },

  // 10. Random victim from online members, runs nuke on them
  async lottery(message) {
    const online = message.guild.members.cache.filter(
      (m) => !m.user.bot && m.presence?.status && m.presence.status !== 'offline'
    );
    if (online.size === 0) return message.reply('No one online to pick from.');
    const victim = randomFrom([...online.values()]);
    message.channel.send(`🎰 The lottery has chosen... **${victim.displayName}**`);
    await commands.nuke(message, victim);
  },

  // 11. Leaderboard of who's been targeted most (simple in-memory store)
  stats(message) {
    if (statsStore.size === 0) return message.channel.send('No one has been pranked yet.');
    const sorted = [...statsStore.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const lines = sorted.map(([id, count], i) => `${i + 1}. <@${id}> — ${count} pranks`);
    message.channel.send(`**Prank leaderboard**\n${lines.join('\n')}`);
  },

  // 12. Reply-mock: bot replies with an exaggerated echo of their last message
  async mock(message, target) {
    if (!target) return message.reply('Mention someone to mock.');
    const recent = (
      await message.channel.messages.fetch({ limit: 20 })
    ).find((m) => m.author.id === target.id);
    if (!recent) return message.reply("Couldn't find a recent message from them.");
    const mocked = recent.content
      .split('')
      .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
      .join('');
    message.reply({
      content: `"${mocked}" — ${target.displayName}, probably`,
      allowedMentions: { repliedUser: false },
    });
  },
};

// simple in-memory tracker for stats/lottery
const statsStore = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmdName = args.shift().toLowerCase();
  const target = getTarget(message);

  if (commands[cmdName]) {
    if (ADMIN_ONLY.includes(cmdName) && !isAdmin(message)) {
      return message.reply("You don't have permission to use that command.");
    }
    if (target) {
      statsStore.set(target.id, (statsStore.get(target.id) || 0) + 1);
    }
    try {
      await commands[cmdName](message, target, [cmdName, ...args]);
    } catch (err) {
      console.error(err);
      message.reply('Something broke. Check the console.');
    }
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
