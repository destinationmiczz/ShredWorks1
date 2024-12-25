const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

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

// Endpoint to fetch the ban list
app.get('/bans', (req, res) => {
    const banList = readBanList();
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
