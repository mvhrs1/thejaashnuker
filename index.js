const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
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
const ADMIN_ONLY = ['superspam'];

const ADMIN_ROLE_ID = null;

function isAdmin(message) {
  const member = message.member;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  if (ADMIN_ROLE_ID && member.roles.cache.has(ADMIN_ROLE_ID)) return true;
  return false;
}

// ---------- helpers ----------
function getTarget(message) {
  return message.mentions.members.first();
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function glitchText(text) {
  const marks = ['\u0338', '\u0337', '\u0336', '\u0335', '\u0334', '\u034e', '\u0489'];
  return text
    .split('')
    .map((c) => c + (Math.random() > 0.5 ? randomFrom(marks) : ''))
    .join('');
}

// ---------- commands ----------
const commands = {

  // 1. Fake countdown + "explosion" flood in channel
  async nuke(message, target) {
    if (!target) return message.reply('Mention someone to nuke.');
    await message.channel.send(`\uD83C\uDFAF Locking onto **${target.displayName}**...`);
    for (const n of ['3', '2', '1']) {
      await new Promise((r) => setTimeout(r, 700));
      await message.channel.send(n);
    }
    await new Promise((r) => setTimeout(r, 500));
    await message.channel.send(`\uD83D\uDCA5\uD83D\uDCA5\uD83D\uDCA5 **${target.displayName} HAS BEEN NUKED** \uD83D\uDCA5\uD83D\uDCA5\uD83D\uDCA5`);
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
      "has the personality of a terms-and-conditions page \u2014 nobody's actually read it.",
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
    const cursedEmoji = ['\uD83E\uDD21', '\uD83D\uDC80', '\uD83E\uDEE0', '\uD83D\uDC38', '\uD83D\uDC41\uFE0F', '\uD83C\uDF00'];
    message.channel.send(`\uD83D\uDE08 ${target} has been cursed for the next 3 messages...`);
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

  // 4. Simulated message "glitch"
  async glitch(message, target) {
    if (!target) return message.reply('Mention someone to glitch.');
    const sent = await message.channel.send(`${target.displayName} is stable.`);
    const stages = [
      glitchText(`${target.displayName} is stable.`),
      glitchText(`${target.displayName} is destabilizing`),
      glitchText('C O R R U P T I O N   D E T E C T E D'),
      '\uD83D\uDCBE recovering...',
      `${target.displayName} is back to normal. Mostly.`,
    ];
    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, 900));
      await sent.edit(stage).catch(() => {});
    }
  },

  // 5. DM emoji spam
  async spam(message, target) {
    if (!target) return message.reply('Mention someone to spam.');
    const line = '\uD83D\uDEA8'.repeat(20);
    try {
      for (let i = 0; i < 5; i++) await target.send(line);
      message.channel.send(`\uD83D\uDCEC ${target.displayName}'s DMs have been... blessed.`);
    } catch {
      message.channel.send(`\u274C Couldn't DM ${target.displayName} \u2014 their DMs are locked.`);
    }
  },

  // 5b. Admin-only superspam
  async superspam(message, target, args) {
    if (!target) return message.reply('Mention someone to superspam.');
    const rest = args.slice(1).filter((a) => !a.startsWith('<@'));
    let count = 10;
    let textParts = rest;
    if (rest[0] && /^\d+$/.test(rest[0])) {
      count = parseInt(rest[0]);
      textParts = rest.slice(1);
    }
    count = Math.min(Math.max(count, 1), 99);
    const text = textParts.join(' ').trim() || '\uD83D\uDEA8 SUPERSPAM \uD83D\uDEA8';
    try {
      for (let i = 0; i < count; i++) {
        await target.send(text);
        await new Promise((r) => setTimeout(r, 300));
      }
      message.channel.send(`\uD83D\uDCEC Sent "${text}" to ${target.displayName} ${count} times.`);
    } catch {
      message.channel.send(`\u274C Couldn't DM ${target.displayName} \u2014 their DMs are locked.`);
    }
  },

  // 6. DM ASCII jumpscare
  async jumpscare(message, target) {
    if (!target) return message.reply('Mention someone to jumpscare.');
    try {
      await target.send('```\n\n\n\n\n  \uD83D\uDC7B BOO \uD83D\uDC7B\n\n\n\n\n```');
      message.channel.send(`\uD83D\uDC7B ${target.displayName} has been jumpscared.`);
    } catch {
      message.channel.send(`\u274C Couldn't DM ${target.displayName} \u2014 their DMs are locked.`);
    }
  },

  // 7. Temporary nickname change
  async rename(message, target) {
    if (!target) return message.reply('Mention someone to rename.');
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames))
      return message.reply('I need Manage Nicknames permission for this.');
    if (target.roles.highest.position >= message.guild.members.me.roles.highest.position)
      return message.reply("Can't rename someone with an equal/higher role than me.");
    const original = target.nickname;
    await target.setNickname('\uD83E\uDD21 CLOWN \uD83E\uDD21').catch(() => {});
    message.channel.send(`${target.displayName} has been renamed for 60 seconds.`);
    setTimeout(async () => { await target.setNickname(original).catch(() => {}); }, 60 * 1000);
  },

  // 8. Banish to shadow realm voice channel
  async banish(message, target) {
    if (!target) return message.reply('Mention someone to banish.');
    if (!target.voice.channel) return message.reply('They need to be in a voice channel.');
    const originalChannel = target.voice.channel;
    let timeoutChannel = message.guild.channels.cache.find(
      (c) => c.name === 'the-shadow-realm' && c.type === 2
    );
    if (!timeoutChannel) {
      timeoutChannel = await message.guild.channels.create({ name: 'the-shadow-realm', type: 2 });
    }
    await target.voice.setChannel(timeoutChannel).catch(() => {
      return message.reply("Couldn't move them \u2014 check my Move Members permission.");
    });
    message.channel.send(`${target.displayName} has been banished to the shadow realm for 30 seconds.`);
    setTimeout(async () => { await target.voice.setChannel(originalChannel).catch(() => {}); }, 30 * 1000);
  },

  // 9. Short timeout
  async mute(message, target, args) {
    if (!target) return message.reply('Mention someone to mute.');
    const seconds = parseInt(args[1]) || 10;
    if (seconds > 60) return message.reply('Max 60 seconds for the prank mute.');
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply('I need Timeout Members permission for this.');
    await target.timeout(seconds * 1000, 'Prank mute').catch(() => {
      return message.reply("Couldn't mute them \u2014 check role hierarchy/permissions.");
    });
    message.channel.send(`\uD83D\uDD07 ${target.displayName} has been silenced for ${seconds} seconds.`);
  },

  // 10. Random victim lottery
  async lottery(message) {
    const online = message.guild.members.cache.filter(
      (m) => !m.user.bot && m.presence?.status && m.presence.status !== 'offline'
    );
    if (online.size === 0) return message.reply('No one online to pick from.');
    const victim = randomFrom([...online.values()]);
    message.channel.send(`\uD83C\uDFB0 The lottery has chosen... **${victim.displayName}**`);
    await commands.nuke(message, victim);
  },

  // 11. Prank leaderboard
  stats(message) {
    if (statsStore.size === 0) return message.channel.send('No one has been pranked yet.');
    const sorted = [...statsStore.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const lines = sorted.map(([id, count], i) => `${i + 1}. <@${id}> \u2014 ${count} pranks`);
    message.channel.send(`**Prank leaderboard**\n${lines.join('\n')}`);
  },

  // 12. SpongeBob mock
  async mock(message, target) {
    if (!target) return message.reply('Mention someone to mock.');
    const recent = (await message.channel.messages.fetch({ limit: 20 })).find(
      (m) => m.author.id === target.id
    );
    if (!recent) return message.reply("Couldn't find a recent message from them.");
    const mocked = recent.content
      .split('')
      .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
      .join('');
    message.reply({
      content: `"${mocked}" \u2014 ${target.displayName}, probably`,
      allowedMentions: { repliedUser: false },
    });
  },

  // 13. Fake courtroom trial
  async trial(message, target) {
    if (!target) return message.reply('Mention someone to put on trial.');
    const charges = [
      'Crimes against the group chat',
      'Excessive use of "ratio"',
      'Being mid on main',
      'Unauthorized L takes',
      'Ghosting the server for 3 days',
      'Sending a voice message longer than 60 seconds',
      'Using Comic Sans unironically',
      'Claiming they "carried" last game',
    ];
    const verdicts = [
      'GUILTY \u2014 sentenced to 1 (one) cringe.',
      'GUILTY \u2014 must send a voice memo apology within 24 hours.',
      'NOT GUILTY \u2014 the jury (a random number generator) has spoken.',
      'GUILTY \u2014 banned from using the word "bruh" for a week.',
      'GUILTY on all counts \u2014 reputation status: cooked.',
      'NOT GUILTY \u2014 case dismissed due to lack of rizz-related evidence.',
    ];
    await message.channel.send(`\u2696\uFE0F **COURT IS NOW IN SESSION** \u2696\uFE0F\nThe defendant, **${target.displayName}**, stands accused of:\n> ${randomFrom(charges)}`);
    await new Promise((r) => setTimeout(r, 1500));
    await message.channel.send('\uD83E\uDDD1\u200D\u2696\uFE0F The jury is deliberating...');
    await new Promise((r) => setTimeout(r, 1500));
    await message.channel.send(`\uD83D\uDCDC **VERDICT:** ${target.displayName} is... ${randomFrom(verdicts)}`);
  },

  // 14. Random stat rating (deletes invoking message)
  async rating(message, target) {
    await message.delete().catch(() => {});
    if (!target) return message.channel.send('Mention someone to rate.');
    const stats = ['Rizz', 'Aura', 'Drip', 'IQ', 'Sigma energy', 'Clutch factor', 'Vibe check'];
    const lines = stats
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((s) => `${s}: ${Math.floor(Math.random() * 21) - 10}/10`);
    message.channel.send(`\uD83D\uDCCA **Rating for ${target.displayName}**\n${lines.join('\n')}`);
  },

  // 15. Ship two members (deletes invoking message)
  async ship(message) {
    await message.delete().catch(() => {});
    const mentioned = [...message.mentions.members.values()];
    if (mentioned.length < 2)
      return message.channel.send('Mention two people to ship, e.g. `!ship @a @b`.');
    const [a, b] = mentioned;
    const name =
      a.displayName.slice(0, Math.ceil(a.displayName.length / 2)) +
      b.displayName.slice(Math.floor(b.displayName.length / 2));
    const percent = Math.floor(Math.random() * 101);
    message.channel.send(`\uD83D\uDC9E **${a.displayName} + ${b.displayName} = ${name}**\nCompatibility: ${percent}%`);
  },

  // 16. Unhinged magic 8-ball (deletes invoking message)
  async eightball(message, target, args) {
    await message.delete().catch(() => {});
    const question = args.slice(1).join(' ');
    if (!question)
      return message.channel.send('Ask the 8-ball something, e.g. `!8ball will I win?`');
    const answers = [
      'Absolutely not, and I felt bad for you asking.',
      "Yes, but at a cost you're not ready for.",
      'The bot has seen your search history. No.',
      'Signs point to yes, oddly enough.',
      "Ask again when you've touched grass.",
      'It is certain. Suspiciously certain.',
      'My sources (a random number) say no.',
      '100%. Do not question it.',
    ];
    message.channel.send(`\uD83C\uDFB1 ${randomFrom(answers)}`);
  },
};

// 8ball alias (keys can't start with a number)
commands['8ball'] = commands.eightball;

// ---------- stats store ----------
const statsStore = new Map();

// ---------- event ----------
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
      message.channel.send('Something broke. Check the console.').catch(() => {});
    }
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
