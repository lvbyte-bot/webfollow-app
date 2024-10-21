
import { DbStore, IndexedDB } from '../utils/dbHelper'

import { Group, Feed, Item } from './model';

const { create,
    read,
    update,
    remove,
    getAll,
    listAll, findAll, count, whereOne } = IndexedDB(db => {
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
            itemStore.createIndex('pubDate', 'createdOnTime', { unique: false });
            itemStore.createIndex('link', 'link', { unique: false });
            itemStore.createIndex('enclosure', 'enclosure', { unique: false });
        }
    })


class Repo<T extends DbStore> {
    private storename: string;
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
    async listAll(conditionFn: (item: T) => boolean): Promise<T[]> {
        return await listAll(this.storename, conditionFn)
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

export const groupRepo = new Repo<Group>('groups')
export const feedRepo = new Repo<Feed>('feeds')
export const itemRepo = new Repo<Item>('items')