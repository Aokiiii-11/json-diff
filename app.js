// 全局变量
let jsonData1 = null;
let jsonData2 = null;
let jsonName1 = 'JSON字符串 A';
let jsonName2 = 'JSON字符串 B';
let diffResult = null;
let currentView = 'sideBySide';
let showOnlyDifferences = false;

// DOM元素
let jsonInput1, jsonInput2, jsonInfo1, jsonInfo2;
let statusInfo, diffStats, diffCount, diffList, navigatorHeader;
let compareBtn, expandAllBtn, collapseAllBtn, showOnlyDiffBtn;
let sideBySideTab, inlineTab, diffContent;

// 初始化函数
function init() {
    // 获取DOM元素
    jsonInput1 = document.getElementById('jsonInput1');
    jsonInput2 = document.getElementById('jsonInput2');
    jsonInfo1 = document.getElementById('jsonInfo1');
    jsonInfo2 = document.getElementById('jsonInfo2');
    
    statusInfo = document.getElementById('statusInfo');
    diffStats = document.getElementById('diffStats');
    diffCount = document.getElementById('diffCount');
    diffList = document.getElementById('diffList');
    navigatorHeader = document.querySelector('.navigator-header');
    
    compareBtn = document.getElementById('compareBtn');
    expandAllBtn = document.getElementById('expandAllBtn');
    collapseAllBtn = document.getElementById('collapseAllBtn');
    showOnlyDiffBtn = document.getElementById('showOnlyDiffBtn');
    
    sideBySideTab = document.getElementById('sideBySideTab');
    inlineTab = document.getElementById('inlineTab');
    diffContent = document.getElementById('diffContent');
    
    // 绑定事件
    jsonInput1.addEventListener('input', handleJson1Change);
    jsonInput2.addEventListener('input', handleJson2Change);
    
    compareBtn.addEventListener('click', compareFiles);
    expandAllBtn.addEventListener('click', expandAllNodes);
    collapseAllBtn.addEventListener('click', collapseAllNodes);
    showOnlyDiffBtn.addEventListener('click', toggleShowOnlyDifferences);
    
    sideBySideTab.addEventListener('click', () => switchView('sideBySide'));
    inlineTab.addEventListener('click', () => switchView('inline'));
    
    // 更新按钮状态
    updateButtonStates();
}

// 处理JSON字符串1输入
function handleJson1Change(event) {
    const jsonString = event.target.value.trim();
    
    if (!jsonString) {
        jsonData1 = null;
        jsonInfo1.textContent = '未输入JSON';
        updateButtonStates();
        return;
    }
    
    try {
        jsonData1 = JSON.parse(jsonString);
        jsonInfo1.textContent = 'JSON格式正确';
        jsonInfo1.style.color = '#28a745';
        updateButtonStates();
    } catch (error) {
        jsonData1 = null;
        jsonInfo1.textContent = 'JSON格式错误: ' + error.message;
        jsonInfo1.style.color = '#dc3545';
        updateButtonStates();
    }
}

// 处理JSON字符串2输入
function handleJson2Change(event) {
    const jsonString = event.target.value.trim();
    
    if (!jsonString) {
        jsonData2 = null;
        jsonInfo2.textContent = '未输入JSON';
        updateButtonStates();
        return;
    }
    
    try {
        jsonData2 = JSON.parse(jsonString);
        jsonInfo2.textContent = 'JSON格式正确';
        jsonInfo2.style.color = '#28a745';
        updateButtonStates();
    } catch (error) {
        jsonData2 = null;
        jsonInfo2.textContent = 'JSON格式错误: ' + error.message;
        jsonInfo2.style.color = '#dc3545';
        updateButtonStates();
    }
}

// 更新按钮状态
function updateButtonStates() {
    const jsonLoaded = jsonData1 !== null && jsonData2 !== null;
    compareBtn.disabled = !jsonLoaded;
    
    if (jsonLoaded) {
        statusInfo.textContent = '就绪 - 已解析两个JSON字符串';
    } else if (jsonData1 !== null) {
        statusInfo.textContent = '已解析JSON A - 请输入第二个JSON字符串';
    } else if (jsonData2 !== null) {
        statusInfo.textContent = '已解析JSON B - 请输入第一个JSON字符串';
    } else {
        statusInfo.textContent = '就绪 - 请输入两个JSON字符串进行对比';
    }
}

