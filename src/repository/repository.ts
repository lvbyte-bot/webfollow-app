
import { DbStore, IndexedDB, withCursor, getOne } from '../utils/dbHelper'

import { Feed, Group, Item } from './model';

const { create,
    read,
    update,
    remove,
    getAll,
    listAll, findAll, count, whereOne, openStore
} = IndexedDB(db => {
    // 创建 Groups 对象存储
    if (!db.objectStoreNames.contains('groups')) {
        const groupStore = db.createObjectStore('groups', { keyPath: 'id' });
        groupStore.createIndex('title', 'title', { unique: false });
    }

    // 创建 Feeds 对象存储
    if (!db.objectStoreNames.contains('feeds')) {
        const feedStore = db.createObjectStore('feeds', { keyPath: 'id' });
        feedStore.createIndex('title', 'title', { unique: false });
        feedStore.createIndex('groupId', 'groupId', { unique: false });
        feedStore.createIndex('siteUrl', 'siteUrl', { unique: false });
    }

    // 创建 Items 对象存储
    if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('feedId', 'feedId', { unique: false });
        itemStore.createIndex('author', 'author', { unique: false });
        itemStore.createIndex('description', 'description', { unique: false });
        itemStore.createIndex('pubDate', 'pubDate', { unique: false });
        itemStore.createIndex('link', 'link', { unique: false });
        itemStore.createIndex('enclosure', 'enclosure', { unique: false });
    }
})


class Repo<T extends DbStore> {
    protected storename: string;
    public constructor(storeName: string) {
        this.storename = storeName
    }
    async get(id: number): Promise<T | undefined> {
        return read(this.storename, id)
    }
    async save(data: T): Promise<string> {
        if (await this.get(data.id)) {
            return update(this.storename, data.id, data)
        }
        return create(this.storename, data)
    }
    async del(id: number): Promise<string> {
        return remove(this.storename, id)
    }
    async getAll(): Promise<T[]> {
        return getAll(this.storename)
    }
    async listAll(conditionFn: ((item: T) => boolean) | undefined): Promise<T[]> {
        if (conditionFn) {
            return await listAll(this.storename, conditionFn)
        } else {
            return getAll(this.storename)
        }
    }
    async findAll(conditionFn: (item: T) => boolean, page: number = 0, size: number = 50): Promise<Page<T>> {
        const data = await findAll(this.storename, conditionFn, size, page)
        return { isLast: data.length != size, data }
    }
    async count(): Promise<number> {
        return count(this.storename)
    }
    async maxId(): Promise<number> {
        return (await whereOne(this.storename, (x: T, y: T) => (x.id > (y ? y.id : 0)) ? x : y))?.id;
    }
}

export interface Page<T> {
    isLast: boolean,
    data: T[]
}


class ItemRepo extends Repo<Item> {

    /**
     * 根据时间过滤按feedrank大小排序
     * @param time 
     * @param feedRanks 
     * @param condition 
     * @param page 
     * @param size 
     * @returns 
     */
    async findTimeAll(time: number, feedRanks: any | null, condition: ((item: Item) => boolean) | null, page: number = 0, size: number = 50) {
        const store = await openStore(this.storename)
        const range = IDBKeyRange.lowerBound(time);
        const request = store.index("pubDate").openCursor(range);
        const items: Item[] = await withCursor(request, (item: Item) => {
            const rank = feedRanks[item.feedId] || 10;
            item.rank = rank
            if (condition) {
                if (condition(item)) {
                    return [item, true]
                } else {
                    return [null, true]
                }
            }
            return [item, true]
        }, (a, b) => (a.rank && b.rank ? a.rank - b.rank : 1))
        const startOffset = page * size;
        const endOffset = startOffset + size;
        let data: Item[] = []
        if (startOffset < items.length) {
            data = items.slice(startOffset, endOffset)
        }
        return { isLast: data.length != size, data }
    }

    async countByFeedId(feedId: number): Promise<number> {
        const store0 = await openStore(this.storename)
        const feedIndex = store0.index('feedId')
        const req = feedIndex.count(feedId)
        return getOne(req)
    }
}

export const groupRepo = new Repo<Group>('groups')
export const feedRepo = new Repo<Feed>('feeds')
export const itemRepo = new ItemRepo('items')