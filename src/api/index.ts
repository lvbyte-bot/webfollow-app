import {
    request
} from "../utils/http";

export function groups() {
    return request({
        'groups': '0'
    })
}

export function feeds() {
    return request({
        'feeds': '0'
    })
}

/**
 * 
 * @param {group_ids:'', feed_ids:'', max_id:0,since_id:0,with_ids:1} params 
 * @returns 
 */
export function items(params: object) {
    return request(Object.assign({
        'items': '0'
    }, params))
}


export function listUnreadItemIds() {
    return request({
        'unread_item_ids': '0'
    })
}

export function listSavedItemIds() {
    return request({
        'saved_item_ids': '0'
    })
}

/**
 * 
 * @param {'mark': 'item' | 'feed' | 'group',as:unread|read|saved|unsaved,id,  before:''} params 
 * @returns 
 */
export function mark(params: object) {
    return request(Object.assign({
        mark: 'item'
    }, params))
}