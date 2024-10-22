import { Feed, Item } from '../repository'

export interface Subscription {
    id: number,
    title: string,
    unreadQty?: number
    feeds: any[]
}

export interface SubscriptionFeed {
    id: number,
    title: string,
    url: string,
    siteUrl: string,
    unreadQty: number,
    icon?: string
}

export enum ItemType { BASIC, IMAGE, VIDEO, PODCAST }

export interface FeedItem extends Item {
    isRead?: boolean,
    isSaved?: boolean,
    thumbnail?: string,
    summary: string,
    datestr: string,
    imgs?: string[],
    type: ItemType | string,
    html: string,
    feed?: Feed
}
