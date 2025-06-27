import { Item, Feed, Group } from '../repository/model';
import { itemRepo, feedRepo, groupRepo } from '../repository/repository';

//  TODO 后期增加根据阅读的feed自动打分，然后排名

// SQL语法解析器类型
type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN' | 'BETWEEN';
type LogicalOperator = 'AND' | 'OR';

interface Condition {
    field: string;
    operator: Operator;
    value: any;
}

// 添加新的接口来支持嵌套条件
interface NestedCondition {
    type: 'simple' | 'group';
    condition?: Condition;
    group?: {
        conditions: NestedCondition[];
        logicalOperators: LogicalOperator[];
    };
}

interface FilterQuery {
    conditions: NestedCondition[];
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
        // console.log("解析查询:", sqlLike);
        const query: FilterQuery = {
            conditions: [],
            logicalOperators: []
        };

        // 处理空查询
        if (!sqlLike || sqlLike.trim() === '') {
            return query;
        }

        // 预处理时间函数
        sqlLike = this.preprocessTimeFunctions(sqlLike);

        // 提取WHERE条件
        let whereClause = sqlLike;
        if (sqlLike.toUpperCase().includes('WHERE')) {
            const whereMatch = sqlLike.match(/WHERE\s+(.*?)(?:\s+ORDER BY|\s+LIMIT|$)/i);
            if (whereMatch && whereMatch[1]) {
                whereClause = whereMatch[1];
            }
        } else {
            whereClause = sqlLike.replace(/\s+ORDER BY.*$/i, '').replace(/\s+LIMIT.*$/i, '');
        }

        // 解析嵌套条件
        const parsedConditions = this.parseNestedConditions(whereClause);
        query.conditions = parsedConditions.conditions;
        query.logicalOperators = parsedConditions.logicalOperators;

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

