// 钱包管理核心功能模块 - 第一段
class WalletManager {
    constructor() {
        this.wallets = [];
        this.selectedWallets = new Set();
        this.importMode = 'manual'; // 'manual' 或 'file'
        this.tempWallets = null;
        this.init();
    }

    // 初始化钱包管理器
    init() {
        this.loadWallets();
        this.renderWalletTable();
        this.updateDeleteButton();
        logger.info('钱包管理器初始化完成');
    }

    // 生成钱包地址（简化版，实际项目中应使用专业的加密库）
    generateAddress(privateKey) {
        // 这里简化处理，实际应用中需要使用 ethers.js 或 web3.js
        // 移除0x前缀
        const cleanPrivateKey = privateKey.replace('0x', '');
        
        // 简单验证私钥格式
        if (!/^[a-fA-F0-9]{64}$/.test(cleanPrivateKey)) {
            throw new Error('私钥格式不正确，应为64位十六进制字符');
        }
        
        // 模拟地址生成（实际应用中要用真正的椭圆曲线算法）
        const hash = this.simpleHash(cleanPrivateKey);
        return '0x' + hash.substring(0, 40);
    }

    // 简单哈希函数（仅用于演示）
    simpleHash(input) {
        let hash = 0;
        if (input.length === 0) return hash.toString(16).padStart(40, '0');
        
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        // 扩展到40位十六进制
        const hashStr = Math.abs(hash).toString(16);
        return hashStr.padStart(40, '0').substring(0, 40);
    }

    // 从私钥创建钱包对象
    createWalletFromPrivateKey(privateKey, label, note = '') {
        const address = this.generateAddress(privateKey);
        
        return {
            id: Date.now() + Math.random(),
            privateKey: privateKey,
            address: address,
            label: label,
            note: note,
            balance: '--',
            createTime: new Date().toLocaleString('zh-CN')
        };
    }
// 钱包导入功能 - 第二段

