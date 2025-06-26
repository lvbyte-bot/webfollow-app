import { Item, Feed, Group } from '../repository/model';
import { itemRepo, feedRepo, groupRepo } from '../repository/repository';

//  TODO 后期增加根据阅读的feed自动打分，然后排名

// SQL语法解析器类型
type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'BETWEEN';
type LogicalOperator = 'AND' | 'OR';

interface Condition {
    field: string;
    operator: Operator;
    value: any;
}

interface FilterQuery {
    conditions: Condition[];
    logicalOperators: LogicalOperator[];
    orderBy?: {
        field: string;
        direction: 'ASC' | 'DESC';
    };
    limit?: number;
}

// 过滤器类
export class ItemFilter {
    private query: FilterQuery = {
        conditions: [],
        logicalOperators: []
    };

    // 缓存Feed和Group数据，避免重复查询
    private feedCache: Map<number, Feed> = new Map();
    private groupCache: Map<number, Group> = new Map();

    // 在ItemFilter类中添加新的缓存
    private unreadItemIds: Set<number> = new Set();
    private savedItemIds: Set<number> = new Set();

    constructor() {
        // 初始化时预加载所有Feed和Group数据以及已读/收藏状态
        this.preloadData();
    }

    // 预加载Feed和Group数据
    private async preloadData() {
        try {
            const feeds = await feedRepo.getAll();
            feeds.forEach(feed => this.feedCache.set(feed.id, feed));

            const groups = await groupRepo.getAll();
            groups.forEach(group => this.groupCache.set(group.id, group));

            // 加载未读和收藏状态
            try {
                // 从localStorage获取未读和收藏状态
                const unreadIds = JSON.parse(localStorage.getItem('urids') || '[]');
                const savedIds = JSON.parse(localStorage.getItem('sids') || '[]');

                this.unreadItemIds = new Set(unreadIds);
                this.savedItemIds = new Set(savedIds);
            } catch (error) {
                console.error("加载已读/收藏状态失败:", error);
            }
        } catch (error) {
            console.error("预加载Feed和Group数据失败:", error);
        }
    }

    // 解析SQL类似语句
    parseQuery(sqlLike: string): FilterQuery {
        console.log("解析查询:", sqlLike);
        const query: FilterQuery = {
            conditions: [],
            logicalOperators: []
        };

        // 处理空查询
        if (!sqlLike || sqlLike.trim() === '') {
            return query;
        }

        // 提取WHERE条件
        let whereClause = sqlLike;
        if (sqlLike.toUpperCase().includes('WHERE')) {
            const whereMatch = sqlLike.match(/WHERE\s+(.*?)(?:\s+ORDER BY|\s+LIMIT|$)/i);
            if (whereMatch && whereMatch[1]) {
                whereClause = whereMatch[1];
            }
        } else {
            // 如果没有WHERE关键字，需要处理可能包含ORDER BY或LIMIT的条件
            whereClause = sqlLike.replace(/\s+ORDER BY.*$/i, '').replace(/\s+LIMIT.*$/i, '');
        }

        // 处理BETWEEN特殊情况
        if (whereClause.toUpperCase().includes('BETWEEN')) {
            // 先检查是否有BETWEEN条件
            const betweenMatch = whereClause.match(/(\w+(?:\.\w+)?)\s+BETWEEN\s+(\d+)\s+AND\s+(\d+)/i);
            if (betweenMatch) {
                const [fullMatch, field, min, max] = betweenMatch;
                // 替换BETWEEN条件为占位符，避免AND被错误分割
                whereClause = whereClause.replace(fullMatch, `${field} BETWEEN_PLACEHOLDER ${min},${max}`);
            }
        }

        // 分割AND/OR条件
        const conditionRegex = /\s+(AND|OR)\s+/i;
        if (conditionRegex.test(whereClause)) {
            const conditionParts = whereClause.split(conditionRegex);

            for (let i = 0; i < conditionParts.length; i++) {
                if (i % 2 === 0) {
                    // 这是一个条件
                    // 还原BETWEEN占位符
                    const condition = conditionParts[i].replace('BETWEEN_PLACEHOLDER', 'BETWEEN');
                    this.parseCondition(condition, query);
                } else {
                    // 这是一个逻辑运算符
                    query.logicalOperators.push(conditionParts[i].toUpperCase() as LogicalOperator);
                }
            }
        } else {
            // 只有一个条件，还原BETWEEN占位符
            const condition = whereClause.replace('BETWEEN_PLACEHOLDER', 'BETWEEN');
            this.parseCondition(condition, query);
        }

        // 提取ORDER BY
        const orderMatch = sqlLike.match(/ORDER BY\s+(\w+(?:\.\w+)?)\s+(ASC|DESC)/i);
        if (orderMatch) {
            query.orderBy = {
                field: orderMatch[1],
                direction: orderMatch[2].toUpperCase() as 'ASC' | 'DESC'
            };
        }

        // 提取LIMIT
        const limitMatch = sqlLike.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
            query.limit = parseInt(limitMatch[1]);
        }

