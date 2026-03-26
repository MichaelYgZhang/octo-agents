// 临时诊断脚本 - 在浏览器控制台中运行
console.log('=== Store状态诊断 ===');
console.log('Store.stocks:', Store.stocks);
console.log('Store.stocks长度:', Store.stocks?.length);
console.log('Store.loading:', Store.loading);
console.log('Store.error:', Store.error);
console.log('Store.selectedStock:', Store.selectedStock);

// 检查Vue应用实例
console.log('=== Vue应用状态 ===');
const app = document.querySelector('#app').__vue_app__;
if (app) {
    const rootComponent = app._instance.proxy;
    console.log('Vue根组件stocks:', rootComponent.stocks);
    console.log('Vue根组件stocks长度:', rootComponent.stocks?.length);
}

// 手动测试数据加载
console.log('=== 测试API ===');
API.fetchAllStocks().then(() => {
    console.log('API调用完成');
    console.log('Store.stocks现在是:', Store.stocks);
});
