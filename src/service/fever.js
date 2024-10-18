import {
    groups,
    feeds,
    items,
    mark
} from "../api";

export async function listfeeds() {
    const data = (await groups());
    // {
    //     "id": 1,
    //     "title": "blog"
    // }
    const groupList = data.groups;
    // {
    //     "group_id": 1,
    //     "feed_ids": "2,4,7"
    // }
    const group2feeds = {}
    data.feeds_groups.forEach(item => {
        console.log(item)
        group2feeds[item.group_id] = item.feed_ids.split(',')
    });

    const feedList = (await feeds()).feeds
    const id2feed = {}
    feedList.forEach(item => {
        id2feed[item.id] = item
    });
    return groupList.map(g => {
        g.children = group2feeds[g.id].map(fid => id2feed[fid])
        return g
    })
}

export async function listItems(params) {
    return (await items(params)).items.map(convert)
}

export async function markItem(params) {
    return await mark(Object.assign({
        mark: 'item'
    }, params))
}

function convert(item) {
    const imgs = extImgs(item.html)
    item.thumbnail = imgs && imgs.length > 0 ? imgs[0] : undefined
    if (imgs.length > 5) {
        item.imgs = imgs
        item.type = 'image'
    }
    const text = extText(item.html)
    item.summary = text && text.length > 36 ? text.substring(0, 36) : text
    item.date = formatDate(new Date(item.created_on_time * 1000))
    return item
}

function extImgs(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 找到所有 <img> 标签
    const imgTags = doc.querySelectorAll('img');

    // 提取每个 <img> 标签的 src 属性
    return Array.from(imgTags).map(img => img.src);
}

function extText(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    return doc.body.innerText
}

function formatDate(date) {
    // ... existing code ...
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    };
    return new Date(date).toLocaleDateString("zh-CN", options);
    // ... existing code ...
}