// 对比文件
function compareFiles() {
    if (!jsonData1 || !jsonData2) return;
    
    statusInfo.textContent = '正在对比文件...';
    
    try {
        // 执行深度对比
        diffResult = deepCompare(jsonData1, jsonData2);
        
        // 生成差异统计
        const stats = generateDiffStats(diffResult);
        updateDiffStats(stats);
        
        // 更新差异导航列表
        generateDiffList(diffResult);
        
        // 渲染差异视图
        renderDiffView();
        
        statusInfo.textContent = `对比完成 - 发现 ${stats.total} 个差异`;
    } catch (error) {
        alert('对比过程中出错: ' + error.message);
        statusInfo.textContent = '对比失败';
    }
}

// 深度对比两个JSON对象
function deepCompare(obj1, obj2, path = '') {
    const result = {
        type: 'object',
        path: path,
        added: [],
        removed: [],
        modified: [],
        children: {}
    };
    
    // 检查类型
    if (typeof obj1 !== typeof obj2) {
        result.modified.push({
            key: 'value',
            oldValue: stringifyValue(obj1),
            newValue: stringifyValue(obj2),
            type: 'typeChange'
        });
        return result;
    }
    
    // 处理null值
    if (obj1 === null && obj2 === null) {
        return result;
    }
    
    if (obj1 === null || obj2 === null) {
        result.modified.push({
            key: 'value',
            oldValue: stringifyValue(obj1),
            newValue: stringifyValue(obj2),
            type: 'nullChange'
        });
        return result;
    }
    
    // 处理基本类型
    if (typeof obj1 !== 'object') {
        if (obj1 !== obj2) {
            result.modified.push({
                key: 'value',
                oldValue: stringifyValue(obj1),
                newValue: stringifyValue(obj2),
                type: 'valueChange'
            });
        }
        return result;
    }
    
    // 处理数组
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        // 数组长度比较
        if (obj1.length !== obj2.length) {
            result.modified.push({
                key: 'length',
                oldValue: obj1.length,
                newValue: obj2.length,
                type: 'arrayLengthChange'
            });
        }
        
        // 比较数组元素
        const maxLength = Math.max(obj1.length, obj2.length);
        for (let i = 0; i < maxLength; i++) {
            const itemPath = path ? `${path}[${i}]` : `[${i}]`;
            
            if (i >= obj1.length) {
                // 元素在obj2中新增
                result.added.push({
                    index: i,
                    value: obj2[i],
                    path: itemPath
                });
            } else if (i >= obj2.length) {
                // 元素在obj1中移除
                result.removed.push({
                    index: i,
                    value: obj1[i],
                    path: itemPath
                });
            } else {
                // 递归比较数组元素
                const childDiff = deepCompare(obj1[i], obj2[i], itemPath);
                if (hasDifferences(childDiff)) {
                    result.children[i] = childDiff;
                }
            }
        }
        return result;
    }
    
    // 处理对象
    if (!Array.isArray(obj1) && !Array.isArray(obj2)) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        // 查找被删除的键
        for (const key of keys1) {
            const keyPath = path ? `${path}.${key}` : key;
            
            if (!keys2.includes(key)) {
                result.removed.push({
                    key: key,
                    value: obj1[key],
                    path: keyPath
                });
            } else {
                // 递归比较对象属性
                const childDiff = deepCompare(obj1[key], obj2[key], keyPath);
                if (hasDifferences(childDiff)) {
                    result.children[key] = childDiff;
                }
            }
        }
        
        // 查找新增的键
        for (const key of keys2) {
            const keyPath = path ? `${path}.${key}` : key;
            
            if (!keys1.includes(key)) {
                result.added.push({
                    key: key,
                    value: obj2[key],
                    path: keyPath
                });
            }
        }
        return result;
    }
    
    // 一个是数组，一个是对象
    result.modified.push({
        key: 'value',
        oldValue: stringifyValue(obj1),
        newValue: stringifyValue(obj2),
        type: 'structureChange'
    });
    
    return result;
}

// 检查差异对象是否包含差异
function hasDifferences(diff) {
    return diff.added.length > 0 || 
           diff.removed.length > 0 || 
           diff.modified.length > 0 || 
           Object.keys(diff.children).length > 0;
}