    // 打开导入弹窗
    openImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.classList.add('active');
            this.clearImportForm();
            this.switchImportTab('manual');
        }
    }

    // 关闭导入弹窗
    closeImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.classList.remove('active');
            this.clearImportForm();
        }
    }

    // 切换导入方式
    switchImportTab(mode) {
        this.importMode = mode;
        
        // 更新标签页样式
        document.querySelectorAll('.import-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 显示对应内容区域
        document.querySelectorAll('.import-content').forEach(content => {
            content.style.display = 'none';
        });
        
        if (mode === 'manual') {
            document.querySelector('.import-tab:first-child').classList.add('active');
            document.getElementById('manualImport').style.display = 'block';
        } else if (mode === 'file') {
            document.querySelector('.import-tab:last-child').classList.add('active');
            document.getElementById('fileImport').style.display = 'block';
        }
    }

    // 清空导入表单
    clearImportForm() {
        const inputs = ['privateKey', 'walletLabel', 'walletNote'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        const fileInput = document.getElementById('importFile');
        if (fileInput) fileInput.value = '';
        
        const preview = document.getElementById('filePreview');
        if (preview) preview.innerHTML = '';
        
        this.tempWallets = null;
    }

    // 导入钱包主方法
    async importWallet() {
        try {
            if (this.importMode === 'manual') {
                await this.importManualWallet();
            } else if (this.importMode === 'file') {
                await this.importFileWallets();
            }
        } catch (error) {
            logger.error('钱包导入失败', error.message);
            alert(`导入失败: ${error.message}`);
        }
    }

    // 手动导入钱包
    async importManualWallet() {
        const privateKeyInput = document.getElementById('privateKey');
        const labelInput = document.getElementById('walletLabel');
        const noteInput = document.getElementById('walletNote');
        
        if (!privateKeyInput) throw new Error('找不到私钥输入框');
        
        const privateKey = privateKeyInput.value.trim();
        const label = labelInput ? labelInput.value.trim() : '';
        const note = noteInput ? noteInput.value.trim() : '';
        
        if (!privateKey) {
            throw new Error('请输入私钥');
        }
        
        // 生成地址
        const address = this.generateAddress(privateKey);
        
        // 检查是否已存在
        if (this.wallets.some(w => w.address === address)) {
            throw new Error('该钱包地址已存在');
        }
        
        // 创建钱包对象
        const wallet = this.createWalletFromPrivateKey(
            privateKey,
            label || `钱包-${this.wallets.length + 1}`,
            note
        );
        
        // 添加到钱包列表
        this.wallets.push(wallet);
        this.saveWallets();
        this.renderWalletTable();
        
        logger.success('钱包导入成功', `地址: ${address.substring(0, 6)}...${address.substring(-4)}`);
        
        // 关闭弹窗
        this.closeImportModal();
    }

    // 文件导入钱包
    async importFileWallets() {
        if (!this.tempWallets || this.tempWallets.length === 0) {
            throw new Error('请先选择文件并确保文件格式正确');
        }
        
        let successCount = 0;
        let skipCount = 0;
        
        for (const walletData of this.tempWallets) {
            // 检查是否已存在
            if (this.wallets.some(w => w.address === walletData.address)) {
                skipCount++;
                continue;
            }
            
            this.wallets.push(walletData);
            successCount++;
        }
        
        this.saveWallets();
        this.renderWalletTable();
        
        logger.success(`批量导入完成`, `成功: ${successCount}, 跳过: ${skipCount}`);
        
        // 关闭弹窗
        this.closeImportModal();
    }
// 文件解析功能 - 第三段

    // 文件选择处理
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const preview = document.getElementById('filePreview');
        if (!preview) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const wallets = this.parseFileContent(file.name, content);
                
                preview.innerHTML = `
                    <div class="file-preview-content">
                        <h4>📄 文件预览</h4>
                        <p><strong>文件名:</strong> ${file.name}</p>
                        <p><strong>大小:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                        <p><strong>解析到钱包数量:</strong> ${wallets.length}</p>
                        <div class="wallet-preview">
                            ${wallets.slice(0, 3).map(w => `
                                <div>• ${w.label || '未命名'} - ${w.address.substring(0, 10)}...</div>
                            `).join('')}
                            ${wallets.length > 3 ? `<div>... 还有 ${wallets.length - 3} 个钱包</div>` : ''}
                        </div>
                    </div>
                `;
                
                // 临时存储解析结果
                this.tempWallets = wallets;
                
            } catch (error) {
                preview.innerHTML = `
                    <div class="file-preview-error">
                        <p>❌ 文件解析失败: ${error.message}</p>
                    </div>
                `;
                this.tempWallets = null;
            }
        };
        
        reader.readAsText(file);
    }

    // 解析文件内容
    parseFileContent(filename, content) {
        const extension = filename.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'json':
                return this.parseJsonFile(content);
            case 'txt':
                return this.parseTxtFile(content);
            case 'csv':
                return this.parseCsvFile(content);
            default:
                throw new Error('不支持的文件格式，请使用 JSON、TXT 或 CSV 文件');
        }
    }

    // 解析JSON文件
    parseJsonFile(content) {
        try {
            const data = JSON.parse(content);
            const wallets = Array.isArray(data) ? data : [data];
            
            return wallets.map((item, index) => {
                if (typeof item === 'string') {
                    // 纯私钥列表
                    return this.createWalletFromPrivateKey(item, `导入钱包-${index + 1}`);
                } else if (typeof item === 'object') {
                    // 完整钱包对象
                    const privateKey = item.privateKey || item.private_key || item.key;
                    if (!privateKey) throw new Error(`第${index + 1}个钱包缺少私钥`);
                    
                    return this.createWalletFromPrivateKey(
                        privateKey,
                        item.label || item.name || `导入钱包-${index + 1}`,
                        item.note || item.comment || ''
                    );
                }
                throw new Error(`第${index + 1}个钱包格式不正确`);
            });
        } catch (error) {
            throw new Error(`JSON文件解析失败: ${error.message}`);
        }
    }

    // 解析TXT文件
    parseTxtFile(content) {
        const lines = content.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#')); // 忽略空行和注释行
        
        return lines.map((line, index) => {
            const parts = line.split(',');
            const privateKey = parts[0].trim();
            const label = parts[1] ? parts[1].trim() : `导入钱包-${index + 1}`;
            const note = parts[2] ? parts[2].trim() : '';
            
            return this.createWalletFromPrivateKey(privateKey, label, note);
        });
    }

    // 解析CSV文件
    parseCsvFile(content) {
        const lines = content.split('\n')
            .map(line => line.trim())
            .filter(line => line);
        
        if (lines.length === 0) {
            throw new Error('CSV文件为空');
        }
        
        const wallets = [];
        
        // 检查是否有表头
        const firstLine = lines[0].toLowerCase();
        const hasHeader = firstLine.includes('private') || firstLine.includes('key') || 
                         firstLine.includes('address') || firstLine.includes('label');
        
        const startIndex = hasHeader ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
            const parts = lines[i].split(',').map(part => part.trim().replace(/"/g, ''));
            
            if (parts.length >= 1 && parts[0]) {
                const privateKey = parts[0];
                const label = parts[1] || `导入钱包-${i - startIndex + 1}`;
                const note = parts[2] || '';
                
                wallets.push(this.createWalletFromPrivateKey(privateKey, label, note));
            }
        }
        
        if (wallets.length === 0) {
            throw new Error('CSV文件中没有找到有效的钱包数据');
        }
        
        return wallets;
    }
// 表格渲染和选择功能 - 第四段

    // 渲染钱包表格
    renderWalletTable() {
        const tbody = document.getElementById('walletTableBody');
        if (!tbody) return;

        if (this.wallets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #6c757d; padding: 40px;">
                        <div>
                            <p style="font-size: 16px; margin-bottom: 8px;">🏦 暂无钱包</p>
                            <p style="font-size: 14px;">点击"钱包导入"开始添加钱包</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const rows = this.wallets.map((wallet, index) => {
            const isSelected = this.selectedWallets.has(wallet.id);
            return `
                <tr ${isSelected ? 'class="selected"' : ''}>
                    <td>
                        <input type="checkbox" class="checkbox wallet-checkbox" 
                               data-wallet-id="${wallet.id}" 
                               ${isSelected ? 'checked' : ''}
                               onchange="wallet.onWalletSelect(${wallet.id}, this.checked)">
                    </td>
                    <td>${index + 1}</td>
                    <td>
                        <span class="wallet-label" title="${wallet.label}">
                            ${wallet.label}
                        </span>
                    </td>
                    <td>
                        <span class="wallet-address" title="${wallet.address}">
                            ${wallet.address.substring(0, 6)}...${wallet.address.substring(-4)}
                        </span>
                        <button class="btn-copy" onclick="wallet.copyAddress('${wallet.address}')" title="复制地址">
                            📋
                        </button>
                    </td>
                    <td>
                        <span class="wallet-note" title="${wallet.note}">
                            ${wallet.note || '--'}
                        </span>
                    </td>
                    <td>
                        <span class="wallet-balance" id="balance-${wallet.id}">
                            ${wallet.balance}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="wallet.editWallet(${wallet.id})" title="编辑">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="wallet.deleteWallet(${wallet.id})" title="删除">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
        this.updateSelectAllCheckbox();
    }

    // 钱包选择事件
    onWalletSelect(walletId, isSelected) {
        if (isSelected) {
            this.selectedWallets.add(walletId);
        } else {
            this.selectedWallets.delete(walletId);
        }
        
        this.updateDeleteButton();
        this.updateSelectAllCheckbox();
        this.renderWalletTable(); // 重新渲染以更新选中样式
    }

    // 全选/取消全选
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        if (!selectAllCheckbox) return;

        const isSelectAll = selectAllCheckbox.checked;
        
        if (isSelectAll) {
            // 全选
            this.wallets.forEach(wallet => {
                this.selectedWallets.add(wallet.id);
            });
        } else {
            // 取消全选
            this.selectedWallets.clear();
        }
        
        this.updateDeleteButton();
        this.renderWalletTable();
    }

    // 更新全选复选框状态
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAll');
        if (!selectAllCheckbox) return;

        const totalWallets = this.wallets.length;
        const selectedCount = this.selectedWallets.size;

        if (selectedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedCount === totalWallets) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }

    // 更新删除按钮状态
    updateDeleteButton() {
        const deleteBtn = document.getElementById('deleteBtn');
        if (!deleteBtn) return;

        const selectedCount = this.selectedWallets.size;
        deleteBtn.disabled = selectedCount === 0;
        deleteBtn.textContent = selectedCount > 0 ? 
            `🗑️ 删除 (${selectedCount})` : '🗑️ 钱包删除';
    }

    // 复制地址到剪贴板
    async copyAddress(address) {
        try {
            await navigator.clipboard.writeText(address);
            logger.success('地址已复制', `${address.substring(0, 10)}...`);
            
            // 临时显示复制成功提示
            this.showTempMessage('✅ 已复制');
        } catch (error) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = address;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            logger.success('地址已复制', address);
            this.showTempMessage('✅ 已复制');
        }
    }

    // 显示临时消息
    showTempMessage(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            z-index: 1001;
            font-size: 14px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }
// 删除和导出功能 - 第五段

    // 删除选中的钱包
    deleteSelected() {
        if (this.selectedWallets.size === 0) return;

        const count = this.selectedWallets.size;
        if (!confirm(`确定要删除选中的 ${count} 个钱包吗？此操作不可恢复。`)) {
            return;
        }

        // 执行删除
        this.wallets = this.wallets.filter(wallet => !this.selectedWallets.has(wallet.id));
        this.selectedWallets.clear();
        
        this.saveWallets();
        this.renderWalletTable();
        this.updateDeleteButton();
        
        logger.success(`批量删除完成`, `已删除 ${count} 个钱包`);
    }

    // 删除单个钱包
    deleteWallet(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (!wallet) return;

        if (!confirm(`确定要删除钱包 "${wallet.label}" 吗？此操作不可恢复。`)) {
            return;
        }

        this.wallets = this.wallets.filter(w => w.id !== walletId);
        this.selectedWallets.delete(walletId);
        
        this.saveWallets();
        this.renderWalletTable();
        this.updateDeleteButton();
        
        logger.success('钱包删除成功', wallet.label);
    }

    // 清空所有钱包
    clearAll() {
        if (this.wallets.length === 0) return;

        if (!confirm(`确定要清空所有 ${this.wallets.length} 个钱包吗？此操作不可恢复。`)) {
            return;
        }

        const count = this.wallets.length;
        this.wallets = [];
        this.selectedWallets.clear();
        
        this.saveWallets();
        this.renderWalletTable();
        this.updateDeleteButton();
        
        logger.success('清空完成', `已删除 ${count} 个钱包`);
    }

    // 编辑钱包
    editWallet(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (!wallet) return;

        const newLabel = prompt('请输入新的标签名称:', wallet.label);
        if (newLabel === null) return; // 用户取消

        const newNote = prompt('请输入新的备注信息:', wallet.note);
        if (newNote === null) return; // 用户取消

        wallet.label = newLabel.trim() || wallet.label;
        wallet.note = newNote.trim();
        
        this.saveWallets();
        this.renderWalletTable();
        
        logger.success('钱包信息更新成功', wallet.label);
    }

    // 打开导出弹窗
    exportWallets() {
        if (this.wallets.length === 0) {
            alert('没有可导出的钱包');
            return;
        }

        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.add('active');
            
            // 更新导出范围选项
            const rangeSelect = document.getElementById('exportRange');
            if (rangeSelect && this.selectedWallets.size === 0) {
                rangeSelect.value = 'all';
                rangeSelect.querySelector('option[value="selected"]').disabled = true;
            } else if (rangeSelect) {
                rangeSelect.querySelector('option[value="selected"]').disabled = false;
            }
        }
    }

    // 关闭导出弹窗
    closeExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // 执行导出
    async doExport() {
        try {
            const rangeSelect = document.getElementById('exportRange');
            const formatSelect = document.getElementById('exportFormat');
            const encryptCheck = document.getElementById('encryptExport');
            const passwordInput = document.getElementById('exportPassword');

            const range = rangeSelect ? rangeSelect.value : 'all';
            const format = formatSelect ? formatSelect.value : 'json';
            const encrypt = encryptCheck ? encryptCheck.checked : false;
            const password = passwordInput ? passwordInput.value : '';

            if (encrypt && !password) {
                alert('请设置导出密码');
                return;
            }

            // 确定要导出的钱包
            let walletsToExport;
            if (range === 'selected' && this.selectedWallets.size > 0) {
                walletsToExport = this.wallets.filter(w => this.selectedWallets.has(w.id));
            } else {
                walletsToExport = this.wallets;
            }

            if (walletsToExport.length === 0) {
                alert('没有可导出的钱包');
                return;
            }

            // 执行导出
            await this.performExport(walletsToExport, format, encrypt, password);
            
            this.closeExportModal();
            logger.success('钱包导出成功', `导出了 ${walletsToExport.length} 个钱包`);

        } catch (error) {
            logger.error('导出失败', error.message);
            alert(`导出失败: ${error.message}`);
        }
    }

    // 执行导出操作
    async performExport(wallets, format, encrypt, password) {
        let content;
        let filename;
        let mimeType;

        const timestamp = new Date().toISOString().slice(0, 10);

        switch (format) {
            case 'json':
                content = JSON.stringify(wallets, null, 2);
                filename = `wallets_${timestamp}.json`;
                mimeType = 'application/json';
                break;
                
            case 'csv':
                content = this.generateCsvContent(wallets);
                filename = `wallets_${timestamp}.csv`;
                mimeType = 'text/csv';
                break;
                
            case 'txt':
                content = this.generateTxtContent(wallets);
                filename = `wallets_${timestamp}.txt`;
                mimeType = 'text/plain';
                break;
                
            default:
                throw new Error('不支持的导出格式');
        }

        // 如果需要加密
        if (encrypt) {
            content = this.encryptContent(content, password);
            filename = filename.replace(/\.(json|csv|txt)$/, '.encrypted.$1');
        }

        // 下载文件
        this.downloadFile(content, filename, mimeType);
    }

    // 生成CSV内容
    generateCsvContent(wallets) {
        const headers = ['privateKey', 'address', 'label', 'note', 'balance', 'createTime'];
        const csvContent = [
            headers.join(','),
            ...wallets.map(wallet => [
                `"${wallet.privateKey}"`,
                `"${wallet.address}"`,
                `"${wallet.label}"`,
                `"${wallet.note}"`,
                `"${wallet.balance}"`,
                `"${wallet.createTime}"`
            ].join(','))
        ].join('\n');
        
        return csvContent;
    }

    // 生成TXT内容
    generateTxtContent(wallets) {
        return wallets.map(wallet => 
            `${wallet.privateKey},${wallet.label},${wallet.note}`
        ).join('\n');
    }

    // 简单加密（实际应用中应使用更强的加密算法）
    encryptContent(content, password) {
        // 这里使用简单的异或加密，实际应用中应使用AES等
        const encrypted = btoa(content.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) ^ password.charCodeAt(i % password.length))
        ).join(''));
        
        return JSON.stringify({
            encrypted: true,
            data: encrypted,
            timestamp: new Date().toISOString()
        }, null, 2);
    }

    // 下载文件
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }
// 余额查询和数据存储功能 - 第六段

    // 查询钱包余额
    async queryBalances() {
        if (this.wallets.length === 0) {
            alert('请先导入钱包');
            return;
        }

        const currentNetwork = network.getCurrentNetwork();
        if (!currentNetwork) {
            alert('请先选择网络');
            return;
        }

        logger.info('开始查询余额', `网络: ${currentNetwork.name}`);
        
        // 更新按钮状态
        const queryBtn = document.querySelector('button[onclick="wallet.queryBalances()"]');
        if (queryBtn) {
            queryBtn.disabled = true;
            queryBtn.innerHTML = '⏳ 查询中...';
        }

        let successCount = 0;
        let totalBalance = 0;

        try {
            // 批量查询余额
            for (const wallet of this.wallets) {
                try {
                    const balance = await this.getWalletBalance(wallet.address, currentNetwork);
                    wallet.balance = balance;
                    totalBalance += parseFloat(balance) || 0;
                    successCount++;
                    
                    // 更新单个钱包的余额显示
                    const balanceElement = document.getElementById(`balance-${wallet.id}`);
                    if (balanceElement) {
                        balanceElement.textContent = balance;
                    }
                    
                    // 短暂延迟避免请求过快
                    await this.sleep(200);
                    
                } catch (error) {
                    console.error(`查询钱包 ${wallet.address} 余额失败:`, error);
                    wallet.balance = '查询失败';
                    
                    const balanceElement = document.getElementById(`balance-${wallet.id}`);
                    if (balanceElement) {
                        balanceElement.textContent = '查询失败';
                        balanceElement.style.color = '#e74c3c';
                    }
                }
            }

            // 更新总余额显示
            const totalBalanceElement = document.getElementById('totalBalance');
            if (totalBalanceElement) {
                totalBalanceElement.textContent = `总计: ${totalBalance.toFixed(4)} ${currentNetwork.symbol}`;
            }

            this.saveWallets();
            logger.success('余额查询完成', `成功: ${successCount}/${this.wallets.length}个钱包`);

        } catch (error) {
            logger.error('余额查询失败', error.message);
        } finally {
            // 恢复按钮状态
            if (queryBtn) {
                queryBtn.disabled = false;
                queryBtn.innerHTML = '💰 余额查询';
            }
        }
    }

    // 获取单个钱包余额
    async getWalletBalance(address, networkInfo) {
        const rpcUrl = networkInfo.rpc;
        
        try {
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_getBalance',
                    params: [address, 'latest'],
                    id: 1
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            // 转换Wei到Ether（简化版本）
            const balanceWei = parseInt(data.result, 16);
            const balanceEth = balanceWei / Math.pow(10, 18);
            
            return balanceEth.toFixed(6);
            
        } catch (error) {
            throw new Error(`RPC请求失败: ${error.message}`);
        }
    }

    // 延迟函数
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 保存钱包到本地存储
    saveWallets() {
        try {
            // 加密敏感信息
            const walletsToSave = this.wallets.map(wallet => ({
                ...wallet,
                privateKey: this.encryptPrivateKey(wallet.privateKey)
            }));
            
            localStorage.setItem('wallet_manager_wallets', JSON.stringify(walletsToSave));
        } catch (error) {
            console.error('保存钱包失败:', error);
            logger.error('保存钱包失败', error.message);
        }
    }

    // 从本地存储加载钱包
    loadWallets() {
        try {
            const saved = localStorage.getItem('wallet_manager_wallets');
            if (saved) {
                const walletsData = JSON.parse(saved);
                
                // 解密敏感信息
                this.wallets = walletsData.map(wallet => ({
                    ...wallet,
                    privateKey: this.decryptPrivateKey(wallet.privateKey)
                }));
                
                logger.info(`加载了 ${this.wallets.length} 个钱包`);
            }
        } catch (error) {
            console.error('加载钱包失败:', error);
            this.wallets = [];
            logger.error('加载钱包数据失败', '将从空白状态开始');
        }
    }

    // 简单加密私钥（实际应用中应使用更强的加密）
    encryptPrivateKey(privateKey) {
        // 简单的Base64编码（实际应用中应使用AES等强加密）
        return btoa(privateKey);
    }

    // 简单解密私钥
    decryptPrivateKey(encryptedKey) {
        try {
            return atob(encryptedKey);
        } catch (error) {
            // 如果解密失败，可能是旧版本的未加密数据
            return encryptedKey;
        }
    }

    // 获取钱包统计信息
    getWalletStats() {
        const totalWallets = this.wallets.length;
        const walletsWithBalance = this.wallets.filter(w => 
            w.balance && w.balance !== '--' && w.balance !== '查询失败'
        ).length;
        
        const totalBalance = this.wallets.reduce((sum, wallet) => {
            const balance = parseFloat(wallet.balance) || 0;
            return sum + balance;
        }, 0);

        return {
            totalWallets,
            walletsWithBalance,
            totalBalance: totalBalance.toFixed(6),
            selectedCount: this.selectedWallets.size
        };
    }

    // 搜索钱包
    searchWallets(keyword) {
        if (!keyword) {
            this.renderWalletTable();
            return;
        }

        const filteredWallets = this.wallets.filter(wallet =>
            wallet.label.toLowerCase().includes(keyword.toLowerCase()) ||
            wallet.address.toLowerCase().includes(keyword.toLowerCase()) ||
            wallet.note.toLowerCase().includes(keyword.toLowerCase())
        );

        // 临时替换钱包列表进行渲染
        const originalWallets = this.wallets;
        this.wallets = filteredWallets;
        this.renderWalletTable();
        this.wallets = originalWallets;
    }
}

// 创建全局钱包管理器实例
const wallet = new WalletManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WalletManager;
}
