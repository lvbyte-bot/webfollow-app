
import { DbStore, IndexedDB, SortDefine, getOne } from '../utils/dbHelper'

import { Feed, Group, Item } from './model';

const { create,
    read,
    update,
    remove,
    getAll,
    listAll, findAll, count, countAll, listAllIds, getByIdsInOrder, getIdsInTimeRange, findTimeRange, whereOne, openStore, exists
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
    async delAll(): Promise<string[]> {
        return Promise.all((await this.getAll()).map(t => this.del(t.id)))
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


    async count(): Promise<number> {
        return count(this.storename)
    }
    async maxId(): Promise<number> {
        return (await whereOne(this.storename, (x: T, y: T) => (x.id > (y ? y.id : 0)) ? x : y))?.id;
    }
    async existsId(id: number): Promise<boolean> {
        return exists(this.storename, id)
    }
}

export interface Page<T> {
    isLast: boolean,
    data: T[],
    total: number,
    ids?: number[]
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
    // time: number, feedRanks: any | null, 
    async findTimeAll(time: number, condition: ((item: Item) => boolean), page: number = 0, size: number = 50): Promise<Page<Item>> {
        const data: Item[] = await findTimeRange(this.storename, time, new Date().getTime() / 1000, page, size, condition)
        const total = await countAll(this.storename, condition)
        return { isLast: data.length != size, data, total }
    }

    async listAllIds(conditionFn: (item: Item) => boolean, sort?: SortDefine): Promise<number[]> {
        return await listAllIds(this.storename, conditionFn, sort)
    }
    async getbyIdsInOrder(ids: number[]): Promise<Item[]> {
        return await getByIdsInOrder(this.storename, ids)
    }
    async findAll(conditionFn: (item: Item) => boolean, page: number = 0, size: number = 50): Promise<Page<Item>> {
        const data = await findAll(this.storename, conditionFn, size, page)
        const total = await countAll(this.storename, conditionFn)
        return { isLast: data.length != size, data, total }
    }
    async countByFeedId(feedId: number): Promise<number> {
        const store0 = await openStore(this.storename)
        const feedIndex = store0.index('feedId')
        const req = feedIndex.count(feedId)
        return getOne(req)
    }

    async getIdsInTimeRange(startTime: number, endTime: number): Promise<number[]> {
        return await getIdsInTimeRange(this.storename, startTime, endTime)
    }
}

export const groupRepo = new Repo<Group>('groups')
export const feedRepo = new Repo<Feed>('feeds')
export const itemRepo = new ItemRepo('items')