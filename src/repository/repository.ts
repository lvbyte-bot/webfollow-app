
import { DbStore, IndexedDB } from '../utils/dbHelper'

import { Group, Feed, Item } from './model';

const { create,
    read,
    update,
    remove,
    getAll,
    where, count, whereOne } = IndexedDB(db => {
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
    async findAll(conditionFn: (item: T) => boolean): Promise<T[]> {
        return where(this.storename, conditionFn)
    }
    async count(): Promise<number> {
        return count(this.storename)
    }
    async maxId(): Promise<number> {
        return (await whereOne(this.storename, (x: T, y: T) => (x.id > (y ? y.id : 0)) ? x : y))?.id;
    }
}

export const groupRepo = new Repo<Group>('groups')
export const feedRepo = new Repo<Feed>('feeds')
export const itemRepo = new Repo<Item>('items')