import {
    LsItemType,
} from '@/service/types'

export interface TopNav {
    title?: string,
    qty?: number,
    isFailure?: boolean
    url?: string
}

export interface PageRoute {
    id?: number,
    type: LsItemType,
    meta?: PageRouteMeta
}

export interface PageRouteMeta {
    title?: string
    qty?: number
    isFailure?: boolean
    url?: string
}