// 将值转换为字符串表示
function stringifyValue(value) {
    if (value === null) return 'null';
    if (typeof value === 'undefined') return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

// 生成差异统计
function generateDiffStats(diff) {
    const stats = { added: 0, removed: 0, modified: 0, total: 0 };
    
    function collectStats(d) {
        stats.added += d.added.length;
        stats.removed += d.removed.length;
        stats.modified += d.modified.length;
        
        // 递归收集子节点统计
        for (const key in d.children) {
            collectStats(d.children[key]);
        }
    }
    
    collectStats(diff);
    stats.total = stats.added + stats.removed + stats.modified;
    
    return stats;
}

// 更新差异统计显示
function updateDiffStats(stats) {
    diffStats.textContent = `新增: ${stats.added} | 删除: ${stats.removed} | 修改: ${stats.modified}`;
    diffCount.textContent = `${stats.total} 个差异`;
}

// 生成差异导航列表
function generateDiffList(diff) {
    diffList.innerHTML = '';
    
    if (!hasDifferences(diff)) {
        const emptyEl = document.createElement('p');
        emptyEl.className = 'empty-message';
        emptyEl.textContent = '两个文件完全相同，没有差异';
        diffList.appendChild(emptyEl);
        return;
    }
    
    const diffItems = [];
    
    function collectDiffItems(d) {
        // 处理新增项
        d.added.forEach(item => {
            const diffItem = createDiffItem('added', item.path, '新增', item);
            diffItems.push(diffItem);
        });
        
        // 处理删除项
        d.removed.forEach(item => {
            const diffItem = createDiffItem('removed', item.path, '删除', item);
            diffItems.push(diffItem);
        });
        
        // 处理修改项
        d.modified.forEach(item => {
            // 对于修改项，需要构建包含oldValue和newValue的diffItem对象
            const diffItemObj = {
                oldValue: item.oldValue,
                newValue: item.newValue,
                type: item.type
            };
            const diffItemElement = createDiffItem('modified', d.path, '修改', diffItemObj);
            diffItems.push(diffItemElement);
        });
        
        // 递归处理子节点
        for (const key in d.children) {
            collectDiffItems(d.children[key]);
        }
    }
    
    collectDiffItems(diff);
    
    // 添加差异类型分组
    const groupedItems = {
        added: diffItems.filter(item => item.classList.contains('added')),
        removed: diffItems.filter(item => item.classList.contains('removed')),
        modified: diffItems.filter(item => item.classList.contains('modified'))
    };
    
    // 创建分组标题和添加到DOM
    ['added', 'modified', 'removed'].forEach(type => {
        const items = groupedItems[type];
        if (items.length > 0) {
            const typeName = type === 'added' ? '新增' : type === 'modified' ? '修改' : '删除';
            const groupHeader = document.createElement('div');
            groupHeader.className = `diff-group-header ${type}`;
            groupHeader.textContent = `${typeName} (${items.length}项)`;
            diffList.appendChild(groupHeader);
            
            items.forEach(item => {
                diffList.appendChild(item);
            });
        }
    });
    
    // 添加导航功能
    addNavigationControls();
}

// 添加导航控制功能
function addNavigationControls() {
    // 清除旧的导航控件（如果有）
    const oldNav = navigatorHeader.querySelector('.navigation-controls');
    if (oldNav) {
        oldNav.remove();
    }

    const navContainer = document.createElement('div');
    navContainer.className = 'navigation-controls';

    // 折叠/展开按钮
    const toggleListBtn = document.createElement('button');
    toggleListBtn.className = 'nav-btn toggle-list-btn';
    toggleListBtn.innerHTML = '折叠列表'; // 默认显示收起文案
    toggleListBtn.title = '折叠/展开列表';
    
    // 导航按钮组
    const prevDiffBtn = document.createElement('button');
    prevDiffBtn.className = 'nav-btn';
    prevDiffBtn.innerHTML = '上一个';
    prevDiffBtn.title = '上一个差异';
    
    const nextDiffBtn = document.createElement('button');
    nextDiffBtn.className = 'nav-btn';
    nextDiffBtn.innerHTML = '下一个';
    nextDiffBtn.title = '下一个差异';
    
    navContainer.appendChild(prevDiffBtn);
    navContainer.appendChild(nextDiffBtn);
    navContainer.appendChild(toggleListBtn);
    
    // 插入到标题栏右侧
    navigatorHeader.appendChild(navContainer);
    
    // 导航功能实现
    let currentDiffIndex = -1;
    const allDiffItems = document.querySelectorAll('.diff-item');
    
    function navigateToDiff(index) {
        if (index >= 0 && index < allDiffItems.length) {
            currentDiffIndex = index;
            allDiffItems[index].click();
            
            // 更新按钮状态
            updateNavButtonStates();
        }
    }
    
    function updateNavButtonStates() {
        prevDiffBtn.disabled = allDiffItems.length === 0 || currentDiffIndex <= 0;
        nextDiffBtn.disabled = allDiffItems.length === 0 || currentDiffIndex >= allDiffItems.length - 1;
    }
    
    // 绑定按钮事件
    prevDiffBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToDiff(currentDiffIndex - 1);
    });
    nextDiffBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToDiff(currentDiffIndex + 1);
    });

    // 折叠/展开功能
    let isCollapsed = false;
    toggleListBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            diffList.style.display = 'none';
            toggleListBtn.innerHTML = '🔽';
        } else {
            diffList.style.display = 'flex';
            toggleListBtn.innerHTML = '🔼';
        }
    });
    
    // 初始化按钮状态
    updateNavButtonStates();
}

