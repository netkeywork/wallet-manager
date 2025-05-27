// 网络配置和RPC智能识别模块 - 完整版第一段
class NetworkManager {
    constructor() {
        this.networks = {
            ethereum: {
                name: 'Ethereum Mainnet',
                rpc: 'https://mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 1,
                symbol: 'ETH',
                explorer: 'https://etherscan.io',
                backupRpcs: [
                    'https://ethereum-rpc.publicnode.com',
                    'https://cloudflare-eth.com',
                    'https://rpc.ankr.com/eth'
                ]
            },
            bsc: {
                name: 'BSC (BNB Chain)',
                rpc: 'https://bsc-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 56,
                symbol: 'BNB',
                explorer: 'https://bscscan.com',
                backupRpcs: [
                    'https://bsc-dataseed1.bnbchain.org',
                    'https://bsc-rpc.publicnode.com',
                    'https://rpc.ankr.com/bsc'
                ]
            },
            arbitrum: {
                name: 'Arbitrum One',
                rpc: 'https://arbitrum-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 42161,
                symbol: 'ETH',
                explorer: 'https://arbiscan.io',
                backupRpcs: [
                    'https://arbitrum-one-rpc.publicnode.com',
                    'https://arb1.arbitrum.io/rpc',
                    'https://rpc.ankr.com/arbitrum'
                ]
            },
            optimism: {
                name: 'Optimism',
                rpc: 'https://optimism-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 10,
                symbol: 'ETH',
                explorer: 'https://optimistic.etherscan.io',
                backupRpcs: [
                    'https://optimism-rpc.publicnode.com',
                    'https://mainnet.optimism.io',
                    'https://rpc.ankr.com/optimism'
                ]
            },
            linea: {
                name: 'Linea',
                rpc: 'https://linea-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 59144,
                symbol: 'ETH',
                explorer: 'https://lineascan.build',
                backupRpcs: [
                    'https://rpc.linea.build',
                    'https://1rpc.io/linea'
                ]
            },
            polygon: {
                name: 'Polygon',
                rpc: 'https://polygon-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 137,
                symbol: 'MATIC',
                explorer: 'https://polygonscan.com',
                backupRpcs: [
                    'https://polygon-bor-rpc.publicnode.com',
                    'https://polygon-rpc.com',
                    'https://rpc.ankr.com/polygon'
                ]
            },
            base: {
                name: 'Base',
                rpc: 'https://base-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 8453,
                symbol: 'ETH',
                explorer: 'https://basescan.org',
                backupRpcs: [
                    'https://mainnet.base.org',
                    'https://base-rpc.publicnode.com'
                ]
            },
            avalanche: {
                name: 'Avalanche',
                rpc: 'https://avalanche-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 43114,
                symbol: 'AVAX',
                explorer: 'https://snowtrace.io',
                backupRpcs: [
                    'https://avalanche-c-chain-rpc.publicnode.com',
                    'https://api.avax.network/ext/bc/C/rpc',
                    'https://rpc.ankr.com/avalanche'
                ]
            },
            zksync: {
                name: 'zkSync Era',
                rpc: 'https://zksync-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 324,
                symbol: 'ETH',
                explorer: 'https://explorer.zksync.io',
                backupRpcs: [
                    'https://mainnet.era.zksync.io',
                    'https://zksync2-mainnet.zksync.io'
                ]
            },
            scroll: {
                name: 'Scroll',
                rpc: 'https://scroll-mainnet.infura.io/v3/e3e73805c958403d81c5f3bf46e54946',
                chainId: 534352,
                symbol: 'ETH',
                explorer: 'https://scrollscan.com',
                backupRpcs: [
                    'https://rpc.scroll.io',
                    'https://scroll-mainnet.public.blastapi.io'
                ]
            },
            solana: {
                name: 'Solana',
                rpc: 'https://api.mainnet-beta.solana.com',
                chainId: 101,
                symbol: 'SOL',
                explorer: 'https://solscan.io',
                backupRpcs: [
                    'https://solana-api.projectserum.com',
                    'https://rpc.ankr.com/solana'
                ]
            }
        };
        
        this.currentNetwork = 'ethereum';
        this.customRpcs = {};
        this.rpcCache = new Map();
        this.init();
    }

    // 初始化网络管理器
    init() {
        this.loadCustomRpcs();
        this.updateNetworkStatus();
        logger.info('网络管理器初始化完成');
    }
// network.js 第二段 - 基础功能方法

