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


async function asyncFilter(array: any, asyncCallback: (item: any) => Promise<boolean>) {
    const results = await Promise.all(array.map(asyncCallback));
    return array.filter((_: any, index: number) => results[index]);
}

/**
 * 刷新同步数据到本地
 */
export async function pull() {
    await isDbExists();

    // 同步group
    const groupData = (await groups()).groups
    groupRepo.delAll()
    groupData.forEach((g: any) => {
        groupRepo.save({ id: g.id, title: g.title })
    });
    // 同步feed
    const feedRes = (await feeds())
    const fid2gid: any = {}
    feedRes.feeds_groups.forEach((gf: any) => {
        gf.feed_ids.split(',').forEach((fid: string) => {
            fid2gid[fid + ''] = gf.group_id
        })
    })
    feedRepo.delAll()
    feedRes.feeds.forEach((f: any) => {
        feedRepo.save({ id: f.id, title: f.title, url: f.url, siteUrl: f.site_url, groupId: fid2gid[f.id + ''] })
    })
    const sids = await listSavedIds()
    const uids = await listUnreadIds()
    const syncItemIds = new Set([...uids, ...sids])
    const localMaxId = await itemRepo.maxId()
    const remoteIds = Array.from(syncItemIds)
    if (localMaxId >= Math.max(...remoteIds)) {
        console.log('本地数据最新')
        return
    }

    let syncItemIdArray = (await asyncFilter(remoteIds, async id => !await itemRepo.existsId(id))).sort((a: number, b: number) => a - b)
    let total = remoteIds.length - syncItemIdArray.length
    async function pullItems(with_ids: string, try_count: number = 3) {
        try {
            try_count = try_count - 1
            let fItems = (await items({ with_ids })).items
            for (let item of fItems) {
                await itemRepo.save({ id: item.id instanceof Number ? item.id : Number.parseInt(item.id), feedId: item.feed_id, title: item.title, author: item.author, description: html2md(item.html), pubDate: item.created_on_time, link: item.url, enclosure: item.enclosure })
            }
            total = total + 50
            if (total > syncItemIds.size) {
                total = syncItemIds.size
            }
            webfollowApp.tip('已同步' + total + '条')
        } catch (e) {
            err(e, '同步item出错')
            // 等待3s
            await new Promise(resolve => setTimeout(resolve, 3000))
            if (try_count > 0) {
                await pullItems(with_ids, try_count)
            } else {
                throw e
            }
        }

    }
    try {
        for (let with_ids of idsto50str(syncItemIdArray)) {
            await pullItems(with_ids)
        }
    } catch (e) {
        webfollowApp.tip('网络开小差了，同步中断了')
        throw e
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
        try {
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
        } catch (e) {
            err(e, '同步item出错')
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
            const ids: Set<number> = new Set(id)
            res = (await itemRepo.findAll(item => filterItem0(item, (id) => ids.has(id), onlyUnread, unReadItemIds), page, 50))
            break
        case LsItemType.ITEMS:
            const id2Index = id.map((i: any, index: number) => ({ i, index })).reduce((acc: any, item: any) => {
                acc[item.i] = item.index
                return acc
            }, {})
            let itemIds: Set<number> = new Set(id)
            res = (await itemRepo.findAll(item => filterItem0(item, (id) => itemIds.has(id), onlyUnread, unReadItemIds), page, 50, (x: Item, y: Item) => id2Index[x.id] > id2Index[y.id] ? 1 : -1))
            break
        case LsItemType.ALL:
            res = (await itemRepo.findAll(item => filterItem0(item, () => true, onlyUnread, unReadItemIds), page))
            break
        case LsItemType.RECOMMEND:
            // const ranks = { 366: 0.1, 117: 0.5 }//listRank({ 132: -1 })
            console.log(ranks)
            res = await itemRepo.findTimeAll(Math.floor(new Date().getTime() / 1000) - 3600 * 24 * 1, item => filterItem0(item, () => true, onlyUnread, unReadItemIds), page)
            break
        default:
            throw Error('error')
    }
    if (type != LsItemType.ITEMS) {
        res.data.sort((x: Item, y: Item) => x.rank && y.rank ? x.rank - y.rank : y.pubDate - x.pubDate)
    }
    return { data: res.data.map(map), isLast: res.isLast, total: res.total, ids: res.ids }
}

/**
 * 
 * @returns 
 */
export async function listSubscription(): Promise<[Subscription[], Group[], Feed[]] | undefined> {
    const groups: Group[] = await groupRepo.getAll();
    const feeds: Feed[] = await feedRepo.getAll()
    let subscriptions: Subscription[] = groups.map(g => ({ id: g.id, title: g.title, feeds: [] }))
    if (feeds.filter(f => !f.groupId).length > 0) {
        subscriptions.push({ id: -1, title: '未分类', feeds: [] })
    }
    let gid2group: any = {}
    subscriptions.forEach(item => {
        gid2group[item.id] = item
    })
    feeds.forEach(f => {
        const sf: SubscriptionFeed = mapFeed(f)
        if (f.groupId) {
            gid2group[f.groupId].feeds.push(sf)
        } else {
            gid2group[-1].feeds.push(sf)
        }
        feedsCache[f.id] = sf
    })
    return [subscriptions, groups, feeds]
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
 * @param after 时间戳
 * @param feedId 时间戳
 * @returns 
 */
export async function read(id: number, marked: Marked, before?: number, after?: number, feedId?: number): Promise<any> {
    // 记录已读方便后期只能排寻
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
        before: before,
        after
    })
}

