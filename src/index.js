import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
dotenv.config();

import botTelegram from './service/setting_bot.js';

const PORT = process.env.PORT || 9000;

const app = express();

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.URL_DATABASE_MONGO);
        console.log("Connected to mongoDB.");
    } catch (error) {
        throw error;
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("mongoDB disconnected!");
});
botTelegram.launch()


app.listen(PORT, async () => {
    await connectDatabase()
    console.log(`Server is running on http://localhost:${PORT}`);
});