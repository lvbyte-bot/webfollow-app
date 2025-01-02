import { itemRepo } from "@/repository"
let feeds = JSON.parse(localStorage.getItem('readfeeds') || '{}')

// 后期需要根据时间往下掉
export function readItem(feedId: number, itemId: number) {
    log('read-item', itemId)
    if (feeds['itemids']) {
        feeds.itemids.push(itemId)
        let feedread = feeds.feedread || {}
        if (feedread.hasOwnProperty(feedId)) {
            feedread[feedId] = feedread[feedId] + 1
        } else {
            feedread[feedId] = 1
        }
    } else {
        if (feeds.hasOwnProperty(feedId)) {
            feeds[feedId] = feeds[feedId] + 1
        } else {
            feeds[feedId] = 1
        }
        feeds = { itemids: [itemId], feedread: feeds }
    }
    localStorage.setItem('readfeeds', JSON.stringify(feeds))
}


export async function ranks() {
    const feedItemCounts: any = {}
    for await (let feedId of Object.keys(feeds)) {
        feedItemCounts[feedId] = await itemRepo.count()
    }
    return listRank(feedItemCounts)
}

function listRank(feedItemCounts: any): any {
    let feedranks: any = {}
    let total = 0
    for (let feedId in feeds) {
        total += feeds[feedId]
    }
    for (let feedId in feeds) {
        let readQty = feeds[feedId]
        if (readQty) {
            const rank = 10 - (readQty > feedItemCounts[feedId] ? 1 : (readQty / feedItemCounts[feedId])) * 7 - (readQty > total ? 1 : readQty / total) * 3
            feedranks[feedId] = rank
        }
    }
    return feedranks
}