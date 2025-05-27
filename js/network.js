// 网络配置和RPC智能识别模块 - 完整版
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

    // 获取当前RPC URL（带备用功能）
    async getCurrentRpcWithFallback() {
        const network = this.getCurrentNetwork();
        if (!network) return null;

        // 先尝试主RPC
        if (await this.testRpcConnection(network.rpc)) {
            return network.rpc;
        }

        // 如果主RPC失败，尝试备用RPC
        if (network.backupRpcs && network.backupRpcs.length > 0) {
            logger.info('主RPC连接失败，尝试备用RPC', network.name);
            
            for (const backupRpc of network.backupRpcs) {
                if (await this.testRpcConnection(backupRpc)) {
                    logger.success('备用RPC连接成功', backupRpc);
                    return backupRpc;
                }
            }
        }

        logger.error('所有RPC连接失败', network.name);
        return network.rpc; // 返回主RPC作为最后尝试
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

    // 打开RPC配置弹窗
    openRpcModal() {
        const modal = document.getElementById('rpcModal');
        if (modal) {
            modal.classList.add('active');
            this.clearRpcForm();
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
            // 清除测试结果
            this.showRpcTestResult('testing', '正在识别网络类型...');
            
            // 检查缓存
            if (this.rpcCache.has(rpcUrl)) {
                const cached = this.rpcCache.get(rpcUrl);
                this.showRpcTestResult('success', `识别成功 (缓存): ${cached.name}`);
                return cached;
            }
            
            // 发起RPC请求获取网络信息
            const networkInfo = await this.fetchNetworkInfo(rpcUrl);
            
            if (networkInfo) {
                // 缓存结果
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
            // 构造RPC请求
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                // 未知网络，返回基本信息
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
            8453: { name: 'Base', symbol: 'ETH' },
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
        
        // 保存到自定义RPC列表
        this.customRpcs[customId] = {
            name: networkName,
            rpc: rpcUrl,
            chainId: chainId,
            symbol: symbol,
            isCustom: true
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

    // 删除自定义RPC
    removeCustomRpc(networkId) {
        if (this.customRpcs[networkId]) {
            delete this.customRpcs[networkId];
            delete this.networks[networkId];
            
            // 从下拉框移除
            const networkSelect = document.getElementById('networkSelect');
            if (networkSelect) {
                const option = networkSelect.querySelector(`option[value="${networkId}"]`);
                if (option) option.remove();
                
                // 如果当前网络是被删除的网络，切换到以太坊
                if (this.currentNetwork === networkId) {
                    networkSelect.value = 'ethereum';
                    this.currentNetwork = 'ethereum';
                    this.updateNetworkStatus();
                }
            }
            
            this.saveCustomRpcs();
            logger.info(`删除自定义RPC: ${networkId}`);
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

    // 检查所有网络的RPC状态
    async checkAllNetworksStatus() {
        logger.info('开始检查网络状态', '检查所有预设网络的RPC连接');
        
        const results = {};
        
        for (const [key, networkInfo] of Object.entries(this.networks)) {
            if (networkInfo.isCustom) continue; // 跳过自定义网络
            
            const isMainRpcOk = await this.testRpcConnection(networkInfo.rpc);
            results[key] = {
                name: networkInfo.name,
                mainRpc: isMainRpcOk ? '✅ 正常' : '❌ 异常',
                rpcUrl: networkInfo.rpc
            };
            
            if (!isMainRpcOk && networkInfo.backupRpcs) {
                // 测试备用RPC
                for (let i = 0; i < networkInfo.backupRpcs.length; i++) {
                    const backupRpc = networkInfo.backupRpcs[i];
                    const isBackupOk = await this.testRpcConnection(backupRpc);
                    results[key][`backup${i + 1}`] = isBackupOk ? '✅ 可用' : '❌ 不可用';
                    
                    if (isBackupOk) break; // 找到可用的备用RPC就停止测试
                }
            }
        }
        
        console.table(results);
        logger.success('网络状态检查完成', '详细结果请查看控制台');
        
        return results;
    }

    // 显示网络统计信息
    getNetworkStats() {
        const totalNetworks = Object.keys(this.networks).length;
        const customNetworks = Object.values(this.networks).filter(n => n.isCustom).length;
        const presetNetworks = totalNetworks - customNetworks;
        
        return {
            total: totalNetworks,
            preset: presetNetworks,
            custom: customNetworks,
            current: this.currentNetwork,
            currentName: this.getCurrentNetwork()?.name || '未知'
        };
    }

    // 检查网络连接状态
    async checkNetworkStatus() {
        const rpcUrl = this.getCurrentRpc();
        if (!rpcUrl) return false;
        
        try {
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1
                }),
                timeout: 5000
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// 创建全局网络管理器实例
const network = new NetworkManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkManager;
}
