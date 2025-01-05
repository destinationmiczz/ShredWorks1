const express = require('express');
const fs = require('fs');
const noblox = require('noblox.js');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const groupId = 35333405;
const robloxCookie = _|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_6C4BB8986C61269AE6F527BC39569CF504700A9C18117B0FCA4C3A458BA6A7AC06D6375A61DA612FBF4710F8BC496F89615FD1B5D82C0D5773E9331B6379700BB2F22AF459926A61A36F5E2445A5C9A23EA1D94791455C8CD0C981E7FD28D988A1182606C861B3936EBF8E7C969634530280F3B785B0130F6A34EE28D3F96475B18A01F66C4CE073323F6B621D116789E0BD0A5719C5961961D6B6131B35B035B90204171ADACBFC14ADA1B4BAEF77520D48F0CA2CA27B54CF6377EE78CDAFC535CB657AB613377574338915C652BFE77DC56FD679582D4CC120BA6966BDFE84B5AB85A9A8F885B638FD5506AE9CF0501B099EC22BE0498437F6063748F8326F46B1E8903563128A02039884EC7B66EC8193F840C48AFF0B625BEC49947AAAF99E6101A9F1932DAA6A1B513E37366733E9D002C608E33D3FB165AE3A0A052A8BF5784DDAC1B852FDC2032228A14D03CD2ED20D08E71B6AA3F7E528E7A2CEF5B5B2C3CF30772322FB653CDB1940FA0FDAF4AEECFF9A2A39305AB81DDAFC05FC8D8A6716CC5C3850DD52E86C2A7A3A8D98C072E94C5ADBBE2DCC0CF09FF7A807F625A74F4783575E48847AB448E98F72E1D173F84F7043B229A8E1A8714BEFC8B3810BD085E93831E5A3960B00BF4B35E7DC825833B0B9F7082446DC0CCC05D04352FB71FE7B718870F63F9E1E20BEE4CF6D57E0CEC0C82DDA234415E9A98DE3A40DCD763473673BEFD4462E58973E409A6B62ADF25145741027B2ACD94A231E992A652682052B38C8474F95A4D9AC10E46BDAB1F3617EABFC1E873C26ABB0FFFFAFA7F73B59D87075455A64FF12935845A9DDB82DBC3C8CC8D0964D887137E8045F7A76C933A7EF1A99E9D870F6CB2F14367D806749A871C4A88FF15BC578E6FF32BA7AEBF4654C70ABF3C2254592CBFA6510A273D3327CF900D47602546FFDB41BD6F62CAA324C68BE220FC3F1A566E852414ED9B733E983BABB0A5405DB80785B543069376D3C8582EB1FA38FCF9F2727B22A00AD9BEB40CD99A105C7FB8891E577FC42A5F9D0EE8637B2A120CB8E88A58FEDA3A059D69149022E0916E187580AD4B21032FBFBA1EE59678F214C9826591CF45EA847CA11357970D4ABDDB3C88E39A4117798F6D4C3C2FE72CABB2EEE114B4575CB39F9A901BAEBE04208DA379DB92096;

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
