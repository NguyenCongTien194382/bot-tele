import axios from "axios";
import cmd from 'node-cmd'
import { formatDate } from './helper.js'
import { getTimeUpdate, updateTimeUpdate } from "./query_model.js";

export const getHistory = async (address_wallet) => {
    try {
        const limit = 5
        const offset = 0
        const response = await axios({
            method: "get",
            url: `https://testnet.toncenter.com/api/index/getTransactionsByAddress?address=${address_wallet}&limit=${limit}&offset=${offset}&include_msg_body=true`,
        })
        const responseInfoWallet = cmd.runSync(`curl "https://testnet.toncenter.com/api/v2/getWalletInformation?address=${address_wallet}" ^
        -H "authority: testnet.toncenter.com" ^
        -H "accept: application/json, text/plain, */*" ^
        -H "accept-language: vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5" ^
        -H "cache-control: no-cache" ^
        -H "origin: https://testnet.tonscan.org" ^
        -H "pragma: no-cache" ^
        -H "referer: https://testnet.tonscan.org/" ^
        -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"122^\^", ^\^"Not(A:Brand^\^";v=^\^"24^\^", ^\^"Google Chrome^\^";v=^\^"122^\^"^" ^
        -H "sec-ch-ua-mobile: ?0" ^
        -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
        -H "sec-fetch-dest: empty" ^
        -H "sec-fetch-mode: cors" ^
        -H "sec-fetch-site: cross-site" ^
        -H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" ^
        -H "x-api-key: 1b651340a347951cc8b9a102c406ab2a05226d59d6354aa009049d6fbbb17b0b"`)
        const infoWallet = JSON.parse(responseInfoWallet.data)
        const data = response.data
        const history = data.map(item => {
            let value
            const status = item.in_msg.value !== 0 ? 'IN' : 'OUT'
            if (status === 'IN') {
                value = item.in_msg.value / 1000000000
            }
            else {
                value = item.out_msgs[0].value / 1000000000
            }
            return {
                time: formatDate(item.utime * 1000),
                status,
                value
            }
        })
        return { status: true, data: history, balance: infoWallet.result.balance / 1000000000 }
    } catch (error) {
        console.log(error)
        if (error?.response?.data?.error === 'Invalid address') {
            return { status: false, message: 'Invalid address' }
        }
        return { status: false, message: '' }
    }
}

export const getNewTransaction = async (address_wallet) => {
    try {
        const limit = 5
        const offset = 0
        const response = cmd.runSync(`curl "https://testnet.toncenter.com/api/index/getTransactionsByAddress?address=${address_wallet}&limit=${limit}&offset=${offset}&include_msg_body=true" ^
        -H "authority: testnet.toncenter.com" ^
        -H "accept: application/json, text/plain, */*" ^
        -H "accept-language: vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5" ^
        -H "cache-control: no-cache" ^
        -H "origin: https://testnet.tonscan.org" ^
        -H "pragma: no-cache" ^
        -H "referer: https://testnet.tonscan.org/" ^
        -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"122^\^", ^\^"Not(A:Brand^\^";v=^\^"24^\^", ^\^"Google Chrome^\^";v=^\^"122^\^"^" ^
        -H "sec-ch-ua-mobile: ?0" ^
        -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^" ^
        -H "sec-fetch-dest: empty" ^
        -H "sec-fetch-mode: cors" ^
        -H "sec-fetch-site: cross-site" ^
        -H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" ^
        -H "x-api-key: 1b651340a347951cc8b9a102c406ab2a05226d59d6354aa009049d6fbbb17b0b"`)

        const data = JSON.parse(response.data)
        const timestamp_old = await getTimeUpdate(address_wallet)
        const new_transaction = data.filter(item => item.utime > timestamp_old)
        if (new_transaction.length > 0) {
            await updateTimeUpdate(address_wallet, new_transaction[0].utime)
        }
        return new_transaction.map(item => {
            let value, address
            const status = item.in_msg.value !== 0 ? 'IN' : 'OUT'
            if (status === 'IN') {
                value = item.in_msg.value / 1000000000
                address = item.in_msg.destination
            }
            else {
                value = item.out_msgs[0].value / 1000000000
                address = item.out_msgs[0].destination
            }
            return {
                time: formatDate(item.utime * 1000),
                status,
                value,
                address
            }
        })
    } catch (error) {
        console.log(error)
    }
}