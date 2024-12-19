import { groupRepo, feedRepo, itemRepo, Feed, Group, Item, isDbExists, Page } from '../repository'

import { groups, items, feeds, listUnreadItemIds, listSavedItemIds, ext, mark } from '../api'

import { FeedItem, ItemType, Subscription, SubscriptionFeed, LsItemType } from './types';

import { html2md, md2html } from '@/utils/mdUtils';

import { readItem } from './recommend';



export enum Marked { ITEM, FEED, GROUP }

const feedsCache: any = {}

let ranks = {}

export function setRanks(ranks0: any) {
    ranks = ranks0
}

export async function getItemTotal(): Promise<number> {
    return await itemRepo.count()
}

/**
 * 刷新同步数据到本地
 */
export async function sync() {
    await isDbExists();

    // await groupRepo.count();
    // console.log(await favicons({id:1}));
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
    })
    const sids = await listSavedIds()
    const uids = await listUnreadIds()
    const syncItemIds = new Set([...uids, ...sids])
    const localMaxId = await itemRepo.maxId()
    const remoteIds = Array.from(syncItemIds)
    if (localMaxId >= Math.max(...remoteIds)) {
        return
    }
    let syncItemIdArray = await remoteIds.filter(async (id) => ! await itemRepo.existsId(id))
    let total = remoteIds.length - syncItemIdArray.length
    for (let with_ids of idsto50str(syncItemIdArray)) {
        let fItems = (await items({ with_ids })).items
        for (let item of fItems) {
            try {
                await itemRepo.save({ id: item.id instanceof Number ? item.id : Number.parseInt(item.id), feedId: item.feed_id, title: item.title, author: item.author, description: html2md(item.html), pubDate: item.created_on_time, link: item.url, enclosure: item.enclosure })
            } catch (e) {
                err(e, '同步item出错' + with_ids)
            }
        }
        total = total + 50
        if (total > syncItemIds.size) {
            total = syncItemIds.size
        }
        setTitle(total)
    }

}

/**
 * 只同步feed
 * @param feedId 
 */
export async function syncFeedItem(feedId: number) {
    const sum = (await itemRepo.listAll(item => item.feedId == feedId)).length
    let hasNext: boolean = true
    let fItems: any[] = []
    let lastId = 0;
    while (hasNext) {
        const r = (await items({ feed_ids: feedId, since_id: lastId }))
        // console.log(sum, r.total_items)
        if (r.total_items == sum) {
            return
        }
        fItems = r.items
        hasNext = fItems.length == 50
        for (let item of fItems) {
            await itemRepo.save({ id: item.id, feedId: item.feed_id, title: item.title, author: item.author, description: html2md(item.html), pubDate: item.created_on_time, link: item.url, enclosure: item.enclosure })
            lastId = item.id > lastId ? item.id : lastId
        }
    }
}

/**
 * 
 * @param id 
 * @param type 
 * @param page 
 * @param onlyUnread 
 * @param unReadItemIds 
 * @returns 
 */
export async function listItem(id: any, type: LsItemType, page: number = 0, onlyUnread: boolean = false, unReadItemIds: Set<number>): Promise<Page<FeedItem> | undefined> {
    if (Object.keys(feedsCache).length < 1) {
        (await feedRepo.getAll()).forEach(f => feedsCache[f.id] = f)
    }
    let feedIds: Set<number> = new Set([id])
    let res: Page<Item>
    switch (type) {
        case LsItemType.FEED:
            res = (await itemRepo.findAll(item => filterItem(item, feedIds, onlyUnread, unReadItemIds), page))
            break
        case LsItemType.GROUP:
            feedIds = new Set((await feedRepo.getAll()).filter(item => id == -1 ? item.groupId == undefined : item.groupId == id).map(item => item.id))
            res = (await itemRepo.findAll(item => filterItem(item, feedIds, onlyUnread, unReadItemIds), page))
            break
        case LsItemType.SAVED:
            let itemIds: Set<number> = new Set(id)
            res = (await itemRepo.findAll(item => filterItem0(item, (id) => itemIds.has(id), onlyUnread, unReadItemIds), page))
            break
        case LsItemType.ALL:
            res = (await itemRepo.findAll(item => filterItem0(item, () => true, onlyUnread, unReadItemIds), page))
            break
        case LsItemType.RECOMMEND:
            // const ranks = { 366: 0.1, 117: 0.5 }//listRank({ 132: -1 })
            res = await itemRepo.findTimeAll(Math.floor(new Date().getTime() / 1000) - 3600 * 24 * 7, ranks, item => filterItem0(item, () => true, onlyUnread, unReadItemIds), page)
            break
        default:
            throw Error('error')
    }
    res.data.sort((x: Item, y: Item) => x.rank && y.rank ? x.rank - y.rank : y.pubDate - x.pubDate)
    return { data: res.data.map(map), isLast: res.isLast }
}

