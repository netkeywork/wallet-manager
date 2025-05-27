
// 日志系统模块
class Logger {
    constructor() {
        this.logs = [];
        this.currentTab = 'all';
        this.counts = {
            all: 0,
            success: 0,
            error: 0
        };
        this.init();
    }

    // 初始化日志系统
    init() {
        this.loadLogs();
        this.updateCounts();
        this.renderLogs();
        console.log('日志系统初始化完成');
    }

    // 添加日志
    addLog(type, message, details = '') {
        const timestamp = new Date().toLocaleString('zh-CN');
        const logEntry = {
            id: Date.now(),
            type: type, // 'success', 'error', 'info'
            message: message,
            details: details,
            timestamp: timestamp
        };

        this.logs.unshift(logEntry); // 新日志添加到顶部
        
        // 限制日志数量，最多保存500条
        if (this.logs.length > 500) {
            this.logs = this.logs.slice(0, 500);
        }

        this.saveLogs();
        this.updateCounts();
        this.renderLogs();
        
        console.log(`[日志] ${type.toUpperCase()}: ${message}`);
        return logEntry.id;
    }

    // 成功日志
    success(message, details = '') {
        return this.addLog('success', message, details);
    }

    // 错误日志
    error(message, details = '') {
        return this.addLog('error', message, details);
    }

    // 信息日志
    info(message, details = '') {
        return this.addLog('info', message, details);
    }

    // 切换标签页
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 更新标签页样式
        document.querySelectorAll('.log-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
        
        this.renderLogs();
    }

    // 更新统计数量
    updateCounts() {
        this.counts.all = this.logs.length;
        this.counts.success = this.logs.filter(log => log.type === 'success').length;
        this.counts.error = this.logs.filter(log => log.type === 'error').length;

        // 更新界面显示
        document.getElementById('countAll').textContent = this.counts.all;
        document.getElementById('countSuccess').textContent = this.counts.success;
        document.getElementById('countError').textContent = this.counts.error;
    }

    // 渲染日志内容
    renderLogs() {
        const container = document.getElementById('logContent');
        if (!container) return;

        let filteredLogs = this.logs;
        
        // 根据当前标签页过滤日志
        if (this.currentTab !== 'all') {
            filteredLogs = this.logs.filter(log => log.type === this.currentTab);
        }

        if (filteredLogs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #6c757d; padding: 20px;">
                    <p>暂无${this.getTabName()}日志</p>
                </div>
            `;
            return;
        }

        const logsHtml = filteredLogs.map(log => `
            <div class="log-item ${log.type}" title="${log.details}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <strong>${this.getTypeIcon(log.type)} ${log.message}</strong>
                        ${log.details ? `<div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">${log.details}</div>` : ''}
                    </div>
                    <small style="color: #6c757d; font-size: 11px; white-space: nowrap; margin-left: 8px;">
                        ${log.timestamp}
                    </small>
                </div>
            </div>
        `).join('');

        container.innerHTML = logsHtml;
        
        // 滚动到顶部显示最新日志
        container.scrollTop = 0;
    }

    // 获取标签页名称
    getTabName() {
        const names = {
            all: '所有',
            success: '成功',
            error: '失败'
        };
        return names[this.currentTab] || '所有';
    }

    // 获取类型图标
    getTypeIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    // 清空日志
    clearLogs() {
        if (confirm('确定要清空所有日志吗？此操作不可恢复。')) {
            this.logs = [];
            this.saveLogs();
            this.updateCounts();
            this.renderLogs();
            this.info('日志已清空');
        }
    }

    // 保存日志到localStorage
    saveLogs() {
        try {
            localStorage.setItem('wallet_manager_logs', JSON.stringify(this.logs));
        } catch (error) {
            console.error('保存日志失败:', error);
        }
    }

    // 从localStorage加载日志
    loadLogs() {
        try {
            const savedLogs = localStorage.getItem('wallet_manager_logs');
            if (savedLogs) {
                this.logs = JSON.parse(savedLogs);
                console.log(`加载了 ${this.logs.length} 条历史日志`);
            }
        } catch (error) {
            console.error('加载日志失败:', error);
            this.logs = [];
        }
    }

    // 导出日志
    exportLogs() {
        try {
            const exportData = {
                exportTime: new Date().toLocaleString('zh-CN'),
                totalLogs: this.logs.length,
                logs: this.logs
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `wallet_logs_${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            
            this.success('日志导出成功', `导出了 ${this.logs.length} 条日志`);
        } catch (error) {
            this.error('导出日志失败', error.message);
        }
    }

    // 获取日志统计信息
    getStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayLogs = this.logs.filter(log => new Date(log.timestamp) >= today);
        
        return {
            total: this.logs.length,
            success: this.counts.success,
            error: this.counts.error,
            today: todayLogs.length,
            todaySuccess: todayLogs.filter(log => log.type === 'success').length,
            todayError: todayLogs.filter(log => log.type === 'error').length
        };
    }
}

// 创建全局日志实例
const logger = new Logger();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