    // 网络切换事件
    onNetworkChange() {
        const networkSelect = document.getElementById('networkSelect');
        const selectedNetwork = networkSelect.value;
        
        if (selectedNetwork === 'custom') {
            this.openRpcModal();
            return;
        }
        
        this.currentNetwork = selectedNetwork;
        this.updateNetworkStatus();
        logger.info(`切换到网络: ${this.networks[selectedNetwork].name}`);
    }

    // 更新网络状态显示
    updateNetworkStatus() {
        const statusDot = document.getElementById('rpcStatusDot');
        const rpcInfo = document.getElementById('currentRpcInfo');
        const rpcDetails = document.getElementById('rpcDetails');
        
        if (!statusDot || !rpcInfo || !rpcDetails) return;
        
        const network = this.networks[this.currentNetwork];
        if (network) {
            statusDot.className = 'status-dot connected';
            rpcInfo.textContent = network.name;
            rpcDetails.textContent = `Chain ID: ${network.chainId} | ${network.symbol}`;
        }
    }

    // 打开RPC配置弹窗
    openRpcModal() {
        const modal = document.getElementById('rpcModal');
        if (modal) {
            modal.classList.add('active');
            this.clearRpcForm();
            // 默认显示添加RPC标签页
            this.switchRpcTab('add');
        }
    }

    // 关闭RPC配置弹窗
    closeRpcModal() {
        const modal = document.getElementById('rpcModal');
        const networkSelect = document.getElementById('networkSelect');
        
        if (modal) {
            modal.classList.remove('active');
        }
        
        // 如果用户取消了自定义RPC，恢复到之前的网络选择
        if (networkSelect && networkSelect.value === 'custom') {
            networkSelect.value = this.currentNetwork;
        }
    }

    // 获取当前网络信息
    getCurrentNetwork() {
        return this.networks[this.currentNetwork];
    }

    // 获取当前RPC URL
    getCurrentRpc() {
        const network = this.getCurrentNetwork();
        return network ? network.rpc : null;
    }

    // 根据Chain ID获取网络信息
    getNetworkByChainId(chainId) {
        const networkMap = {
            1: { name: 'Ethereum Mainnet', symbol: 'ETH' },
            56: { name: 'BSC (BNB Chain)', symbol: 'BNB' },
            137: { name: 'Polygon', symbol: 'MATIC' },
            42161: { name: 'Arbitrum One', symbol: 'ETH' },
            10: { name: 'Optimism', symbol: 'ETH' },
            59144: { name: 'Linea', symbol: 'ETH' },
            43114: { name: 'Avalanche', symbol: 'AVAX' },
            8453: { name: 'Base', symbol: 'ETH' },  // 修复Base网络识别
            324: { name: 'zkSync Era', symbol: 'ETH' },
            534352: { name: 'Scroll', symbol: 'ETH' },
            250: { name: 'Fantom', symbol: 'FTM' },
            25: { name: 'Cronos', symbol: 'CRO' },
            100: { name: 'Gnosis Chain', symbol: 'xDAI' },
            // 测试网络
            5: { name: 'Goerli Testnet', symbol: 'ETH' },
            11155111: { name: 'Sepolia Testnet', symbol: 'ETH' },
            97: { name: 'BSC Testnet', symbol: 'tBNB' },
            80001: { name: 'Mumbai Testnet', symbol: 'MATIC' }
        };
        
        return networkMap[chainId] || null;
    }

    // 测试RPC连接
    async testRpcConnection(rpcUrl, timeout = 3000) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
// network.js 第三段 - RPC标签页管理

