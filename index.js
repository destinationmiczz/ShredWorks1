const express = require('express');
const fs = require('fs');
const noblox = require('noblox.js');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // For API calls to Discord

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const groupId = parseInt(process.env.GROUP_ID, 10);
const robloxCookie = process.env.ROBLOX_COOKIE;
const discordBotToken = process.env.DISCORD_BOT_TOKEN; // Add your Discord bot token here

const banListFilePath = 'banList.json';

// Helper functions for ban list
function readBanList() {
    if (fs.existsSync(banListFilePath)) {
        const data = fs.readFileSync(banListFilePath, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

function writeBanList(banList) {
    fs.writeFileSync(banListFilePath, JSON.stringify(banList, null, 2), 'utf8');
}

// Middleware and initialization
app.use(express.json());
(async () => {
    try {
        await noblox.setCookie(robloxCookie);
        console.log('Logged into Roblox successfully!');
    } catch (error) {
        console.error('Failed to log into Roblox:', error.message);
        process.exit(1);
    }
})();

// Ban-related endpoints (same as before)
app.post('/ban', (req, res) => { /* unchanged */ });
app.get('/bans', (req, res) => { /* unchanged */ });
app.post('/unban', (req, res) => { /* unchanged */ });
app.post('/set-rank', async (req, res) => { /* unchanged */ });
app.post('/blacklist-rank', (req, res) => { /* unchanged */ });
app.use((req, res, next) => { /* unchanged */ });

// Generate Discord Transcript
app.post('/generate-transcript', async (req, res) => {
    const { channelId } = req.body;

    if (!channelId) {
        return res.status(400).json({ error: 'Channel ID is required.' });
    }

    try {
        let allMessages = [];
        let lastMessageId = null;

        // Paginate through messages
        while (true) {
            const url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100${lastMessageId ? `&before=${lastMessageId}` : ''}`;
            const response = await fetch(url, {
                headers: { Authorization: `Bot ${discordBotToken}` },
            });

            if (!response.ok) {
                return res.status(response.status).json({ error: `Failed to fetch messages: ${response.statusText}` });
            }

            const messages = await response.json();

            if (messages.length === 0) break; // Stop if no more messages are returned

            allMessages = allMessages.concat(messages);
            lastMessageId = messages[messages.length - 1].id; // Update the lastMessageId for pagination
        }

        // Generate HTML-styled transcript
        const transcriptHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Discord Transcript</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #36393F;
                    color: #DCDDDE;
                    margin: 0;
                    padding: 0;
                }
                .channel {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #2F3136;
                    border-radius: 8px;
                }
                .message {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 10px;
                }
                .content {
                    flex: 1;
                }
                .username {
                    font-weight: bold;
                    color: #FFFFFF;
                }
                .timestamp {
                    margin-left: 5px;
                    font-size: 0.85em;
                    color: #B9BBBE;
                }
                .text {
                    margin: 5px 0 0;
                }
            </style>
        </head>
        <body>
            <div class="channel">
                ${allMessages
                  .reverse()
                  .map(
                    msg => `
                    <div class="message">
                        <img class="avatar" src="${msg.author.avatar ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="${msg.author.username}'s avatar">
                        <div class="content">
                            <div>
                                <span class="username">${msg.author.username}</span>
                                <span class="timestamp">[${new Date(msg.timestamp).toLocaleString()}]</span>
                            </div>
                            <div class="text">${msg.content}</div>
                        </div>
                    </div>
                    `
                  )
                  .join('')}
            </div>
        </body>
        </html>
        `;

        res.header('Content-Type', 'text/html');
        res.send(transcriptHTML);

    } catch (error) {
        console.error('Error generating transcript:', error);
        res.status(500).json({ error: 'Failed to generate transcript.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
