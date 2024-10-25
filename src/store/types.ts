import {
    LsItemType,
} from '@/service/types'

export interface TopNav {
    title?: string,
    qty?: number
}

export interface PageRoute {
    id?: number,
    type: LsItemType
}