/**
 * 
 * @returns 
 */
export async function listSubscription(): Promise<[Subscription[], Group[], Feed[]] | undefined> {
    const groups: Group[] = await groupRepo.getAll();
    const feeds: Feed[] = await feedRepo.getAll()
    let all: Subscription[] = groups.map(g => ({ id: g.id, title: g.title, feeds: [] }))
    if (feeds.filter(f => !f.groupId).length > 0) {
        all.push({ id: -1, title: '未分类', feeds: [] })
    }
    let gid2group: any = {}
    all.forEach(item => {
        gid2group[item.id] = item
    })
    feeds.forEach(f => {
        const sf: SubscriptionFeed = { id: f.id, title: f.title, url: f.url, unreadQty: 0, siteUrl: f.siteUrl, groupId: f.groupId, icon: getBaseUrl(f.siteUrl) + "/favicon.ico" }
        if (f.groupId) {
            gid2group[f.groupId].feeds.push(sf)
        } else {
            gid2group[-1].feeds.push(sf)
        }
        feedsCache[f.id] = sf
    })
    return [all, groups, feeds]
}

/**
 * 
 * @param feedId 
 * @param unReadItemIds 
 * @returns 
 */
export async function sumUnread(cache: Item[], feedId: number, unReadItemIds: Set<number>): Promise<number> {
    return (cache.filter(item => item.feedId == feedId && unReadItemIds.has(item.id))).length
}
/**
 * 
 * @returns 未阅读的itemid
 */
export async function listUnreadIds(): Promise<number[]> {
    const idstr = (await listUnreadItemIds()).unread_item_ids
    return idstr.length ? idstr.split(',').map((id: string) => Number(id)) : []
}

/**
 * 
 * @returns 已保存的itemid
 */
export async function listSavedIds(): Promise<number[]> {
    const idstr = (await listSavedItemIds()).saved_item_ids
    return idstr.length ? idstr.split(',').map((id: string) => Number(id)) : []
}

/**
 * 
 * @returns 出现错误的feed
 */
export async function listFailFeedIds(): Promise<number[]> {
    const idstr = (await ext('fail_feed_ids')).fail_feed_ids
    return idstr.length ? idstr.split(',').map((id: string) => Number(id)) : []
}

/**
 *  已读
 * @param id 
 * @param marked|group|feed 
 * @param before 时间戳
 * @returns 
 */
export async function read(id: number, marked: Marked, before?: number, feedId?: number): Promise<any> {
    if (marked == Marked.ITEM && feedId) {
        readItem(feedId, id)
    }
    if (id == -1 && marked == Marked.GROUP) {
        return Promise.all((await feedRepo.getAll()).map(item => item.id).map(id => {
            return mark({
                id: id,
                as: 'read',
                mark: Marked[Marked.ITEM].toLowerCase(),
            })
        }))
    }
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
    if (id == -1 && marked == Marked.GROUP) {
        return Promise.all((await feedRepo.getAll()).map(item => item.id).map(id => {
            return mark({
                id: id,
                as: 'unread',
                mark: Marked[Marked.ITEM].toLowerCase(),
            })
        }))
    }
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

function filterItem(item: Item, feedIds: Set<number>, onlyUnread: boolean = false, unReadItemIds: Set<number>): boolean {
    return feedIds.has(item.feedId) && (!onlyUnread || unReadItemIds.has(item.id))
}

function filterItem0(item: Item, itemIdFilter: (id: any) => boolean, onlyUnread: boolean = false, unReadItemIds: Set<number>): boolean {
    return itemIdFilter(item.id) && (!onlyUnread || unReadItemIds.has(item.id))
}

function map(item: Item): FeedItem {
    const html = md2html(item.description)
    const imgs = extImgs(html)
    let thumbnail: string | undefined = imgs && imgs.length > 0 ? imgs[0] : undefined
    const text = extText(html)
    let type: string = ItemType[imgs.length > 5 && imgs.length * 50 > text.length ? ItemType.IMAGE : ItemType.BASIC]
    if (item.enclosure) {
        type = ItemType[ItemType.PODCAST]
        const strs = item.enclosure.split('.')
        if (strs.length && strs[strs.length - 1] == 'jpg') {
            type = ItemType[ItemType.VIDEO]
            thumbnail = item.enclosure
        }
    }
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
        html,
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

function getBaseUrl(url: string) {
    try {
        return url.split('/').slice(0, 3).join('/');
    } catch {
        return url
    }
}

function idsto50str(array: number[]): string[] {
    const chunkSize = 50; // 每个块的大小
    const chunks = array.reduce((acc, _, index) => {
        if (index % chunkSize === 0) acc.push([]); // 创建新块
        acc[acc.length - 1].push(array[index]); // 添加到当前块
        return acc;
    }, [] as number[][]); // 使用 reduce 创建块

    return chunks.map(chunk => chunk.join(','));
}