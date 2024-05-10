import { Telegraf } from "telegraf";
import cron from 'node-cron'
import { getUserFromAddressWallet, createWallet, getListMyWallet, deleteWallet, getListAddressWallet } from './query_model.js'
import { getHistory, getNewTransaction } from "./fetch_data.js";

const botTelegram = new Telegraf('7128951441:AAEvU9lWTZCJbKYIMT-Hj00F41IJ9gNDYTQ');

let userStates = {};

botTelegram.start((ctx) =>
    ctx.reply(`Welcome ${ctx.chat.first_name} ${ctx.chat.last_name} to ton eduto`)
);

botTelegram.command('info', (ctx) => {
    console.log(ctx)
    ctx.reply('Please enter address wallet:');
    userStates[ctx.from.id] = 'info'
});

botTelegram.command('newmywallet', async (ctx) => {
    const user = ctx.chat
    ctx.reply('Please enter address wallet:');
    userStates[ctx.from.id] = 'newmywallet'
})

botTelegram.command('mywallet', async (ctx) => {
    const user = ctx.chat
    const response = await getListMyWallet(user.id)
    if (response.length > 0) {
        let message = ''
        response.map((item, index) => {
            message += `${index + 1}. Address wallet: ${item.address_wallet}\n`
            message += `Balance: ${item.balance} TON\n`
            item.transaction.map(transaction_item => {
                message += `${transaction_item.time}    ${transaction_item.status}     ${transaction_item.value} TON\n`
            })
        })
        ctx.reply(message);
    }
    else {
        ctx.reply(`Wallet empty`);
    }
})

botTelegram.command('deletewallet', async (ctx) => {
    const user = ctx.chat
    ctx.reply('Please enter address wallet:');
    userStates[ctx.from.id] = 'deletewallet'
})

botTelegram.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const user = ctx.from;
    if (userStates[`${userId}`] === 'info') {
        const address_wallet = ctx.message.text;
        const response = await getHistory(address_wallet)
        if (response.status === false) {
            ctx.reply(`Address wallet not found`);
        }
        let message = ''
        const username = await getUserFromAddressWallet(address_wallet)
        if (username) {
            message += `User Name: ${username}\n`
        }
        if (response?.data?.length > 0) {
            message += `Balance: ${response.balance} TON\n`
            message += `History 5 new transaction:\n`
            response.data.map(item => {
                message += `${item.time}    ${item.status}     ${item.value} TON\n`
            })
        }
        if (message === '') {
            ctx.reply(`History transaction not found`);
        } else {
            ctx.reply(message);
        }
    }
    if (userStates[`${userId}`] === 'newmywallet') {
        const address_wallet = ctx.message.text
        const wallet = await createWallet(address_wallet, user.id, user.first_name + ' ' + user.last_name)
        if (wallet) {
            ctx.reply(`Successfully added!`);
        }
        else {
            ctx.reply(`Error alert!`);
        }
    }
    if (userStates[`${userId}`] === 'deletewallet') {
        const address_wallet = ctx.message.text
        const wallets = await deleteWallet(address_wallet, user.id)
        ctx.reply(`Successfully removed!`);
    }
});

cron.schedule('*/15 * * * * *', async () => {
    const wallet = await getListAddressWallet()
    for (let i = 0; i < wallet.length; i++) {
        const transaction = await getNewTransaction(wallet[i].address_wallet)
        if (transaction.length > 0) {
            let message = `We would like to inform you that there have been ${transaction.length} recent ${transaction.length === 1 ? 'transaction' : 'transactions'} on your account:\n`
            transaction.map((item, index) => {
                message += `${wallet[i].address_wallet}\n`
                message += `Transaction ${item.status}: ${item.time} ${item.value} TON\n`
            })
            botTelegram.telegram.sendMessage(5967856743, message)
        }
    }
});

process.once('SIGINT', () => bot.stoAp('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


export default botTelegram