import { Item } from '../repository'

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
    icon?: string,
    groupId?: number
}

export enum ItemType { BASIC, IMAGE, VIDEO, PODCAST }


export enum LsItemType { GROUP, FEED, SAVED, ALL }

export interface FeedItem extends Item {
    isRead?: boolean,
    isSaved?: boolean,
    thumbnail?: string,
    summary: string,
    datestr: string,
    imgs?: string[],
    type: ItemType | string,
    html: string,
    feed?: SubscriptionFeed
}