    // RPC标签页切换
    switchRpcTab(tabName) {
        // 更新标签页样式
        document.querySelectorAll('.rpc-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}RpcTab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // 显示对应内容
        document.querySelectorAll('.rpc-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const targetContent = document.getElementById(`${tabName}RpcContent`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }
        
        // 根据标签页执行相应操作
        if (tabName === 'manage') {
            this.renderCustomRpcList();
        } else if (tabName === 'test') {
            this.renderNetworkTestResults();
        }
    }

    // 渲染自定义RPC列表
    renderCustomRpcList() {
        const container = document.getElementById('customRpcList');
        if (!container) return;

        const customRpcs = Object.entries(this.customRpcs);
        
        if (customRpcs.length === 0) {
            container.innerHTML = `
                <div class="empty-rpc-list">
                    <p>📡 暂无自定义RPC</p>
                    <p>点击"添加RPC"标签页开始添加</p>
                </div>
            `;
            return;
        }

        const rpcItems = customRpcs.map(([id, rpc]) => `
            <div class="rpc-item" data-rpc-id="${id}">
                <div class="rpc-item-info">
                    <div class="rpc-item-name">
                        <span>🔧 ${rpc.name}</span>
                        <span class="latency-badge latency-error" id="latency-${id}">测试中...</span>
                    </div>
                    <div class="rpc-item-url">${rpc.rpc}</div>
                    <div class="rpc-item-details">
                        <span>Chain ID: ${rpc.chainId}</span>
                        <span>Symbol: ${rpc.symbol}</span>
                        <span>添加时间: ${rpc.createTime || '未知'}</span>
                    </div>
                </div>
                <div class="rpc-item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="network.testSingleRpc('${id}')" title="测试连接">
                        🧪 测试
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="network.confirmDeleteRpc('${id}', '${rpc.name}')" title="删除RPC">
                        🗑️ 删除
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = rpcItems;
        
        // 自动测试所有自定义RPC的延迟
        this.testCustomRpcsLatency();
    }

    // 刷新RPC列表
    refreshRpcList() {
        this.renderCustomRpcList();
        logger.info('RPC列表已刷新');
    }

    // 渲染网络测试结果（初始状态）
    renderNetworkTestResults() {
        const resultsContainer = document.getElementById('networkTestResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="test-placeholder">
                <p>🚀 点击"测试所有网络"开始检测延迟</p>
                <p style="font-size: 14px; color: #6c757d;">将测试所有预设网络的连接速度</p>
            </div>
        `;
    }

    // 获取延迟等级样式
    getLatencyClass(latency) {
        if (latency < 200) return 'latency-excellent';
        if (latency < 500) return 'latency-good';
        if (latency < 1000) return 'latency-poor';
        return 'latency-error';
    }

    // 获取网络图标
    getNetworkIcon(networkKey) {
        const icons = {
            ethereum: 'ETH',
            bsc: 'BSC',
            arbitrum: 'ARB',
            optimism: 'OP',
            polygon: 'POL',
            avalanche: 'AVAX',
            base: 'BASE',
            linea: 'LINEA',
            zksync: 'ZKS',
            scroll: 'SCR',
            solana: 'SOL'
        };
        return icons[networkKey] || '?';
    }

    // 辅助函数：延迟
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
// network.js 第四段 - 测试和删除功能

    // 测试单个RPC延迟
    async testSingleRpc(rpcId) {
        const rpc = this.customRpcs[rpcId] || this.networks[rpcId];
        if (!rpc) return;

        const latencyBadge = document.getElementById(`latency-${rpcId}`);
        if (latencyBadge) {
            latencyBadge.textContent = '测试中...';
            latencyBadge.className = 'latency-badge latency-error';
        }

        try {
            const startTime = Date.now();
            const isConnected = await this.testRpcConnection(rpc.rpc, 5000);
            const latency = Date.now() - startTime;

            if (latencyBadge) {
                if (isConnected) {
                    latencyBadge.textContent = `${latency}ms`;
                    latencyBadge.className = `latency-badge ${this.getLatencyClass(latency)}`;
                } else {
                    latencyBadge.textContent = '连接失败';
                    latencyBadge.className = 'latency-badge latency-error';
                }
            }

            logger.info(`RPC测试完成: ${rpc.name}`, `延迟: ${latency}ms, 状态: ${isConnected ? '正常' : '异常'}`);
            
        } catch (error) {
            if (latencyBadge) {
                latencyBadge.textContent = '测试失败';
                latencyBadge.className = 'latency-badge latency-error';
            }
            logger.error(`RPC测试失败: ${rpc.name}`, error.message);
        }
    }

    // 测试所有自定义RPC延迟
    async testCustomRpcsLatency() {
        for (const rpcId of Object.keys(this.customRpcs)) {
            await this.testSingleRpc(rpcId);
            await this.sleep(100); // 避免请求过快
        }
    }

    // 测试所有网络
    async testAllNetworks() {
        const resultsContainer = document.getElementById('networkTestResults');
        if (!resultsContainer) return;

        // 显示测试中状态
        const networkKeys = Object.keys(this.networks).filter(key => !this.networks[key].isCustom);
        
        resultsContainer.innerHTML = networkKeys.map(key => {
            const network = this.networks[key];
            return `
                <div class="network-test-item" id="test-item-${key}">
                    <div class="network-test-info">
                        <div class="network-icon ${key}">${this.getNetworkIcon(key)}</div>
                        <div class="network-test-name">${network.name}</div>
                    </div>
                    <div class="network-test-status">
                        <div class="testing-spinner"></div>
                        <span>测试中...</span>
                    </div>
                </div>
            `;
        }).join('');

        logger.info('开始测试所有网络延迟', '请稍候...');

        // 依次测试每个网络
        for (const key of networkKeys) {
            await this.testNetworkLatency(key);
            await this.sleep(200); // 避免请求过快
        }

        logger.success('网络延迟测试完成', '查看详细结果');
    }

    // 测试单个网络延迟
    async testNetworkLatency(networkKey) {
        const network = this.networks[networkKey];
        const testItem = document.getElementById(`test-item-${networkKey}`);
        
        if (!network || !testItem) return;

        try {
            // 测试主RPC
            const startTime = Date.now();
            const isMainRpcOk = await this.testRpcConnection(network.rpc, 5000);
            const mainLatency = Date.now() - startTime;

            let bestRpc = network.rpc;
            let bestLatency = mainLatency;
            let bestStatus = isMainRpcOk;

            // 如果主RPC失败，测试备用RPC
            if (!isMainRpcOk && network.backupRpcs && network.backupRpcs.length > 0) {
                for (const backupRpc of network.backupRpcs) {
                    const backupStartTime = Date.now();
                    const isBackupOk = await this.testRpcConnection(backupRpc, 3000);
                    const backupLatency = Date.now() - backupStartTime;
                    
                    if (isBackupOk && (!bestStatus || backupLatency < bestLatency)) {
                        bestRpc = backupRpc;
                        bestLatency = backupLatency;
                        bestStatus = true;
                        break;
                    }
                }
            }

            // 更新测试结果显示
            const statusElement = testItem.querySelector('.network-test-status');
            if (statusElement) {
                if (bestStatus) {
                    statusElement.innerHTML = `
                        <span class="latency-badge ${this.getLatencyClass(bestLatency)}">${bestLatency}ms</span>
                        <span style="color: #27ae60;">✅ 正常</span>
                    `;
                } else {
                    statusElement.innerHTML = `
                        <span class="latency-badge latency-error">超时</span>
                        <span style="color: #e74c3c;">❌ 异常</span>
                    `;
                }
            }

        } catch (error) {
            const statusElement = testItem.querySelector('.network-test-status');
            if (statusElement) {
                statusElement.innerHTML = `
                    <span class="latency-badge latency-error">错误</span>
                    <span style="color: #e74c3c;">❌ 失败</span>
                `;
            }
        }
    }

    // 确认删除RPC
    confirmDeleteRpc(rpcId, rpcName) {
        const confirmHtml = `
            <div class="delete-confirm-overlay" id="deleteConfirmOverlay">
                <div class="delete-confirm-modal">
                    <div class="delete-confirm-title">
                        🗑️ 确认删除
                    </div>
                    <div class="delete-confirm-content">
                        <p>确定要删除自定义RPC <strong>"${rpcName}"</strong> 吗？</p>
                        <p style="color: #e74c3c; font-size: 14px;">此操作不可恢复！</p>
                    </div>
                    <div class="delete-confirm-buttons">
                        <button class="btn btn-cancel" onclick="network.cancelDeleteRpc()">取消</button>
                        <button class="btn btn-danger" onclick="network.deleteCustomRpc('${rpcId}')">确认删除</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', confirmHtml);
    }

    // 取消删除RPC
    cancelDeleteRpc() {
        const overlay = document.getElementById('deleteConfirmOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // 删除自定义RPC
    deleteCustomRpc(rpcId) {
        // 关闭确认弹窗
        this.cancelDeleteRpc();
        
        const rpc = this.customRpcs[rpcId];
        if (!rpc) return;

        // 从存储中删除
        delete this.customRpcs[rpcId];
        delete this.networks[rpcId];
        
        // 从下拉框移除
        const networkSelect = document.getElementById('networkSelect');
        if (networkSelect) {
            const option = networkSelect.querySelector(`option[value="${rpcId}"]`);
            if (option) option.remove();
            
            // 如果当前网络是被删除的网络，切换到以太坊
            if (this.currentNetwork === rpcId) {
                networkSelect.value = 'ethereum';
                this.currentNetwork = 'ethereum';
                this.updateNetworkStatus();
            }
        }
        
        // 保存到本地存储
        this.saveCustomRpcs();
        
        // 刷新RPC列表
        this.renderCustomRpcList();
        
        logger.success(`自定义RPC删除成功: ${rpc.name}`);
    }
// network.js 第五段 - RPC智能识别

    // RPC URL 输入变化事件
    async onRpcUrlChange() {
        const urlInput = document.getElementById('customRpcUrl');
        const testBtn = document.getElementById('testRpcBtn');
        const saveBtn = document.getElementById('saveRpcBtn');
        
        if (!urlInput || !testBtn || !saveBtn) return;
        
        const url = urlInput.value.trim();
        
        // 重置按钮状态
        saveBtn.disabled = true;
        
        if (url.length < 10) {
            this.clearRpcForm();
            return;
        }
        
        // 自动识别网络类型
        const networkInfo = await this.identifyNetwork(url);
        if (networkInfo) {
            this.fillRpcForm(networkInfo);
        }
    }

    // 智能识别网络类型
    async identifyNetwork(rpcUrl) {
        try {
            this.showRpcTestResult('testing', '正在识别网络类型...');
            
            if (this.rpcCache.has(rpcUrl)) {
                const cached = this.rpcCache.get(rpcUrl);
                this.showRpcTestResult('success', `识别成功 (缓存): ${cached.name}`);
                return cached;
            }
            
            const networkInfo = await this.fetchNetworkInfo(rpcUrl);
            
            if (networkInfo) {
                this.rpcCache.set(rpcUrl, networkInfo);
                this.showRpcTestResult('success', `识别成功: ${networkInfo.name}`);
                return networkInfo;
            } else {
                this.showRpcTestResult('error', '无法识别网络类型，请手动配置');
                return null;
            }
            
        } catch (error) {
            console.error('网络识别失败:', error);
            this.showRpcTestResult('error', `识别失败: ${error.message}`);
            return null;
        }
    }

    // 获取网络信息
    async fetchNetworkInfo(rpcUrl) {
        try {
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_chainId',
                    params: [],
                    id: 1
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            const chainId = parseInt(data.result, 16);
            const networkInfo = this.getNetworkByChainId(chainId);
            
            if (networkInfo) {
                return {
                    ...networkInfo,
                    rpc: rpcUrl,
                    isCustom: true
                };
            } else {
                return {
                    name: `Unknown Network (${chainId})`,
                    chainId: chainId,
                    symbol: 'ETH',
                    rpc: rpcUrl,
                    isCustom: true
                };
            }
            
        } catch (error) {
            throw new Error(`RPC连接失败: ${error.message}`);
        }
    }

    // 测试RPC连接
    async testRpc() {
        const urlInput = document.getElementById('customRpcUrl');
        if (!urlInput || !urlInput.value.trim()) {
            this.showRpcTestResult('error', '请输入RPC URL');
            return;
        }
        
        const rpcUrl = urlInput.value.trim();
        
        try {
            this.showRpcTestResult('testing', '正在测试RPC连接...');
            
            const startTime = Date.now();
            const networkInfo = await this.fetchNetworkInfo(rpcUrl);
            const responseTime = Date.now() - startTime;
            
            if (networkInfo) {
                this.fillRpcForm(networkInfo);
                this.showRpcTestResult('success', 
                    `连接成功！网络: ${networkInfo.name}, 响应时间: ${responseTime}ms`);
            }
            
        } catch (error) {
            this.showRpcTestResult('error', `连接失败: ${error.message}`);
        }
    }
// network.js 第六段 - 表单处理和数据存储（最后一段）

    // 填充RPC表单
    fillRpcForm(networkInfo) {
        const nameInput = document.getElementById('customNetworkName');
        const chainIdInput = document.getElementById('customChainId');
        const symbolInput = document.getElementById('customSymbol');
        const saveBtn = document.getElementById('saveRpcBtn');
        
        if (nameInput) nameInput.value = networkInfo.name;
        if (chainIdInput) chainIdInput.value = networkInfo.chainId;
        if (symbolInput) symbolInput.value = networkInfo.symbol;
        if (saveBtn) saveBtn.disabled = false;
    }

    // 清空RPC表单
    clearRpcForm() {
        const inputs = ['customNetworkName', 'customChainId', 'customSymbol'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        const saveBtn = document.getElementById('saveRpcBtn');
        if (saveBtn) saveBtn.disabled = true;
        
        this.hideRpcTestResult();
    }

    // 保存自定义RPC
    saveCustomRpc() {
        const urlInput = document.getElementById('customRpcUrl');
        const nameInput = document.getElementById('customNetworkName');
        const chainIdInput = document.getElementById('customChainId');
        const symbolInput = document.getElementById('customSymbol');
        
        if (!urlInput || !nameInput || !chainIdInput || !symbolInput) return;
        
        const rpcUrl = urlInput.value.trim();
        const networkName = nameInput.value.trim();
        const chainId = parseInt(chainIdInput.value);
        const symbol = symbolInput.value.trim();
        
        if (!rpcUrl || !networkName || !chainId || !symbol) {
            this.showRpcTestResult('error', '请填写完整的网络信息');
            return;
        }
        
        // 生成自定义网络ID
        const customId = `custom_${chainId}`;
        
        // 保存到自定义RPC列表，添加创建时间
        this.customRpcs[customId] = {
            name: networkName,
            rpc: rpcUrl,
            chainId: chainId,
            symbol: symbol,
            isCustom: true,
            createTime: new Date().toLocaleString('zh-CN')
        };
        
        // 添加到网络列表
        this.networks[customId] = this.customRpcs[customId];
        
        // 更新网络选择下拉框
        this.updateNetworkSelect(customId, networkName);
        
        // 切换到新网络
        this.currentNetwork = customId;
        this.updateNetworkStatus();
        
        // 保存到本地存储
        this.saveCustomRpcs();
        
        // 关闭弹窗
        this.closeRpcModal();
        
        logger.success(`自定义RPC保存成功: ${networkName}`, `Chain ID: ${chainId}`);
    }

    // 更新网络选择下拉框
    updateNetworkSelect(networkId, networkName) {
        const networkSelect = document.getElementById('networkSelect');
        if (!networkSelect) return;
        
        // 检查是否已存在
        let existingOption = networkSelect.querySelector(`option[value="${networkId}"]`);
        if (existingOption) {
            existingOption.textContent = `🔧 ${networkName}`;
            networkSelect.value = networkId;
            return;
        }
        
        // 添加新选项（在自定义RPC选项之前）
        const customOption = networkSelect.querySelector('option[value="custom"]');
        if (customOption) {
            const newOption = document.createElement('option');
            newOption.value = networkId;
            newOption.textContent = `🔧 ${networkName}`;
            networkSelect.insertBefore(newOption, customOption);
            networkSelect.value = networkId;
        }
    }

    // 显示RPC测试结果
    showRpcTestResult(type, message) {
        const resultDiv = document.getElementById('rpcTestResult');
        if (!resultDiv) return;
        
        resultDiv.className = `rpc-test-result ${type}`;
        resultDiv.textContent = message;
        resultDiv.style.display = 'block';
    }

    // 隐藏RPC测试结果
    hideRpcTestResult() {
        const resultDiv = document.getElementById('rpcTestResult');
        if (resultDiv) {
            resultDiv.style.display = 'none';
        }
    }

    // 保存自定义RPC到本地存储
    saveCustomRpcs() {
        try {
            localStorage.setItem('wallet_manager_custom_rpcs', JSON.stringify(this.customRpcs));
        } catch (error) {
            console.error('保存自定义RPC失败:', error);
            logger.error('保存RPC配置失败', error.message);
        }
    }

    // 从本地存储加载自定义RPC
    loadCustomRpcs() {
        try {
            const saved = localStorage.getItem('wallet_manager_custom_rpcs');
            if (saved) {
                this.customRpcs = JSON.parse(saved);
                
                // 添加到网络列表并更新下拉框
                Object.keys(this.customRpcs).forEach(id => {
                    this.networks[id] = this.customRpcs[id];
                    this.updateNetworkSelect(id, this.customRpcs[id].name);
                });
                
                logger.info(`加载了 ${Object.keys(this.customRpcs).length} 个自定义RPC配置`);
            }
        } catch (error) {
            console.error('加载自定义RPC失败:', error);
            this.customRpcs = {};
        }
    }
}

// 创建全局网络管理器实例
const network = new NetworkManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkManager;
}
