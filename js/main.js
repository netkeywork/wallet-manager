
// 钱包管理工具 - 主程序入口
class MainApp {
    constructor() {
        this.version = '1.0.0';
        this.isInitialized = false;
        this.init();
    }

    // 程序初始化
    init() {
        console.log('🚀 钱包管理工具启动中...');
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    // DOM准备就绪
    onDOMReady() {
        try {
            // 检查必要的全局对象
            this.checkDependencies();
            
            // 初始化各个模块
            this.initializeModules();
            
            // 绑定全局事件
            this.bindEvents();
            
            // 显示启动信息
            this.showStartupInfo();
            
            this.isInitialized = true;
            console.log('✅ 钱包管理工具初始化完成');
            
        } catch (error) {
            console.error('❌ 程序初始化失败:', error);
            this.showError('程序初始化失败', error.message);
        }
    }

    // 检查依赖项
    checkDependencies() {
        const dependencies = ['logger', 'network', 'wallet'];
        const missing = [];

        dependencies.forEach(dep => {
            if (typeof window[dep] === 'undefined') {
                missing.push(dep);
            }
        });

        if (missing.length > 0) {
            throw new Error(`缺少依赖模块: ${missing.join(', ')}`);
        }
    }

    // 初始化各个模块
    initializeModules() {
        // 日志系统已在 logger.js 中自动初始化
        if (logger) {
            logger.info('主程序启动', `版本: ${this.version}`);
        }

        // 网络管理器已在 network.js 中自动初始化
        if (network) {
            logger.info('网络模块加载完成');
        }

        // 钱包管理器已在 wallet.js 中自动初始化
        if (wallet) {
            logger.info('钱包模块加载完成');
        }
    }

    // 绑定全局事件
    bindEvents() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // 窗口关闭前确认
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        
        // 错误处理
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        
        // 点击空白处关闭弹窗
        document.addEventListener('click', (e) => this.handleGlobalClick(e));
    }

    // 处理键盘事件
    handleKeyboard(event) {
        // Ctrl+I 打开导入弹窗
        if (event.ctrlKey && event.key === 'i') {
            event.preventDefault();
            wallet.openImportModal();
        }
        
        // Ctrl+E 打开导出功能
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            wallet.exportWallets();
        }
        
        // ESC 关闭弹窗
        if (event.key === 'Escape') {
            this.closeAllModals();
        }
        
        // Delete 删除选中钱包
        if (event.key === 'Delete' && wallet.selectedWallets.size > 0) {
            event.preventDefault();
            wallet.deleteSelected();
        }
    }

    // 处理页面关闭前事件
    handleBeforeUnload(event) {
        // 如果有未保存的数据，提示用户
        if (wallet && wallet.wallets.length > 0) {
            const message = '确定要离开吗？请确保已备份重要数据。';
            event.returnValue = message;
            return message;
        }
    }

    // 处理全局错误
    handleGlobalError(event) {
        console.error('全局错误:', event.error);
        
        if (logger) {
            logger.error('程序运行错误', event.error.message);
        }
        
        // 可以在这里添加错误上报逻辑
    }

    // 处理全局点击事件
    handleGlobalClick(event) {
        // 点击弹窗外部区域关闭弹窗
        if (event.target.classList.contains('modal-overlay')) {
            event.target.classList.remove('active');
        }
    }

    // 关闭所有弹窗
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // 显示启动信息
    showStartupInfo() {
        const stats = {
            wallets: wallet ? wallet.wallets.length : 0,
            network: network ? network.getCurrentNetwork().name : '未知',
            version: this.version
        };

        logger.info('系统状态', `钱包: ${stats.wallets}个, 网络: ${stats.network}`);
        
        // 显示版本信息
        console.log(`
        ╔══════════════════════════════════════╗
        ║        钱包管理工具 v${this.version}           ║
        ║                                      ║
        ║  🏦 钱包数量: ${stats.wallets.toString().padEnd(20)} ║
        ║  🌐 当前网络: ${stats.network.padEnd(18)} ║
        ║  📅 启动时间: ${new Date().toLocaleString().padEnd(18)} ║
        ╚══════════════════════════════════════╝
        `);
    }

    // 显示错误信息
    showError(title, message) {
        const errorHtml = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 2000;
                max-width: 400px;
            ">
                <h3 style="color: #e74c3c; margin-bottom: 10px;">❌ ${title}</h3>
                <p style="color: #666; margin-bottom: 15px;">${message}</p>
                <button onclick="this.parentElement.remove()" 
                        style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    确定
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHtml);
    }

    // 获取系统状态
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            version: this.version,
            walletCount: wallet ? wallet.wallets.length : 0,
            selectedCount: wallet ? wallet.selectedWallets.size : 0,
            currentNetwork: network ? network.getCurrentNetwork().name : '未知',
            logCount: logger ? logger.logs.length : 0
        };
    }

    // 导出数据（用于调试）
    exportDebugInfo() {
        const debugInfo = {
            timestamp: new Date().toISOString(),
            version: this.version,
            status: this.getSystemStatus(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            localStorage: {
                wallets: localStorage.getItem('wallet_manager_wallets') ? 'exists' : 'empty',
                logs: localStorage.getItem('wallet_manager_logs') ? 'exists' : 'empty',
                customRpcs: localStorage.getItem('wallet_manager_custom_rpcs') ? 'exists' : 'empty'
            }
        };

        console.log('调试信息:', debugInfo);
        return debugInfo;
    }
}

// 全局工具函数
window.utils = {
    // 格式化地址显示
    formatAddress: (address, start = 6, end = 4) => {
        if (!address || address.length < start + end) return address;
        return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
    },

    // 格式化余额显示
    formatBalance: (balance, decimals = 4) => {
        const num = parseFloat(balance);
        return isNaN(num) ? balance : num.toFixed(decimals);
    },

    // 复制到剪贴板
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    },

    // 延迟函数
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // 节流函数
    throttle: (func, delay) => {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
};

// 启动应用程序
const app = new MainApp();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainApp;
}
