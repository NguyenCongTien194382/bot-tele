import Wallet from '../models/Wallet.js'
import { getHistory } from './fetch_data.js'

export const getUserFromAddressWallet = async (address_wallet) => {
    try {
        let name = ''
        const wallets = await Wallet.find(address_wallet)
        if (wallets.length > 0) {
            wallets.map(item => name = name + item.userName + ' ')
            return userName
        }
    } catch (error) {

    }
}

export const createWallet = async (address_wallet, idTelegram, userName) => {
    try {
        const wallet = await Wallet.create({
            address_wallet,
            idTelegram,
            userName
        })
        return wallet
    } catch (error) {
        console.log(error)
    }
}

export const getListMyWallet = async (idTelegram) => {
    try {
        const data = []
        const wallets = await Wallet.find({ idTelegram })
        for (let i = 0; i < wallets.length; i++) {
            const response = await getHistory(wallets[i].address_wallet)
            data.push({
                address_wallet: wallets[i].address_wallet,
                transaction: response.status ? response.data : [],
                balance: response.balance
            })
        }
        return data
    } catch (error) {
        console.log(error)
    }
}

export const deleteWallet = async (address_wallet, idTelegram) => {
    try {
        const wallets = await Wallet.deleteMany({ address_wallet, idTelegram })
        return wallets
    } catch (error) {
        console.log(error)
    }
}

export const updateTimeUpdate = async (address_wallet, timestamp) => {
    try {
        await Wallet.updateMany({ address_wallet }, { lastUpdateAt: timestamp })
        return true
    } catch (error) {

    }
}

export const getTimeUpdate = async (address_wallet) => {
    try {
        const wallet = await Wallet.findOne({ address_wallet })
        return wallet.lastUpdateAt
    } catch (error) {

    }
}

export const getListAddressWallet = async () => {
    try {
        const wallet = await Wallet.find().lean()
        return wallet
    } catch (error) {

    }
}