        // console.log("解析结果:", JSON.stringify(query, null, 2));
        return query;
    }

    // 新增方法：解析嵌套条件
    private parseNestedConditions(conditionStr: string): { conditions: NestedCondition[], logicalOperators: LogicalOperator[] } {
        const result = {
            conditions: [] as NestedCondition[],
            logicalOperators: [] as LogicalOperator[]
        };

        // 处理空条件
        if (!conditionStr || conditionStr.trim() === '') {
            return result;
        }

        // 处理括号嵌套
        let i = 0;
        let currentCondition = '';
        let bracketCount = 0;

        while (i < conditionStr.length) {
            const char = conditionStr[i];

            if (char === '(' && bracketCount === 0) {
                // 找到嵌套条件的开始
                bracketCount++;
                i++;
                let nestedCondition = '';

                // 收集嵌套条件内的所有内容
                while (i < conditionStr.length) {
                    const nestedChar = conditionStr[i];

                    if (nestedChar === '(') {
                        bracketCount++;
                        nestedCondition += nestedChar;
                    } else if (nestedChar === ')') {
                        bracketCount--;
                        if (bracketCount === 0) {
                            break;
                        }
                        nestedCondition += nestedChar;
                    } else {
                        nestedCondition += nestedChar;
                    }
                    i++;
                }

                // 递归解析嵌套条件
                const nestedResult = this.parseNestedConditions(nestedCondition);

                // 添加嵌套组条件
                result.conditions.push({
                    type: 'group',
                    group: {
                        conditions: nestedResult.conditions,
                        logicalOperators: nestedResult.logicalOperators
                    }
                });

                // 检查是否有逻辑运算符
                i++;
                while (i < conditionStr.length && /\s/.test(conditionStr[i])) {
                    i++;
                }

                if (i < conditionStr.length) {
                    const logicalOpMatch = conditionStr.substring(i).match(/^(AND|OR)\s+/i);
                    if (logicalOpMatch) {
                        result.logicalOperators.push(logicalOpMatch[1].toUpperCase() as LogicalOperator);
                        i += logicalOpMatch[0].length;
                    }
                }
            } else if (/\s+(AND|OR)\s+/i.test(conditionStr.substring(i))) {
                // 找到逻辑运算符
                const logicalOpMatch = conditionStr.substring(i).match(/^\s+(AND|OR)\s+/i);
                if (logicalOpMatch) {
                    // 处理当前条件
                    if (currentCondition.trim()) {
                        const simpleCondition: NestedCondition = {
                            type: 'simple'
                        };

                        // 解析简单条件
                        const condition: Condition = { field: '', operator: '=' as Operator, value: null };
                        this.parseSimpleCondition(currentCondition.trim(), condition);
                        simpleCondition.condition = condition;

                        result.conditions.push(simpleCondition);
                        currentCondition = '';
                    }

                    // 添加逻辑运算符
                    result.logicalOperators.push(logicalOpMatch[1].toUpperCase() as LogicalOperator);
                    i += logicalOpMatch[0].length;
                } else {
                    currentCondition += conditionStr[i];
                    i++;
                }
            } else {
                currentCondition += conditionStr[i];
                i++;
            }
        }

        // 处理最后一个条件
        if (currentCondition.trim()) {
            const simpleCondition: NestedCondition = {
                type: 'simple'
            };

            // 解析简单条件
            const condition: Condition = { field: '', operator: '=' as Operator, value: null };
            this.parseSimpleCondition(currentCondition.trim(), condition);
            simpleCondition.condition = condition;

            result.conditions.push(simpleCondition);
        }

        return result;
    }

    // 解析简单条件
    private parseSimpleCondition(conditionStr: string, condition: Condition): void {
        // Support compound operators like 'NOT LIKE' and 'NOT IN'
        const operatorPattern = /(!=|>=|<=|>|<|=|NOT LIKE|LIKE|NOT IN|IN|BETWEEN)/i;
        const parts = conditionStr.split(operatorPattern);

        if (parts.length >= 3) {
            // 清理字段名中可能的括号
            condition.field = parts[0].trim().replace(/^\(+|\)+$/g, '');
            condition.operator = parts[1].trim().toUpperCase() as Operator;

            // 清理值中可能的括号
            let valueStr = parts.slice(2).join('').trim();
            valueStr = valueStr.replace(/\)+$/g, '');

            // 处理特殊值类型
            if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
                condition.value = valueStr.replace(/^\(|\)$/g, '').split(',').map(v => this.parseValue(v.trim()));
            } else if (condition.operator === 'BETWEEN') {
                // 处理BETWEEN操作符
                // 检查是否是我们预处理的格式 (min,max)
                const commaMatch = valueStr.match(/\s*(\d+),(\d+)\s*/);
                if (commaMatch) {
                    const [_, min, max] = commaMatch;
                    condition.value = [this.parseValue(min), this.parseValue(max)];
                } else {
                    // 尝试标准格式 min AND max
                    const betweenMatch = valueStr.match(/\s*(\d+)\s+AND\s+(\d+)\s*/i);
                    if (betweenMatch) {
                        const [_, min, max] = betweenMatch;
                        condition.value = [this.parseValue(min), this.parseValue(max)];
                    } else {
                        console.error(`BETWEEN语法错误: ${valueStr}`);
                        condition.value = [0, 0]; // 默认值，避免后续错误
                    }
                }
            } else {
                condition.value = this.parseValue(valueStr);
            }
        }
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
    async execute(page: number = 0, size: number = 50, excludeData: boolean): Promise<{ isLast: boolean, data: Item[], total: number, ids?: number[] }> {
        // 如果没有条件，返回所有项目
        if (this.query.conditions.length === 0) {
            return await itemRepo.findAll(() => true, page, size, undefined, excludeData);
        }

        // 创建过滤函数
        const filterFn = (item: Item) => {
            return this.evaluateNestedConditions(item, this.query.conditions, this.query.logicalOperators);
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
        const result = await itemRepo.findAll(filterFn, page, limit, sortFn, excludeData);

        // console.log(`查询结果: ${result.total} 条记录`, page, limit);
        return result;
    }


    async executeIds(): Promise<number[]> {
        // 如果没有条件，返回所有项目
        if (this.query.conditions.length === 0) {
            return await itemRepo.listAllIds(() => true);
        }

        // 创建过滤函数
        const filterFn = (item: Item) => {
            return this.evaluateNestedConditions(item, this.query.conditions, this.query.logicalOperators);
        };

        // 使用itemRepo执行查询
        const result = await itemRepo.listAllIds(filterFn);

        return result;
    }

    // 获取Item对象的字段值
    private getItemValue(item: Item, field: string): any {
        // 检查字段是否为空
        if (!field) {
            console.error('字段名为空');
            return undefined;
        }

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
            case 'NOT LIKE':
                if (typeof itemValue !== 'string') {
                    itemValue = String(itemValue);
                }
                if (typeof conditionValue !== 'string') {
                    conditionValue = String(conditionValue);
                }
                return !itemValue.toLowerCase().includes(conditionValue.toLowerCase());
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

    // 添加新方法：预处理时间函数
    private preprocessTimeFunctions(sqlLike: string): string {
        // 先处理最内层的NOW()函数
        const nowTimestamp = Math.floor(Date.now() / 1000);
        sqlLike = sqlLike.replace(/NOW\(\)/gi, nowTimestamp.toString());

        // 处理 UNIX_TIMESTAMP(NOW()) 函数
        sqlLike = sqlLike.replace(/UNIX_TIMESTAMP\((\d+)\)/gi, "$1");

        // 处理 DATE_SUB 函数，例如：DATE_SUB(1750930315, INTERVAL 1 WEEK)
        const dateSub = /DATE_SUB\((\d+),\s*INTERVAL\s+(\d+)\s+(DAY|WEEK|MONTH|YEAR)\)/gi;
        sqlLike = sqlLike.replace(dateSub, (_, timestamp, amount, unit) => {
            const date = new Date(parseInt(timestamp) * 1000); // 转换为毫秒
            const amountNum = parseInt(amount);

            switch (unit.toUpperCase()) {
                case 'DAY':
                    date.setDate(date.getDate() - amountNum);
                    break;
                case 'WEEK':
                    date.setDate(date.getDate() - (amountNum * 7));
                    break;
                case 'MONTH':
                    date.setMonth(date.getMonth() - amountNum);
                    break;
                case 'YEAR':
                    date.setFullYear(date.getFullYear() - amountNum);
                    break;
            }

            return Math.floor(date.getTime() / 1000).toString();
        });

        // 再次检查是否有未处理的嵌套函数
        if (sqlLike.includes('UNIX_TIMESTAMP') || sqlLike.includes('DATE_SUB')) {
            sqlLike = this.preprocessTimeFunctions(sqlLike);
        }

        return sqlLike;
    }

    // 评估嵌套条件
    private evaluateNestedConditions(item: Item, conditions: NestedCondition[], logicalOperators: LogicalOperator[]): boolean {
        if (conditions.length === 0) {
            return true;
        }

        let result = this.evaluateSingleNestedCondition(item, conditions[0]);

        for (let i = 0; i < logicalOperators.length; i++) {
            const nextResult = this.evaluateSingleNestedCondition(item, conditions[i + 1]);

            if (logicalOperators[i] === 'AND') {
                result = result && nextResult;
            } else {
                result = result || nextResult;
            }
        }

        return result;
    }

    // 评估单个嵌套条件
    private evaluateSingleNestedCondition(item: Item, nestedCondition: NestedCondition): boolean {
        if (nestedCondition.type === 'simple' && nestedCondition.condition) {
            const condition = nestedCondition.condition;
            const itemValue = this.getItemValue(item, condition.field);
            return this.evaluateCondition(itemValue, condition.operator, condition.value);
        } else if (nestedCondition.type === 'group' && nestedCondition.group) {
            return this.evaluateNestedConditions(
                item,
                nestedCondition.group.conditions,
                nestedCondition.group.logicalOperators
            );
        }

        return false;
    }

    // 添加 parseValue 方法
    private parseValue(valueStr: string): any {
        // 移除引号
        valueStr = valueStr.trim().replace(/^['"]|['"]$/g, '');

        // 尝试解析为数字
        if (/^-?\d+$/.test(valueStr)) {
            return parseInt(valueStr, 10);
        } else if (/^-?\d+\.\d+$/.test(valueStr)) {
            return parseFloat(valueStr);
        } else if (valueStr.toLowerCase() === 'true') {
            return true;
        } else if (valueStr.toLowerCase() === 'false') {
            return false;
        } else if (valueStr.toLowerCase() === 'null') {
            return null;
        }

        // 默认返回字符串
        return valueStr;
    }
}

const filter = new ItemFilter();


// 使用 quickstart
export async function filterItems(sqlQuery: string, page: number = 0, size: number = 50): Promise<{ isLast: boolean, data: Item[], total: number, ids?: number[] }> {
    return await filter.setQuery(sqlQuery).execute(page, size, true);
}

export async function filterItemIds(sqlQuery: string): Promise<number[]> {
    return await new ItemFilter().setQuery(sqlQuery).executeIds();
}

// 添加到全局对象，方便调试
(window as any).filterItems = filterItems;