// 创建差异项元素
function createDiffItem(type, path, action, diffItem) {
    const item = document.createElement('div');
    item.className = `diff-item ${type}`;
    
    // 获取上下文信息 (id, timestamp)
    let contextInfoStr = '';
    const contextParts = [];
    
    // 1. 检查当前项本身是否包含 id/timestamp (适用于新增对象或结构变化)
    let itemValue = null;
    if (type === 'added') itemValue = diffItem.value;
    else if (type === 'removed') itemValue = diffItem.value;
    else if (type === 'modified') itemValue = diffItem.newValue;
    
    if (itemValue && typeof itemValue === 'object' && itemValue !== null) {
        if (itemValue.id !== undefined) contextParts.push(`id: ${itemValue.id}`);
        if (itemValue.timestamp !== undefined) contextParts.push(`timestamp: ${itemValue.timestamp}`);
    }
    
    // 2. 如果当前项没有信息，尝试查找父对象 (适用于属性修改)
    if (contextParts.length === 0) {
        // 确定目标JSON (新增/修改查新版，删除查旧版)
        const targetJson = (type === 'removed') ? jsonData1 : jsonData2;
        
        if (targetJson) {
            // 获取父路径
            let parentPath = null;
            const lastDotIndex = path.lastIndexOf('.');
            const lastBracketIndex = path.lastIndexOf('[');
            
            if (lastDotIndex > lastBracketIndex) {
                parentPath = path.substring(0, lastDotIndex);
            } else if (lastBracketIndex > -1) {
                parentPath = path.substring(0, lastBracketIndex);
            }
            
            // 如果找到了父路径，获取父对象
            if (parentPath !== null) {
                const parentObj = getValueByPath(targetJson, parentPath);
                if (parentObj && typeof parentObj === 'object' && parentObj !== null) {
                    if (parentObj.id !== undefined) contextParts.push(`id: ${parentObj.id}`);
                    if (parentObj.timestamp !== undefined) contextParts.push(`timestamp: ${parentObj.timestamp}`);
                }
            }
        }
    }
    
    if (contextParts.length > 0) {
        contextInfoStr = ` (${contextParts.join(', ')})`;
    }
    
    // 创建标题
    const title = document.createElement('div');
    title.className = 'diff-title';
    title.textContent = `${action}: ${path}${contextInfoStr}`;
    
    // 创建详情
    const details = document.createElement('div');
    details.className = 'diff-details';
    
    // 根据差异类型显示不同详情
    if (diffItem) {
        if (type === 'modified') {
            // 修改类型的详情
            if (diffItem.oldValue !== undefined && diffItem.newValue !== undefined) {
                details.innerHTML = `
                    <div class="diff-old-value">修改前: ${stringifyValue(diffItem.oldValue)}</div>
                    <div class="diff-new-value">修改后: ${stringifyValue(diffItem.newValue)}</div>
                `;
            }
        } else if (type === 'added') {
            // 新增类型的详情
            details.innerHTML = `<div>值: ${stringifyValue(diffItem.value || diffItem.newValue)}</div>`;
        } else if (type === 'removed') {
            // 删除类型的详情
            details.innerHTML = `<div>值: ${stringifyValue(diffItem.value || diffItem.oldValue)}</div>`;
        }
    }
    
    // 添加点击事件，滚动到对应位置
    item.addEventListener('click', () => {

        
        // 先展开所有节点以便找到目标元素
        expandAllNodes();
        
        // 首先清除所有已有的高亮
        const highlightedElements = document.querySelectorAll('.highlight');
        highlightedElements.forEach(el => el.classList.remove('highlight'));
        
        // 构建路径选择器数组
        const exactPath = `[data-path="${path}"]`;
        const childPathDot = `[data-path^="${path}."]`;
        const childPathBracket = `[data-path^="${path}["`;
        const containsPathDot = `[data-path*=".${path}."]`;
        const containsPathStart = `[data-path^="${path}"]`;
        const containsPathEnd = `[data-path$=".${path}"]`;
        const containsPathArray = `[data-path*="[${path}]"],[data-path*="[${path}."]`;
        
        // 分阶段查找匹配元素，从最精确到最模糊
        let matchingElements = [];
        
        // 1. 首先查找精确匹配
        matchingElements = Array.from(document.querySelectorAll(exactPath));
        
        // 2. 如果没有精确匹配，查找子路径匹配
        if (matchingElements.length === 0) {
            matchingElements = Array.from(document.querySelectorAll(`${childPathDot}, ${childPathBracket}`));
        }
        
        // 3. 如果还是没有匹配，尝试包含匹配
        if (matchingElements.length === 0) {
            matchingElements = Array.from(document.querySelectorAll(
                `${containsPathDot}, ${containsPathStart}, ${containsPathEnd}, ${containsPathArray}`
            ));
        }
        
        // 4. 最后尝试模糊匹配
        if (matchingElements.length === 0) {
            const allElements = document.querySelectorAll('[data-path]');
            matchingElements = Array.from(allElements).filter(el => {
                const elPath = el.getAttribute('data-path');
                return elPath && (elPath.includes(path) || path.includes(elPath));
            });
        }
        

        
        // 高亮所有匹配元素
        if (matchingElements.length > 0) {
            matchingElements.forEach(el => {
                const elPath = el.getAttribute('data-path');
    
                el.classList.add('highlight');
                setTimeout(() => {
                    if (el && el.classList) {
                        el.classList.remove('highlight');
                    }
                }, 2000);
            });
            
            // 对于并排对比视图，分别处理左右面板
            if (currentView === 'sideBySide') {
                const filePanes = document.querySelectorAll('.file-pane');
        
                
                filePanes.forEach((pane, index) => {
                    const paneName = index === 0 ? '左侧面板' : '右侧面板';
                    
                    // 查找面板中的匹配元素
                    const paneMatchingElements = matchingElements.filter(el => 
                        pane.contains(el)
                    );
                    
    
                    
                    if (paneMatchingElements.length > 0) {
                        // 滚动到面板中的第一个匹配元素
                        if (paneMatchingElements[0] && paneMatchingElements[0].scrollIntoView) {
        
                            paneMatchingElements[0].scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                                inline: 'center'
                            });
                        }
                    }
                });
            } else {
                // 对于内联视图，滚动到第一个匹配元素
                if (matchingElements[0] && matchingElements[0].scrollIntoView) {
        
                    matchingElements[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        } else {

        }
    });
    
    // 可点击展开/折叠详情
    title.addEventListener('click', (e) => {
        e.stopPropagation();
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });
    
    item.appendChild(title);
    item.appendChild(details);
    
    return item;
}

// 切换视图模式
function switchView(viewType) {
    currentView = viewType;
    
    // 更新标签状态
    sideBySideTab.classList.remove('active');
    inlineTab.classList.remove('active');
    
    if (viewType === 'sideBySide') {
        sideBySideTab.classList.add('active');
    } else {
        inlineTab.classList.add('active');
    }
    
    // 重新渲染视图
    if (diffResult) {
        renderDiffView();
    }
}

// 渲染差异视图
function renderDiffView() {
    diffContent.innerHTML = '';
    
    if (!diffResult) {
        return;
    }
    
    if (currentView === 'sideBySide') {
        renderSideBySideView();
    } else {
        renderInlineView();
    }
}

// 渲染并排对比视图
function renderSideBySideView() {
    const sideBySideContainer = document.createElement('div');
    sideBySideContainer.className = 'side-by-side-view';
    
    // 左侧JSON
    const leftPane = createFilePane(jsonName1, jsonData1, diffResult, 'left');
    
    // 右侧JSON
    const rightPane = createFilePane(jsonName2, jsonData2, diffResult, 'right');
    
    sideBySideContainer.appendChild(leftPane);
    sideBySideContainer.appendChild(rightPane);
    
    diffContent.appendChild(sideBySideContainer);
}

// 渲染内联对比视图
function renderInlineView() {
    const inlineContainer = document.createElement('div');
    inlineContainer.className = 'inline-view';
    
    const fileHeader = document.createElement('div');
    fileHeader.className = 'file-header';
    fileHeader.textContent = `内联对比: ${jsonName1} vs ${jsonName2}`;
    
    const jsonTree = document.createElement('div');
    jsonTree.className = 'json-tree';
    
    // 渲染合并后的JSON树
    renderMergedJsonTree(jsonTree, jsonData1, jsonData2, diffResult);
    
    inlineContainer.appendChild(fileHeader);
    inlineContainer.appendChild(jsonTree);
    
    diffContent.appendChild(inlineContainer);
}

// 创建文件面板
function createFilePane(title, data, diff, side) {
    const pane = document.createElement('div');
    pane.className = 'file-pane';
    
    const header = document.createElement('div');
    header.className = 'file-header';
    header.textContent = title;
    
    const tree = document.createElement('div');
    tree.className = 'json-tree';
    
    // 渲染JSON树
    renderJsonTree(tree, data, diff, side);
    
    pane.appendChild(header);
    pane.appendChild(tree);
    
    return pane;
}

// 渲染JSON树
function renderJsonTree(container, data, diff, side) {
    const rootNode = document.createElement('div');
    rootNode.className = 'json-node';
    
    renderNode(rootNode, data, '', diff, side);
    
    container.appendChild(rootNode);
    
    // 在仅显示差异模式下，默认展开所有节点
    if (showOnlyDifferences) {
        // 延迟执行以确保所有节点已渲染完成
        setTimeout(() => {
            expandAllNodes();
        }, 100);
    }
}

// 渲染节点
function renderNode(container, value, path, diff, side) {
    if (value === null || typeof value !== 'object') {
        // 渲染基本类型节点
        const node = document.createElement('div');
        node.className = 'json-item';
        node.textContent = stringifyValue(value);
        
        // 应用差异样式
        applyDiffStyles(node, path, diff, side);
        
        container.appendChild(node);
        return;
    }
    
    if (Array.isArray(value)) {
        renderArrayNode(container, value, path, diff, side);
    } else {
        renderObjectNode(container, value, path, diff, side);
    }
}

// 渲染数组节点
function renderArrayNode(container, array, path, diff, side) {
    const arrayNode = document.createElement('div');
    arrayNode.className = 'json-item array-item';
    arrayNode.setAttribute('data-path', path);
    
    const collapsible = document.createElement('span');
    collapsible.className = 'collapsible';
    
    const content = document.createElement('span');
    content.textContent = `[${array.length} 项]`;
    
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'json-node';
    
    // 渲染数组元素
    array.forEach((item, index) => {
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        renderNode(childrenContainer, item, itemPath, diff, side);
    });
    
    // 添加折叠功能
    collapsible.addEventListener('click', () => {
        collapsible.classList.toggle('collapsed');
        childrenContainer.style.display = childrenContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    arrayNode.appendChild(collapsible);
    arrayNode.appendChild(content);
    arrayNode.appendChild(childrenContainer);
    
    // 应用差异样式
    applyDiffStyles(arrayNode, path, diff, side);
    
    container.appendChild(arrayNode);
}

// 渲染对象节点
function renderObjectNode(container, object, path, diff, side) {
    const objectNode = document.createElement('div');
    objectNode.className = 'json-item object-item';
    objectNode.setAttribute('data-path', path);
    
    const collapsible = document.createElement('span');
    collapsible.className = 'collapsible';
    
    const content = document.createElement('span');
    content.textContent = `{${Object.keys(object).length} 个属性}`;
    
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'json-node';
    
    // 渲染对象属性
    Object.keys(object).forEach(key => {
        const keySpan = document.createElement('span');
        keySpan.className = 'json-key';
        keySpan.textContent = `${key}: `;
        
        const valueContainer = document.createElement('span');
        const valuePath = path ? `${path}.${key}` : key;
        
        renderNode(valueContainer, object[key], valuePath, diff, side);
        
        const propNode = document.createElement('div');
        propNode.className = 'property-item';
        propNode.setAttribute('data-path', valuePath);
        
        propNode.appendChild(keySpan);
        propNode.appendChild(valueContainer);
        
        // 应用差异样式
        applyDiffStyles(propNode, valuePath, diff, side);
        
        childrenContainer.appendChild(propNode);
    });
    
    // 添加折叠功能
    collapsible.addEventListener('click', () => {
        collapsible.classList.toggle('collapsed');
        childrenContainer.style.display = childrenContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    objectNode.appendChild(collapsible);
    objectNode.appendChild(content);
    objectNode.appendChild(childrenContainer);
    
    // 应用差异样式
    applyDiffStyles(objectNode, path, diff, side);
    
    container.appendChild(objectNode);
}

// 应用差异样式
function applyDiffStyles(element, path, diff, side) {
    // 查找当前路径的差异信息
    const diffInfo = findDiffInfo(diff, path);
    
    // 添加路径属性用于导航
    element.setAttribute('data-path', path);
    
    if (side === 'left') {
        // 左侧文件 - 检查删除和修改
        if (diffInfo && diffInfo.removed) {
            element.classList.add('removed');
        }
        if (diffInfo && diffInfo.modified && diffInfo.oldValue !== undefined) {
            element.classList.add('modified');
            // 显示修改前后的值
            const changeIndicator = document.createElement('span');
            changeIndicator.className = 'change-indicator';
            changeIndicator.textContent = `[修改前: ${diffInfo.oldValue}]`;
            element.appendChild(changeIndicator);
        }
    } else {
        // 右侧文件 - 检查新增和修改
        if (diffInfo && diffInfo.added) {
            element.classList.add('added');
        }
        if (diffInfo && diffInfo.modified && diffInfo.newValue !== undefined) {
            element.classList.add('modified');
            // 显示修改后的值
            const changeIndicator = document.createElement('span');
            changeIndicator.className = 'change-indicator';
            changeIndicator.textContent = `[修改为: ${diffInfo.newValue}]`;
            element.appendChild(changeIndicator);
        }
    }
    
    // 根据shouldShowNode函数决定是否显示元素
    if (showOnlyDifferences) {
        // 对于对象和数组节点，先初始设为隐藏，在渲染完子节点后再决定
        if (element.classList.contains('object-item') || element.classList.contains('array-item')) {
            // 延迟判断，确保子节点已渲染
            setTimeout(() => {
                element.style.display = shouldShowNode(element, path, diff) ? 'block' : 'none';
            }, 0);
        } else {
            // 对于基本类型节点，直接判断
            element.style.display = shouldShowNode(element, path, diff) ? 'block' : 'none';
        }
    } else {
        // 非仅显示差异模式下，确保所有元素可见
        element.style.removeProperty('display');
    }
}

// 查找路径对应的差异信息
function findDiffInfo(diff, path) {
    if (!diff || typeof diff !== 'object' || !path || typeof path !== 'string') return null;
    
    // 精确匹配当前路径
    if (diff.path === path) {
        return {
            added: diff.added && diff.added.length > 0,
            removed: diff.removed && diff.removed.length > 0,
            modified: diff.modified && diff.modified.length > 0,
            // 查找修改项中的具体值
            oldValue: diff.modified && diff.modified.length > 0 ? diff.modified[0].oldValue : undefined,
            newValue: diff.modified && diff.modified.length > 0 ? diff.modified[0].newValue : undefined
        };
    }
    
    // 检查当前层级的添加和删除项
    if (diff.added && Array.isArray(diff.added)) {
        for (const item of diff.added) {
            if (item && typeof item === 'object' && item.path && (
                item.path === path || 
                path.startsWith(item.path + '.') || 
                path.startsWith(item.path + '[')
            )) {
                return { added: true, value: item.value };
            }
        }
    }
    
    if (diff.removed && Array.isArray(diff.removed)) {
        for (const item of diff.removed) {
            if (item && typeof item === 'object' && item.path && (
                item.path === path || 
                path.startsWith(item.path + '.') || 
                path.startsWith(item.path + '[')
            )) {
                return { removed: true, value: item.value };
            }
        }
    }
    
    // 检查当前层级的修改项
    if (diff.modified && Array.isArray(diff.modified)) {
        for (const item of diff.modified) {
            if (item && typeof item === 'object' && item.path && (
                item.path === path || 
                (diff.path && diff.path === path) || 
                path.startsWith(item.path + '.') || 
                path.startsWith(item.path + '[') ||
                item.path.startsWith(path + '.') || 
                item.path.startsWith(path + '[')
            )) {
                return { 
                    modified: true, 
                    oldValue: item.oldValue, 
                    newValue: item.newValue 
                };
            }
        }
    }
    
    // 递归检查子节点
    if (diff.children && typeof diff.children === 'object') {
        for (const key in diff.children) {
            const childDiff = diff.children[key];
            if (childDiff && typeof childDiff === 'object' && childDiff.path) {
                // 改进路径匹配逻辑，支持对象属性和数组索引
                if (childDiff.path === path || 
                    path.startsWith(childDiff.path + '.') || 
                    path.startsWith(childDiff.path + '[') ||
                    childDiff.path.startsWith(path + '.') || 
                    childDiff.path.startsWith(path + '[')) {
                    const result = findDiffInfo(childDiff, path);
                    if (result) return result;
                }
            }
        }
    }
    
    // 额外检查：如果路径包含数组索引，尝试匹配数组路径
    const arrayMatch = path.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
        const arrayPath = arrayMatch[1];
        const index = parseInt(arrayMatch[2]);
        
        // 检查父数组是否有差异
        if (diff.children && typeof diff.children === 'object') {
            for (const key in diff.children) {
                const childDiff = diff.children[key];
                if (childDiff && typeof childDiff === 'object' && childDiff.path && (
                    childDiff.path === arrayPath || 
                    childDiff.path.startsWith(arrayPath)
                )) {
                    const result = findDiffInfo(childDiff, path);
                    if (result) return result;
                }
            }
        }
    }
    
    return null;
}

// 渲染合并后的JSON树（内联视图）
function renderMergedJsonTree(container, data1, data2, diff) {
    // 实现内联对比视图的渲染
    const rootNode = document.createElement('div');
    rootNode.className = 'json-node';
    
    // 简化实现，后续需要完善
    rootNode.textContent = '内联对比视图开发中...';
    
    container.appendChild(rootNode);
}

// 展开所有节点
function expandAllNodes() {
    const collapsibles = document.querySelectorAll('.collapsible.collapsed');
    collapsibles.forEach(collapsible => {
        collapsible.click();
    });
}

// 折叠所有节点
function collapseAllNodes() {
    const collapsibles = document.querySelectorAll('.collapsible:not(.collapsed)');
    collapsibles.forEach(collapsible => {
        collapsible.click();
    });
}

// 切换只显示差异模式
function toggleShowOnlyDifferences() {
    showOnlyDifferences = !showOnlyDifferences;
    
    if (showOnlyDifferences) {
        showOnlyDiffBtn.classList.add('active');
        // 重新渲染视图以应用仅显示差异模式
        renderDiffView();
    } else {
        showOnlyDiffBtn.classList.remove('active');
        // 重新渲染视图以显示所有内容
        renderDiffView();
    }
}

// 检查节点是否需要在仅显示差异模式下显示
function shouldShowNode(element, path, diff) {
    if (!showOnlyDifferences) return true;
    
    // 检查当前节点是否有差异
    const diffInfo = findDiffInfo(diff, path);
    if (diffInfo) {
        return true; // 当前节点有差异，应该显示
    }
    
    // 递归检查差异对象，看是否有子节点包含差异
    if (hasChildDifferences(diff, path)) {
        return true; // 包含差异子节点，应该显示
    }
    
    // 双重检查：如果DOM已经渲染完成，也检查DOM中是否有差异子节点
    if (element.querySelector('.added, .removed, .modified')) {
        return true;
    }
    
    return false;
}

// 递归检查差异对象中是否包含子节点差异
function hasChildDifferences(diff, path) {
    if (!diff || typeof diff !== 'object') return false;
    
    // 精确匹配当前路径
    if (diff.path === path) {
        // 检查当前节点的子节点是否有差异
        if (Object.keys(diff.children).length > 0) {
            // 检查每个子节点是否有差异
            for (const key in diff.children) {
                const childDiff = diff.children[key];
                if (hasDifferences(childDiff)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // 递归检查子节点
    for (const key in diff.children) {
        const childDiff = diff.children[key];
        // 如果当前路径是子节点路径的前缀，或者完全匹配，递归检查
        if (path === '' || 
            childDiff.path === path || 
            childDiff.path.startsWith(path + '.') || 
            childDiff.path.startsWith(path + '[')) {
            
            if (hasChildDifferences(childDiff, path)) {
                return true;
            }
        } else if (path.startsWith(childDiff.path + '.') || 
                  path.startsWith(childDiff.path + '[')) {
            // 如果子节点路径是当前路径的前缀，继续递归检查
            if (hasChildDifferences(childDiff, path)) {
                return true;
            }
        }
    }
    
    return false;
}

// 启动应用
window.addEventListener('DOMContentLoaded', init);

// 根据路径获取JSON对象中的值
function getValueByPath(obj, path) {
    if (!obj) return undefined;
    if (!path) return obj;
    
    // 将路径转换为点号分隔的形式
    // items[0] -> items.0
    // [0] -> 0
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1').replace(/^\./, '');
    const parts = normalizedPath.split('.');
    
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = current[part];
    }
    return current;
}