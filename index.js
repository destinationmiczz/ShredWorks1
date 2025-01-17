const express = require('express');
const fs = require('fs');
const noblox = require('noblox.js');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const groupId = parseInt(process.env.GROUP_ID, 10);
const robloxCookie = process.env.ROBLOX_COOKIE;

const banListFilePath = 'banList.json'; // File where the ban list will be saved

// Helper function to read ban list from the file
function readBanList() {
    if (fs.existsSync(banListFilePath)) {
        const data = fs.readFileSync(banListFilePath, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

// Helper function to write ban list to the file
function writeBanList(banList) {
    fs.writeFileSync(banListFilePath, JSON.stringify(banList, null, 2), 'utf8');
}

app.use(express.json());

// Initialize Noblox.js
(async () => {
    try {
        await noblox.setCookie(robloxCookie);
        console.log('Logged into Roblox successfully!');
    } catch (error) {
        console.error('Failed to log into Roblox:', error.message);
        process.exit(1);
    }
})();

// In-memory blacklist
const blacklist = [];

// Endpoint to ban a player
app.post('/ban', (req, res) => {
    const { playerId, reason } = req.body;

    if (!playerId) {
        return res.status(400).send('Player ID is required.');
    }

    let banList = readBanList();

    // Add player to the ban list and simulate a successful ban action
    const bannedPlayer = { 
        user_id: playerId, 
        reason: reason || "No reason provided", 
        ban_time: new Date().toISOString(),
        status: 'banned'
    };

    banList.push(bannedPlayer);
    writeBanList(banList); // Save the updated ban list to the file

    res.status(200).send({
        message: `Player ${playerId} has been banned.`,
        bannedPlayer: bannedPlayer
    });
});

// Endpoint to fetch the ban list or query a specific player
app.get('/bans', (req, res) => {
    const banList = readBanList();
    const { playerId } = req.query;

    if (playerId) {
        const bannedPlayer = banList.find(player => player.user_id === playerId);

        if (bannedPlayer) {
            return res.json({
                message: `Player ${playerId} is banned.`,
                bannedPlayer
            });
        } else {
            return res.status(404).json({
                message: `Player ${playerId} is not banned.`,
            });
        }
    }

    // If no playerId is provided, return the entire ban list
    res.json({
        bannedPlayers: banList
    });
});

// Endpoint to unban a player
app.post('/unban', (req, res) => {
    const { playerId } = req.body;

    if (!playerId) {
        return res.status(400).send('Player ID is required.');
    }

    let banList = readBanList();
    banList = banList.filter(player => player.user_id !== playerId); // Remove the player from the ban list
    writeBanList(banList);

    res.status(200).send({
        message: `Player ${playerId} has been unbanned.`
    });
});

// Set Rank Endpoint
app.post('/set-rank', async (req, res) => {
    const { userId, rankId } = req.body;
    if (!userId || rankId == null) {
        return res.status(400).send('userId and rankId are required.');
    }

    try {
        const rankName = await noblox.setRank(groupId, userId, rankId);
        res.status(200).send({ message: `Rank updated to ${rankName} successfully.` });
    } catch (error) {
        res.status(500).send({ error: 'Failed to update rank.', details: error.message });
    }
});

// Blacklist Rank Endpoint
app.post('/blacklist-rank', (req, res) => {
    const { userId, rankThreshold } = req.body;
    if (!userId || rankThreshold == null) {
        return res.status(400).send('userId and rankThreshold are required.');
    }

    blacklist.push({ userId, rankThreshold });
    res.status(200).send({ message: `User ${userId} blacklisted from rank ${rankThreshold} and higher.` });
});

// Middleware to Check Blacklist
app.use((req, res, next) => {
    const { userId, rankId } = req.body;
    const userBlacklist = blacklist.find(entry => entry.userId === userId);

    if (userBlacklist && rankId >= userBlacklist.rankThreshold) {
        return res.status(403).send({ error: 'User is blacklisted from this rank or higher.' });
    }

    next();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
