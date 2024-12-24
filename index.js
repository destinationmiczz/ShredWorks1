const express = require('express');
const app = express();
const PORT = 3000;

let banList = []; // Store banned player IDs

app.use(express.json());

// Endpoint to ban a player
app.post('/ban', (req, res) => {
    const { playerId, reason } = req.body;

    if (!playerId) {
        return res.status(400).send('Player ID is required.');
    }

    // Add player to the ban list and simulate a successful ban action
    const bannedPlayer = { 
        user_id: playerId, 
        reason: reason || "No reason provided", 
        ban_time: new Date().toISOString(),
        status: 'banned'
    };

    banList.push(bannedPlayer);

    res.status(200).send({
        message: `Player ${playerId} has been banned.`,
        bannedPlayer: bannedPlayer
    });
});

// Endpoint to fetch the ban list
app.get('/bans', (req, res) => {
    res.json({
        bannedPlayers: banList
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
