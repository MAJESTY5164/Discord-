const express = require('express');
const { Client } = require('discord.js-selfbot-v13');
const fetch = require('node-fetch');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Helper function to check if the token belongs to a bot
async function checkBot(botToken) {
    console.log(botToken);
    try {
        const response = await fetch('https://discord.com/api/v10/users/@me', {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${botToken}`  // Authorization header with the bot token
            }
        });
        const data = await response.json();

        if (data.id) {
            return { 
                type: 'bot', 
                botId: data.id, 
                username: data.username, 
                discriminator: data.discriminator, 
                avatar: data.avatar 
            };
        }
        return null;
    } catch (error) {
        return null;  // If the request fails, return null
    }
}

// Helper function to check if the token belongs to a user
async function checkUser(userToken) {
    const client = new Client({ checkUpdate: false }); // Create a new client instance for each token
    try {
        await client.login(userToken);  // Try logging in with the user token
        return {
            type: 'user',
            userId: client.user.id,
            username: client.user.username,
            displayName: client.user.displayName,
            avatar: client.user.displayAvatarURL({ format: 'png', size: 1024 })
        };
    } catch (err) {
        return null;  // If login fails, return null
    } finally {
        client.destroy();  // Destroy the client instance to free up resources
    }
}

// Route to check if the token is valid
app.post('/check', async (req, res) => {
    const { token } = req.body;  // Get token from request body

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    // Check if the token belongs to a bot
    const botData = await checkBot(token);
    if (botData) {
        return res.json({ message: 'Token belongs to a bot', data: botData });
    }

    // Check if the token belongs to a user
    const userData = await checkUser(token);
    if (userData) {
        return res.json({ message: 'Token belongs to a user', data: userData });
    }

    // If neither a bot nor user, return invalid
    return res.json({ message: 'Invalid token' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
