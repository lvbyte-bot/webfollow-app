import { itemRepo } from "@/repository"
let feeds = JSON.parse(localStorage.getItem('readfeeds') || '{}')

// 后期需要根据时间往下掉
export function readItem(feedId: number, itemId: number) {
    if (feeds.hasOwnProperty(feedId)) {
        feeds[feedId] = feeds[feedId] + 1
    } else {
        feeds[feedId] = 1
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