# Prank bot

Harmless prank commands for a Discord server. Nothing here touches anyone's actual device — it's all fake effects inside Discord.

## Commands

| Command | Effect |
|---|---|
| `!nuke @user` | Countdown + fake "explosion" flood in chat |
| `!roast @user` | Random harmless roast line |
| `!curse @user` | Reacts with cursed emoji on their next 3 messages |
| `!glitch @user` | Bot edits its own message to simulate corrupting text |
| `!spam @user` | DMs them a wall of emoji (fails gracefully if DMs closed) |
| `!superspam @user [count] [text]` | Admin-only: DM floods with custom text and count (max 99) |
| `!jumpscare @user` | DMs an ASCII "boo" |
| `!rename @user` | Temporary nickname change, auto-reverts after 60s |
| `!banish @user` | Moves them to a "shadow realm" voice channel for 30s, then back |
| `!mute @user 10` | Short official Discord timeout (max 60s) |
| `!lottery` | Picks a random online member and nukes them |
| `!stats` | Leaderboard of who's been pranked most |
| `!mock @user` | Replies with a SpongeBob-case echo of their last message |
| `!trial @user [custom charge]` | Fake courtroom trial — add a custom charge or leave blank for a random one |
| `!rating @user` | Rates them on 3 random stats out of 10 (deletes your message) |
| `!ship @user1 @user2` | Ships two people with a compatibility % (deletes your message) |
| `!8ball [question]` | Unhinged magic 8-ball answer (deletes your message) |
| `!imposter` | Calls an emergency meeting and accuses a random server member |

## Setup

### 1. Create the bot
1. Go to https://discord.com/developers/applications and create a new application.
2. Under **Bot**, enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
3. Copy the bot token — you'll need it for Railway, not for a local `.env` file.
4. Invite the bot to your server with these permissions: Manage Nicknames, Moderate Members (timeout), Move Members, Manage Messages, Send Messages, Read Message History, Add Reactions.

### 2. Push to GitHub
```bash
cd prank-bot
git init
git add .
git commit -m "Initial commit"
```
Create a new repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/prank-bot.git
git branch -M main
git push -u origin main
```
`.env` is already excluded via `.gitignore` — never commit your token.

### 3. Deploy on Railway
1. Go to https://railway.app and log in with GitHub.
2. **New Project** → **Deploy from GitHub repo** → select `prank-bot`.
3. Railway auto-detects Node.js and runs `npm install` then `npm start`.
4. In the Railway project, go to **Variables** and add:
   - `DISCORD_TOKEN` = your bot token
5. Railway redeploys automatically. Check the **Deployments** logs for `Logged in as ...` to confirm it's running.

The bot now stays online continuously, same as the stock bot — no local terminal needs to stay open.

## Notes

- `!rename` and `!banish` need the bot's role positioned above the target's highest role.
- `!mute` uses Discord's real timeout feature, capped at 60 seconds so it can't be abused.
- `!superspam` is admin-only. Usage: `!superspam @user 20 you are cooked` — the number is the DM count, the rest is the message. Defaults to 10 DMs if no count given.
- `!trial` supports a custom charge: `!trial @user eating cereal with water`. Leave it blank for a random charge from the built-in list.
- Stats reset if the bot restarts (in-memory only) — swap in a JSON file or database if you want it to persist.
