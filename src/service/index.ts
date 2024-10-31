import { groupRepo, feedRepo, itemRepo, Feed, Group, Item, isDbExists, Page } from '../repository'

import { groups, items, feeds, listUnreadItemIds, listSavedItemIds, mark } from '../api'

import { FeedItem, ItemType, Subscription, SubscriptionFeed, LsItemType } from './types';

import { html2md, md2html } from '@/utils/mdUtils';



export enum Marked { ITEM, FEED, GROUP }

const feedsCache: any = {}

export async function getItemTotal(): Promise<number> {
    return await itemRepo.count()
}

/**
 * 刷新同步数据到本地
 */
export async function sync() {
    await isDbExists()

    await groupRepo.count();
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
        feedsCache[f.id] = f
    })
    // 同步items
    let lastId = await itemRepo.maxId()
    if (lastId) {
        let hasNext: boolean = true
        let fItems: any[] = []
        while (hasNext) {
            fItems = (await items({ since_id: lastId })).items
            hasNext = fItems.length == 50
            for (let item of fItems) {
                await itemRepo.save({ id: item.id, feedId: item.feed_id, title: item.title, author: item.author, description: html2md(item.html), pubDate: item.created_on_time, link: item.url })
            }
            lastId = await itemRepo.maxId()
        }
    } else {
        const sids = await listSavedIds()
        const uids = await listUnreadIds()
        const syncItemIds = new Set([...uids, ...sids])
        for (let with_ids of idsto50str(Array.from(syncItemIds))) {
            let fItems = (await items({ with_ids })).items
            for (let item of fItems) {
                await itemRepo.save({ id: item.id, feedId: item.feed_id, title: item.title, author: item.author, description: html2md(item.html), pubDate: item.created_on_time, link: item.url })
            }
            const total = await itemRepo.count()
            setTitle(total)
        }
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
        default:
            throw Error('error')
    }
    res.data.sort((x: Item, y: Item) => y.pubDate - x.pubDate)
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
 *  已读
 * @param id 
 * @param marked|group|feed 
 * @param before 时间戳
 * @returns 
 */
export async function read(id: number, marked: Marked, before?: number): Promise<any> {
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
    const thumbnail: string | undefined = imgs && imgs.length > 0 ? imgs[0] : undefined
    const text = extText(html)
    const type: string = ItemType[imgs.length > 5 && imgs.length * 50 > text.length ? ItemType.IMAGE : ItemType.BASIC]
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