import { groupRepo, feedRepo, itemRepo, Feed, Group, Item } from '../repository'

import { groups, items, feeds, listUnreadItemIds, listSavedItemIds, mark } from '../api'

import { FeedItem, ItemType, Subscription, SubscriptionFeed } from './types';

export enum LsItemType { GROUP, FEED }

export enum Marked { ITEM, FEED, GROUP }

const feedsCache: any = {}

/**
 * 刷新同步数据到本地
 */
export async function sync() {
    // 同步group
    (await groups()).groups.forEach((g: any) => {
        groupRepo.save({ id: g.id, title: g.title })
    });
    // 同步feed
    const data = (await feeds())
    const fid2gid: any = {}
    data.feeds_groups.forEach((gf: any) => {
        gf.feed_ids.split(',').forEach((fid: string) => {
            fid2gid[fid + ''] = gf.group_id
        })
    })
    data.feeds.forEach((f: any) => {
        feedRepo.save({ id: f.id, title: f.title, url: f.url, siteUrl: f.site_url, groupId: fid2gid[f.id + ''] })
        feedsCache[f.id] = f
    })
    // 同步items
    let lastId = await itemRepo.maxId()
    lastId = lastId ? lastId : 0
    let hasNext: boolean = true
    let fItems: any[] = []
    while (hasNext) {
        fItems = (await items({ since_id: lastId })).items
        hasNext = fItems.length == 50
        fItems.forEach((item: any) => {
            itemRepo.save({ id: item.id, feedId: item.feed_id, title: item.title, author: item.author, description: item.html, pubDate: item.created_on_time, link: item.url })
        })
        lastId += 50
    }

}

export async function listItem(id: any, type: LsItemType, page: number = 0, onlyread: boolean = false, unReadItemIds: Set<number>): Promise<FeedItem[] | undefined> {
    let feedIds: Set<number> = new Set([id])
    let res: FeedItem[]
    switch (type) {
        case LsItemType.FEED:
            res = (await itemRepo.findAll(item => filterItem(item, feedIds, onlyread, unReadItemIds))).map(map)
            break
        case LsItemType.GROUP:
            feedIds = new Set((await feedRepo.getAll()).filter(item => item.groupId == id).map(item => item.id))
            res = (await itemRepo.findAll(item => filterItem(item, feedIds, onlyread, unReadItemIds))).map(map)
            break
        default:
            throw Error('error')
    }
    res.reverse()
    console.log(res)
    return res
}


export async function listSubscription(): Promise<Subscription[] | undefined> {
    const groups: Group[] = await groupRepo.getAll();
    const feeds: Feed[] = await feedRepo.getAll()
    let all: Subscription[] = groups.map(g => ({ id: g.id, title: g.title, feeds: [] }))
    all.push({ id: -1, title: '未分类', feeds: [] })
    let gid2group: any = {}
    all.forEach(item => {
        gid2group[item.id] = item
    })
    feeds.forEach(f => {
        const sf: SubscriptionFeed = { id: f.id, title: f.title, url: f.url, unReadQty: 0 }
        if (f.groupId) {
            gid2group[f.groupId].feeds.push(sf)
        } else {
            gid2group[-1].feeds.push(sf)
        }
    })
    return all
}

export async function sumUnread(feedId: number, unReadItemIds: Set<number>): Promise<number> {
    return (await itemRepo.findAll(item => item.feedId == feedId && unReadItemIds.has(item.id))).length
}
/**
 * 
 * @returns 未阅读的itemid
 */
export async function listUnreadIds(): Promise<number[]> {
    return (await listUnreadItemIds()).unread_item_ids.split(',').map((id: string) => Number(id))
}

/**
 * 
 * @returns 已保存的itemid
 */
export async function listSavedIds(): Promise<number[]> {
    return (await listSavedItemIds()).saved_item_ids.split(',').map((id: string) => Number(id))
}

/**
 *  已读
 * @param id 
 * @param marked|group|feed 
 * @param before 时间戳
 * @returns 
 */
export async function read(id: number, marked: Marked, before?: number): Promise<any> {
    return await mark({
        id: id,
        as: 'read',
        mark: Marked[marked].toLowerCase(),
        before: before
    })
}

/**
 * 未读
 * @param id 
 * @param marksed item|group|feed 
 * @param before 时间戳
 * @returns 
 */
export async function unread(id: number, marked: Marked, before?: number): Promise<any> {
    return await mark({
        id: id,
        as: 'unread',
        mark: Marked[marked].toLowerCase(),
        before: before
    })
}

/**
 * 保存
 * @param id 
 * @returns 
 */
export async function save(id: number): Promise<any> {
    return await mark({
        id: id,
        as: 'saved',
        mark: 'item'
    })
}

/**
 * 取消保存
 * @param id 
 * @returns 
 */
export async function unsave(id: number): Promise<any> {
    return await mark({
        id: id,
        as: 'unsaved',
        mark: 'item'
    })
}

function filterItem(item: Item, feedIds: Set<number>, onlyread: boolean = false, unReadItemIds: Set<number>): boolean {
    return feedIds.has(item.feedId) && (!onlyread || unReadItemIds.has(item.feedId))
}

function map(item: Item): FeedItem {
    const imgs = extImgs(item.description)
    const thumbnail: string | undefined = imgs && imgs.length > 0 ? imgs[0] : undefined
    const type: ItemType = imgs.length > 5 ? ItemType.IMAGE : ItemType.BASIC
    const text = extText(item.description)
    const summary: string = text && text.length > 36 ? text.substring(0, 36) : text
    const d: number = item.pubDate * 1000
    const datestr: string = formatDate(d)
    const feed = feedsCache[item.feedId]
    return {
        ...item,
        thumbnail,
        summary,
        datestr,
        imgs,
        type,
        feed
    }
}

function extImgs(htmlContent: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 找到所有 <img> 标签
    const imgTags = doc.querySelectorAll('img');

    // 提取每个 <img> 标签的 src 属性
    return Array.from(imgTags).map(img => img.src);
}

function extText(htmlContent: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    return doc.body.innerText
}

function formatDate(date: number): string {
    // ... existing code ...
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    };
    return new Date(date).toLocaleDateString("zh-CN", options);
}