        console.log("解析结果:", JSON.stringify(query, null, 2));
        return query;
    }

    private parseCondition(conditionStr: string, query: FilterQuery): void {
        // 支持各种操作符
        const operatorPattern = /(=|!=|>=|<=|>|<|LIKE|IN|NOT IN|BETWEEN)/i;
        const parts = conditionStr.split(operatorPattern);

        if (parts.length >= 3) {
            const field = parts[0].trim();
            const operator = parts[1].trim().toUpperCase() as Operator;
            const valueStr = parts.slice(2).join('').trim();

            let value: any;

            // 处理特殊值类型
            if (operator === 'IN' || operator === 'NOT IN') {
                value = valueStr.replace(/^\(|\)$/g, '').split(',').map(v => this.parseValue(v.trim()));
            } else if (operator === 'BETWEEN') {
                // 处理BETWEEN操作符
                // 检查是否是我们预处理的格式 (min,max)
                const commaMatch = valueStr.match(/\s*(\d+),(\d+)\s*/);
                if (commaMatch) {
                    const [_, min, max] = commaMatch;
                    value = [this.parseValue(min), this.parseValue(max)];
                } else {
                    // 尝试标准格式 min AND max
                    const betweenMatch = valueStr.match(/\s*(\d+)\s+AND\s+(\d+)\s*/i);
                    if (betweenMatch) {
                        const [_, min, max] = betweenMatch;
                        value = [this.parseValue(min), this.parseValue(max)];
                    } else {
                        console.error(`BETWEEN语法错误: ${valueStr}`);
                        value = [0, 0]; // 默认值，避免后续错误
                    }
                }
                console.log(`BETWEEN解析结果: [${value[0]}, ${value[1]}]`);
            } else {
                value = this.parseValue(valueStr);
            }

            query.conditions.push({
                field,
                operator,
                value
            });
        }
    }

    private parseValue(valueStr: string): any {
        // 去除引号
        if (/^(['"]).*\1$/.test(valueStr)) {
            return valueStr.substring(1, valueStr.length - 1);
        }

        // 尝试解析数字
        if (/^-?\d+$/.test(valueStr)) {
            return parseInt(valueStr);
        } else if (/^-?\d+\.\d+$/.test(valueStr)) {
            return parseFloat(valueStr);
        } else if (valueStr.toUpperCase() === 'TRUE') {
            return true;
        } else if (valueStr.toUpperCase() === 'FALSE') {
            return false;
        } else if (valueStr.toUpperCase() === 'NULL') {
            return null;
        }

        // 默认返回字符串
        return valueStr;
    }

    // 设置查询
    setQuery(query: FilterQuery | string): ItemFilter {
        if (typeof query === 'string') {
            this.query = this.parseQuery(query);
        } else {
            this.query = query;
        }
        return this;
    }

    // 执行过滤
    async execute(page: number = 0, size: number = 50): Promise<{ isLast: boolean, data: Item[], total: number, ids?: number[] }> {
        // 如果没有条件，返回所有项目
        if (this.query.conditions.length === 0) {
            return await itemRepo.findAll(() => true, page, size);
        }

        // 创建过滤函数
        const filterFn = (item: Item) => {
            let result = true;

            for (let i = 0; i < this.query.conditions.length; i++) {
                const condition = this.query.conditions[i];
                const itemValue = this.getItemValue(item, condition.field);
                let conditionResult = this.evaluateCondition(itemValue, condition.operator, condition.value);

                if (i === 0) {
                    result = conditionResult;
                } else {
                    const logicalOp = this.query.logicalOperators[i - 1];
                    if (logicalOp === 'AND') {
                        result = result && conditionResult;
                    } else {
                        result = result || conditionResult;
                    }
                }
            }

            return result;
        };

        // 获取排序函数
        let sortFn: ((a: Item, b: Item) => number) | undefined;
        if (this.query.orderBy) {
            sortFn = (a: Item, b: Item) => {
                const aValue = this.getItemValue(a, this.query.orderBy!.field);
                const bValue = this.getItemValue(b, this.query.orderBy!.field);

                if (aValue < bValue) return this.query.orderBy!.direction === 'ASC' ? -1 : 1;
                if (aValue > bValue) return this.query.orderBy!.direction === 'ASC' ? 1 : -1;
                return 0;
            };
        }

        // 使用itemRepo执行查询
        const limit = this.query.limit || size;
        const result = await itemRepo.findAll(filterFn, page, limit, sortFn);

        console.log(`查询结果: ${result.total} 条记录`, page, limit);
        return result;
    }

    // 获取Item对象的字段值
    private getItemValue(item: Item, field: string): any {
        // 处理特殊字段
        if (field === 'isRead') {
            return !this.unreadItemIds.has(item.id);
        } else if (field === 'isSaved') {
            return this.savedItemIds.has(item.id);
        }

        // 处理嵌套字段，如 feed.title, group.title
        const parts = field.split('.');

        // 原有逻辑保持不变
        if (parts.length === 1) {
            // 直接字段
            return (item as any)[field];
        } else if (parts.length === 2) {
            // 关联字段
            const [entity, property] = parts;

            if (entity === 'feed') {
                // 获取关联的Feed
                const feed = this.feedCache.get(item.feedId);
                if (feed) {
                    return (feed as any)[property];
                }
            } else if (entity === 'group') {
                // 获取关联的Group (通过Feed)
                const feed = this.feedCache.get(item.feedId);
                if (feed && feed.groupId) {
                    const group = this.groupCache.get(feed.groupId);
                    if (group) {
                        return (group as any)[property];
                    }
                }
            }
        }

        return undefined;
    }

    // 评估条件
    private evaluateCondition(itemValue: any, operator: Operator, conditionValue: any): boolean {
        // 处理null值
        if (itemValue === undefined || itemValue === null) {
            if (operator === '=' && conditionValue === null) return true;
            if (operator === '!=' && conditionValue !== null) return true;
            return false;
        }

        switch (operator) {
            case '=':
                return itemValue === conditionValue;
            case '!=':
                return itemValue !== conditionValue;
            case '>':
                return itemValue > conditionValue;
            case '<':
                return itemValue < conditionValue;
            case '>=':
                return itemValue >= conditionValue;
            case '<=':
                return itemValue <= conditionValue;
            case 'LIKE':
                if (typeof itemValue !== 'string') {
                    itemValue = String(itemValue);
                }
                if (typeof conditionValue !== 'string') {
                    conditionValue = String(conditionValue);
                }
                return itemValue.toLowerCase().includes(conditionValue.toLowerCase());
            case 'IN':
                return Array.isArray(conditionValue) && conditionValue.includes(itemValue);
            case 'NOT IN':
                return Array.isArray(conditionValue) && !conditionValue.includes(itemValue);
            case 'BETWEEN':
                // 修复BETWEEN操作符评估
                if (!Array.isArray(conditionValue) || conditionValue.length !== 2) {
                    console.error(`BETWEEN值格式错误:`, conditionValue);
                    return false;
                }

                const [min, max] = conditionValue;
                // 确保数值比较
                const numericItemValue = Number(itemValue);
                const numericMin = Number(min);
                const numericMax = Number(max);

                // 检查是否为有效数字
                if (isNaN(numericItemValue) || isNaN(numericMin) || isNaN(numericMax)) {
                    console.error(`BETWEEN非数值比较: ${itemValue} BETWEEN ${min} AND ${max}`);
                    // 对于非数值，尝试字符串比较
                    return typeof itemValue === 'string' &&
                        typeof min === 'string' &&
                        typeof max === 'string' &&
                        itemValue >= min &&
                        itemValue <= max;
                }

                return numericItemValue >= numericMin && numericItemValue <= numericMax;
            default:
                return false;
        }
    }
}

// 使用 quickstart
export async function filterItems(sqlQuery: string, page: number = 0, size: number = 50) {
    const filter = new ItemFilter();
    return await filter.setQuery(sqlQuery).execute(page, size);
}

// 添加到全局对象，方便调试
(window as any).filterItems = filterItems;
