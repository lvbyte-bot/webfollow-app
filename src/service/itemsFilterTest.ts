import { filterItems } from './itemsFilter';

/**
 * 全面的ItemFilter测试案例
 * 包含基本查询、关联查询、复杂条件和边缘情况
 */
async function runAllFilterTests() {
    console.log("===== 开始ItemFilter测试 =====");

    // 基础测试组
    await testBasicFilters();

    // 关联查询测试组
    await testRelationFilters();

    // BETWEEN操作符测试组
    await testBetweenOperator();

    // 复杂条件测试组
    await testComplexConditions();

    // 边缘情况测试组
    await testEdgeCases();

    console.log("===== 所有测试完成 =====");
}

// 1. 基础过滤器测试
async function testBasicFilters() {
    console.log("\n----- 基础过滤器测试 -----");

    // 1.1 简单等于条件
    await runTest("id = 1", "简单等于条件");

    // 1.2 不等于条件
    await runTest("id != 1", "不等于条件");

    // 1.3 大于条件
    await runTest("pubDate > 1600000000", "大于条件");

    // 1.4 小于条件
    await runTest("pubDate < 1700000000", "小于条件");

    // 1.5 大于等于条件
    await runTest("pubDate >= 1600000000", "大于等于条件");

    // 1.6 小于等于条件
    await runTest("pubDate <= 1700000000", "小于等于条件");

    // 1.7 LIKE条件
    await runTest("title LIKE 'test'", "LIKE条件");

    // 1.8 IN条件
    await runTest("id IN (1,2,3,4,5)", "IN条件");

    // 1.9 NOT IN条件
    await runTest("id NOT IN (1,2,3,4,5)", "NOT IN条件");
}

// 2. 关联查询测试
async function testRelationFilters() {
    console.log("\n----- 关联查询测试 -----");

    // 2.1 Feed标题查询
    await runTest("feed.title LIKE 'News'", "Feed标题查询");

    // 2.2 Feed URL查询
    await runTest("feed.url LIKE 'http'", "Feed URL查询");

    // 2.3 Group标题查询
    await runTest("group.title = 'Technology'", "Group标题查询");

    // 2.4 Feed和Item组合查询
    await runTest("feed.title LIKE 'News' AND title LIKE 'tech'", "Feed和Item组合查询");

    // 2.5 Group和Item组合查询
    await runTest("group.title = 'Technology' AND pubDate > 1600000000", "Group和Item组合查询");

    // 2.6 Feed排序
    await runTest("pubDate > 0 ORDER BY feed.title ASC", "Feed排序");

    // 2.7 Group排序
    await runTest("pubDate > 0 ORDER BY group.title DESC", "Group排序");
}

// 3. BETWEEN操作符测试
async function testBetweenOperator() {
    console.log("\n----- BETWEEN操作符测试 -----");

    // 3.1 基本BETWEEN查询
    await runTest("pubDate BETWEEN 1600000000 AND 1700000000", "基本BETWEEN查询");

    // 3.2 带排序的BETWEEN查询
    await runTest("pubDate BETWEEN 1600000000 AND 1700000000 ORDER BY pubDate DESC", "带排序的BETWEEN查询");

    // 3.3 BETWEEN与其他条件组合
    await runTest("pubDate BETWEEN 1600000000 AND 1700000000 AND title LIKE 'test'", "BETWEEN与其他条件组合");

    // 3.4 BETWEEN与关联查询组合
    await runTest("pubDate BETWEEN 1600000000 AND 1700000000 AND feed.title LIKE 'News'", "BETWEEN与关联查询组合");

    // 3.5 ID范围BETWEEN查询
    await runTest("id BETWEEN 1 AND 100", "ID范围BETWEEN查询");
}

// 4. 复杂条件测试
async function testComplexConditions() {
    console.log("\n----- 复杂条件测试 -----");

    // 4.1 多个AND条件
    await runTest("pubDate > 1600000000 AND title LIKE 'test' AND feed.title LIKE 'News'", "多个AND条件");

    // 4.2 多个OR条件
    await runTest("title LIKE 'tech' OR title LIKE 'news' OR title LIKE 'update'", "多个OR条件");

    // 4.3 混合AND和OR条件
    await runTest("(title LIKE 'tech' OR title LIKE 'news') AND pubDate > 1600000000", "混合AND和OR条件");

    // 4.4 复杂排序和限制
    await runTest("pubDate > 0 ORDER BY pubDate DESC LIMIT 10", "复杂排序和限制");

    // 4.5 多字段排序
    await runTest("pubDate > 0 ORDER BY feed.title ASC", "多字段排序");

    // 4.6 复杂关联条件
    await runTest("feed.title LIKE 'News' AND group.title = 'Technology' AND pubDate > 1600000000", "复杂关联条件");
}

// 5. 边缘情况测试
async function testEdgeCases() {
    console.log("\n----- 边缘情况测试 -----");

    // 5.1 空查询
    await runTest("", "空查询");

    // 5.2 只有ORDER BY
    await runTest("ORDER BY pubDate DESC", "只有ORDER BY");

    // 5.3 只有LIMIT
    await runTest("LIMIT 10", "只有LIMIT");

    // 5.4 无效字段
    await runTest("nonexistent_field = 'value'", "无效字段");

    // 5.5 无效操作符
    await runTest("title INVALID_OP 'value'", "无效操作符");

    // 5.6 无效BETWEEN格式
    await runTest("pubDate BETWEEN 1600000000", "无效BETWEEN格式");

    // 5.7 无效IN格式
    await runTest("id IN 1,2,3", "无效IN格式");

    // 5.8 大数据量查询
    await runTest("pubDate > 0 LIMIT 1000", "大数据量查询");

    // 5.9 WHERE关键字测试
    await runTest("WHERE pubDate > 1600000000", "WHERE关键字测试");

    // 5.10 完整SQL风格查询
    await runTest("WHERE pubDate > 1600000000 AND title LIKE 'test' ORDER BY pubDate DESC LIMIT 20", "完整SQL风格查询");
}

// 辅助函数：运行单个测试并输出结果
async function runTest(query: string, description: string) {
    console.log(`\n测试: ${description}`);
    console.log(`查询: ${query}`);

    try {
        const startTime = performance.now();
        const result = await filterItems(query);
        const endTime = performance.now();

        console.log(`结果: ${result.data.length} 条记录`);
        console.log(`耗时: ${(endTime - startTime).toFixed(2)}ms`);

        // 打印前3条结果作为示例
        if (result.data.length > 0) {
            console.log("示例结果:");
            result.data.slice(0, 3).forEach((item, index) => {
                console.log(`  ${index + 1}. ID: ${item.id}, 标题: ${item.title?.substring(0, 30)}...`);
            });
        }

        return result;
    } catch (error) {
        console.error(`测试失败: ${error}`);
        return null;
    }
}

// 导出测试函数
export {
    runAllFilterTests,
    testBasicFilters,
    testRelationFilters,
    testBetweenOperator,
    testComplexConditions,
    testEdgeCases
};