/**
 * 一次读多个
 * @param ids 
 * @returns 
 */
export async function readItemIds(ids: number[]): Promise<any> {
    return await mark({
        ids: ids,
        as: 'read',
        mark: Marked[Marked.ITEM].toLowerCase(),
    })
}

/**
 * 一次将多个标记未读
 * @param ids 
 * @returns 
 */
export async function unReadItemIds(ids: number[]): Promise<any> {
    return await mark({
        ids: ids,
        as: 'unread',
        mark: Marked[Marked.ITEM].toLowerCase(),
    })
}

/**
 * 未读
 * @param id 
 * @param marksed item|group|feed 
 * @param before 时间戳
 * @param after 时间戳
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

/**
 * 搜索
 * @param keyword 
 * @returns 
 */
export async function search(keyword: string): Promise<{ items: FeedItem[], feeds: SubscriptionFeed[], groups: Group[] }> {
    // 通过 repository 查询
    keyword = keyword.toLowerCase()
    const items = await itemRepo.findAll(item => item.title.toLowerCase().includes(keyword), 0, 500);
    const feeds = await feedRepo.findAll(feed => feed.title.toLowerCase().includes(keyword) || feed.url.toLowerCase().includes(keyword), 0, 300);
    const groups = await groupRepo.findAll(group => group.title.toLowerCase().includes(keyword), 0, 300);
    return { items: items.data.map(map), feeds: feeds.data.map(mapFeed), groups: groups.data };
}


function filterItem(item: Item, feedIds: Set<number>, onlyUnread: boolean = false, unReadItemIds: Set<number>): boolean {
    return feedIds.has(item.feedId) && (!onlyUnread || unReadItemIds.has(item.id))
}

function filterItem0(item: Item, itemIdFilter: (id: any) => boolean, onlyUnread: boolean = false, unReadItemIds: Set<number>): boolean {
    return itemIdFilter(item.id) && (!onlyUnread || unReadItemIds.has(item.id))
}

function map(item: Item): FeedItem {
    const html = md2html(item.description)
    const images = extImgs(html)
    let thumbnail: string | undefined = images && images.length > 0 ? images[0] : undefined
    const text = extText(html)
    let type: string = ItemType[images.length > 5 && images.length * 50 > text.length ? ItemType.IMAGE : ItemType.BASIC]
    if (item.enclosure) {
        type = ItemType[ItemType.PODCAST]
        const strs = item.enclosure.split('.')
        if (strs.length && strs[strs.length - 1] == 'jpg') {
            type = ItemType[ItemType.VIDEO]
            thumbnail = item.enclosure
        }
    }
    const summary: string = text && text.length > 200 ? text.substring(0, 200) : text
    const d: number = item.pubDate * 1000
    const datestr: string = formatDate(d)
    const feed = feedsCache[item.feedId]
    return {
        ...item,
        thumbnail,
        summary,
        datestr,
        images,
        type,
        html,
        feed
    }
}

function mapFeed(feed: Feed): SubscriptionFeed {
    return { id: feed.id, title: feed.title, url: feed.url, unreadQty: 0, siteUrl: feed.siteUrl, groupId: feed.groupId, icon: `https://unavatar.webp.se/${getBaseDomain(feed.siteUrl)}?fallback=false` }
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
    const now = new Date().getTime();
    const diff = now - date;

    // 1小时以内
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}分钟前`;
    }

    // 24小时内
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小时前`;
    }

    // 7天内
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}天前`;
    }

    // 其他情况保持原来的格式
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    };
    return new Date(date).toLocaleDateString("zh-CN", options);
}

function getBaseDomain(url: string) {
    try {
        return url.split('/')[2];
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