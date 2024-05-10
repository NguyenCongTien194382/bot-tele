import mongoose from "mongoose";

const WalletsSchema = new mongoose.Schema(
    {
        address_wallet: {
            type: String
        },
        idTelegram: {
            type: String,
        },
        userName: {
            type: String
        },
        lastUpdateAt: {
            type: Number,
            default: 0
        },
    },
    {
        collection: 'Wallets',
        versionKey: false,
        timestamp: true
    }
);

export default mongoose.model("Wallets", WalletsSchema);