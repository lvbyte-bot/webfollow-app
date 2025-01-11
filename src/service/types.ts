import { Item } from '../repository'

export interface Subscription {
    id: number,
    title: string,
    unreadQty?: number
    feeds: SubscriptionFeed[]
}

export interface SubscriptionFeed {
    id: number,
    title: string,
    url: string,
    siteUrl: string,
    unreadQty: number,
    isFailure?: boolean,
    icon?: string,
    groupId?: number
}

export enum ItemType { BASIC, IMAGE, VIDEO, PODCAST }


export enum LsItemType { GROUP, FEED, FILTER, ITEMS, SAVED, ALL, RECOMMEND }

export interface FeedItem extends Item {
    isRead?: boolean,
    isSaved?: boolean,
    thumbnail?: string,
    summary: string,
    datestr: string,
    images?: string[],
    type: ItemType | string,
    html: string,
    feed?: SubscriptionFeed
}
