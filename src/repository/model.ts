import { DbStore } from '../utils/dbHelper'

export interface Group extends DbStore {
    title: string;
}

export interface Feed extends DbStore {
    title: string;
    url: string;
    siteUrl: string;
    groupId?: number
}

export interface Item extends DbStore {
    feedId: number,
    title: string;
    author: string;
    description: string;
    pubDate: number;
    link: string;
    enclosure?: string,
    rank?: number
}
