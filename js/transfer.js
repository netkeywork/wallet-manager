/**
 * 转账功能模块 - Transfer Module
 * 提供完整的转账功能，包括分发模式和多对多转账
 */

class TransferManager {
    constructor() {
        this.currentNetwork = null;
        this.web3 = null;
        this.transferHistory = this.loadTransferHistory();
        this.isTransferring = false;
        this.transferQueue = [];
        this.tempPrivateKeys = new Map();
        this.init();
    }

    /**
     * 初始化转账管理器
     */
    init() {
        this.setupEventListeners();
        this.loadTransferUI();
        logger.log('转账管理器初始化完成', 'success');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 网络切换监听
        document.addEventListener('networkChanged', (e) => {
            this.handleNetworkChange(e.detail);
        });

        // 转账模式切换
        document.getElementById('transferModeSwitch')?.addEventListener('change', (e) => {
            this.switchTransferMode(e.target.checked);
        });

        // 批量转账按钮
        document.getElementById('batchTransferBtn')?.addEventListener('click', () => {
            this.startBatchTransfer();
        });

        // 添加转账行
        document.getElementById('addTransferRow')?.addEventListener('click', () => {
            this.addTransferRow();
        });

        // 导入转账数据
        document.getElementById('importTransferData')?.addEventListener('change', (e) => {
            this.importTransferData(e.target.files[0]);
        });

        // 估算Gas费
        document.getElementById('estimateGasBtn')?.addEventListener('click', () => {
            this.estimateAllGasFees();
        });

        // 检查余额
        document.getElementById('checkBalanceBtn')?.addEventListener('click', () => {
            this.checkAllBalances();
        });
    }
/**
     * 加载转账UI界面
     */
    loadTransferUI() {
        const transferContainer = document.getElementById('transferContainer');
        if (!transferContainer) return;

        transferContainer.innerHTML = `
            <div class="transfer-panel">
                <!-- 转账模式选择 -->
                <div class="transfer-mode-section">
                    <h3>转账模式</h3>
                    <div class="mode-switch">
                        <label>
                            <input type="checkbox" id="transferModeSwitch">
                            <span>多对多模式</span>
                            <small>关闭=分发模式(1对多)，开启=多对多模式</small>
                        </label>
                    </div>
                </div>

                <!-- 网络状态显示 -->
                <div class="network-status">
                    <span>当前网络: <strong id="currentNetworkDisplay">未选择</strong></span>
                    <span>Gas价格: <strong id="currentGasPrice">-- Gwei</strong></span>
                </div>

                <!-- 分发模式面板 -->
                <div id="distributionPanel" class="transfer-content active">
                    <h3>分发转账 (1对多)</h3>
                    <div class="distribution-form">
                        <div class="sender-section">
                            <label>发送方钱包:</label>
                            <select id="senderWallet" class="form-control">
                                <option value="">请选择发送方钱包</option>
                            </select>
                            <div class="wallet-info">
                                <span>余额: <strong id="senderBalance">0</strong> ETH</span>
                            </div>
                        </div>
                        
                        <div class="recipients-section">
                            <div class="section-header">
                                <label>接收方列表:</label>
                                <div class="action-buttons">
                                    <button id="addRecipient" class="btn btn-sm">+ 添加接收方</button>
                                    <label for="importRecipientsFile" class="btn btn-sm btn-outline">导入CSV</label>
                                    <input type="file" id="importRecipientsFile" accept=".csv,.txt" style="display: none;">
                                </div>
                            </div>
                            <div id="recipientsList" class="recipients-list">
                                <!-- 接收方行将动态添加 -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 多对多模式面板 -->
                <div id="batchPanel" class="transfer-content">
                    <h3>批量转账 (多对多)</h3>
                    <div class="batch-form">
                        <div class="section-header">
                            <label>转账列表:</label>
                            <div class="action-buttons">
                                <button id="addTransferRow" class="btn btn-sm">+ 添加转账</button>
                                <label for="importTransferData" class="btn btn-sm btn-outline">导入CSV</label>
                                <input type="file" id="importTransferData" accept=".csv,.txt" style="display: none;">
                            </div>
                        </div>
                        <div id="transferList" class="transfer-list">
                            <!-- 转账行将动态添加 -->
                        </div>
                    </div>
                </div>
        `;

        // 继续UI的其余部分...
        this.loadTransferUIControls();
    }
/**
     * 加载UI控件部分
     */
    loadTransferUIControls() {
        const transferContainer = document.getElementById('transferContainer');
        const controlsHTML = `
                <!-- 操作面板 -->
                <div class="transfer-actions">
                    <div class="action-row">
                        <button id="checkBalanceBtn" class="btn btn-secondary">检查余额</button>
                        <button id="estimateGasBtn" class="btn btn-secondary">估算Gas费</button>
                        <button id="batchTransferBtn" class="btn btn-primary" disabled>开始转账</button>
                    </div>
                    <div class="transfer-summary">
                        <span>总转账数: <strong id="totalTransfers">0</strong></span>
                        <span>总金额: <strong id="totalAmount">0</strong> ETH</span>
                        <span>估算Gas费: <strong id="totalGasFee">0</strong> ETH</span>
                    </div>
                </div>

                <!-- 转账进度 -->
                <div id="transferProgress" class="transfer-progress" style="display: none;">
                    <h4>转账进度</h4>
                    <div class="progress-bar">
                        <div id="progressFill" class="progress-fill"></div>
                    </div>
                    <div class="progress-info">
                        <span id="progressText">准备中...</span>
                        <span id="progressCount">0/0</span>
                    </div>
                </div>

                <!-- 转账结果 -->
                <div id="transferResults" class="transfer-results" style="display: none;">
                    <h4>转账结果</h4>
                    <div id="resultsList" class="results-list">
                        <!-- 结果将动态添加 -->
                    </div>
                </div>
            </div>
        `;
        
        transferContainer.querySelector('.transfer-panel').insertAdjacentHTML('beforeend', controlsHTML);
        
        // 初始化监听器
        this.setupDistributionListeners();
        this.setupBatchListeners();
        this.loadWalletOptions();
        this.addRecipientRow();
        this.addTransferRow();
    }

    /**
     * 设置分发模式监听器
     */
    setupDistributionListeners() {
        document.getElementById('addRecipient')?.addEventListener('click', () => {
            this.addRecipientRow();
        });

        document.getElementById('importRecipientsFile')?.addEventListener('change', (e) => {
            this.importRecipients(e.target.files[0]);
        });

        document.getElementById('senderWallet')?.addEventListener('change', (e) => {
            this.updateSenderInfo(e.target.value);
        });
    }

    /**
     * 设置批量模式监听器
     */
    setupBatchListeners() {
        // 批量模式监听器已在主监听器中设置
    }
/**
     * 处理网络切换
     */
    async handleNetworkChange(networkData) {
        this.currentNetwork = networkData;
        
        if (networkData && networkData.rpc) {
            try {
                this.web3 = new Web3(networkData.rpc);
                await this.updateGasPrice();
                this.updateNetworkDisplay();
                logger.log(`转账模块切换到网络: ${networkData.name}`, 'success');
            } catch (error) {
                logger.log(`网络连接失败: ${error.message}`, 'error');
            }
        }
    }

    /**
     * 更新Gas价格显示
     */
    async updateGasPrice() {
        if (!this.web3) return;
        
        try {
            const gasPrice = await this.web3.eth.getGasPrice();
            const gasPriceGwei = this.web3.utils.fromWei(gasPrice, 'gwei');
            document.getElementById('currentGasPrice').textContent = `${parseFloat(gasPriceGwei).toFixed(2)} Gwei`;
        } catch (error) {
            document.getElementById('currentGasPrice').textContent = '-- Gwei';
        }
    }

    /**
     * 更新网络显示
     */
    updateNetworkDisplay() {
        const display = document.getElementById('currentNetworkDisplay');
        if (display) {
            display.textContent = this.currentNetwork ? this.currentNetwork.name : '未选择';
        }
    }

    /**
     * 加载钱包选项
     */
    loadWalletOptions() {
        const wallets = walletManager.getWallets();
        const senderSelect = document.getElementById('senderWallet');
        
        if (senderSelect) {
            senderSelect.innerHTML = '<option value="">请选择发送方钱包</option>';
            wallets.forEach((wallet, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${wallet.name || '钱包' + (index + 1)} (${wallet.address.slice(0, 10)}...)`;
                senderSelect.appendChild(option);
            });
        }
    }

    /**
     * 更新发送方信息
     */
    async updateSenderInfo(walletIndex) {
        if (!walletIndex || !this.web3) return;
        
        const wallets = walletManager.getWallets();
        const wallet = wallets[walletIndex];
        
        if (wallet) {
            try {
                const balance = await this.web3.eth.getBalance(wallet.address);
                const balanceEth = this.web3.utils.fromWei(balance, 'ether');
                document.getElementById('senderBalance').textContent = parseFloat(balanceEth).toFixed(6);
            } catch (error) {
                document.getElementById('senderBalance').textContent = '0';
                logger.log(`获取余额失败: ${error.message}`, 'error');
            }
        }
    }
/**
     * 切换转账模式
     */
    switchTransferMode(isBatchMode) {
        const distributionPanel = document.getElementById('distributionPanel');
        const batchPanel = document.getElementById('batchPanel');
        
        if (isBatchMode) {
            distributionPanel.classList.remove('active');
            batchPanel.classList.add('active');
        } else {
            distributionPanel.classList.add('active');
            batchPanel.classList.remove('active');
        }
        
        this.updateTransferSummary();
    }

    /**
     * 添加接收方行
     */
    addRecipientRow() {
        const recipientsList = document.getElementById('recipientsList');
        const rowIndex = recipientsList.children.length;
        
        const row = document.createElement('div');
        row.className = 'recipient-row';
        row.innerHTML = `
            <div class="row-number">${rowIndex + 1}</div>
            <input type="text" placeholder="接收方地址" class="recipient-address form-control">
            <input type="number" placeholder="转账金额" class="recipient-amount form-control" step="0.000001" min="0">
            <select class="token-select form-control">
                <option value="ETH">ETH</option>
            </select>
            <button class="remove-recipient btn btn-danger btn-sm">删除</button>
        `;
        
        recipientsList.appendChild(row);
        
        // 添加删除监听器
        row.querySelector('.remove-recipient').addEventListener('click', () => {
            row.remove();
            this.updateRecipientNumbers();
            this.updateTransferSummary();
        });
        
        // 添加输入监听器
        row.querySelector('.recipient-address').addEventListener('input', () => this.updateTransferSummary());
        row.querySelector('.recipient-amount').addEventListener('input', () => this.updateTransferSummary());
        
        this.updateTransferSummary();
    }

    /**
     * 添加转账行（批量模式）
     */
    addTransferRow() {
        const transferList = document.getElementById('transferList');
        const rowIndex = transferList.children.length;
        
        const row = document.createElement('div');
        row.className = 'transfer-row';
        row.innerHTML = `
            <div class="row-number">${rowIndex + 1}</div>
            <select class="sender-select form-control">
                <option value="">选择发送方</option>
            </select>
            <input type="text" placeholder="接收方地址" class="recipient-address form-control">
            <input type="number" placeholder="转账金额" class="transfer-amount form-control" step="0.000001" min="0">
            <select class="token-select form-control">
                <option value="ETH">ETH</option>
            </select>
            <button class="remove-transfer btn btn-danger btn-sm">删除</button>
        `;
        
        transferList.appendChild(row);
        
        // 加载钱包选项
        const senderSelect = row.querySelector('.sender-select');
        const wallets = walletManager.getWallets();
        wallets.forEach((wallet, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${wallet.name || '钱包' + (index + 1)} (${wallet.address.slice(0, 10)}...)`;
            senderSelect.appendChild(option);
        });
        
        // 添加事件监听器
        row.querySelector('.remove-transfer').addEventListener('click', () => {
            row.remove();
            this.updateTransferNumbers();
            this.updateTransferSummary();
        });
        
        row.querySelector('.sender-select').addEventListener('change', () => this.updateTransferSummary());
        row.querySelector('.recipient-address').addEventListener('input', () => this.updateTransferSummary());
        row.querySelector('.transfer-amount').addEventListener('input', () => this.updateTransferSummary());
        
        this.updateTransferSummary();
    }
/**
     * 更新接收方编号
     */
    updateRecipientNumbers() {
        const rows = document.querySelectorAll('.recipient-row');
        rows.forEach((row, index) => {
            row.querySelector('.row-number').textContent = index + 1;
        });
    }

    /**
     * 更新转账编号
     */
    updateTransferNumbers() {
        const rows = document.querySelectorAll('.transfer-row');
        rows.forEach((row, index) => {
            row.querySelector('.row-number').textContent = index + 1;
        });
    }

    /**
     * 更新转账摘要
     */
    updateTransferSummary() {
        const isBatchMode = document.getElementById('transferModeSwitch').checked;
        let totalTransfers = 0;
        let totalAmount = 0;
        
        if (isBatchMode) {
            const rows = document.querySelectorAll('.transfer-row');
            rows.forEach(row => {
                const amount = parseFloat(row.querySelector('.transfer-amount').value) || 0;
                const recipient = row.querySelector('.recipient-address').value.trim();
                const sender = row.querySelector('.sender-select').value;
                
                if (amount > 0 && recipient && sender) {
                    totalTransfers++;
                    totalAmount += amount;
                }
            });
        } else {
            const senderWallet = document.getElementById('senderWallet').value;
            if (senderWallet) {
                const rows = document.querySelectorAll('.recipient-row');
                rows.forEach(row => {
                    const amount = parseFloat(row.querySelector('.recipient-amount').value) || 0;
                    const recipient = row.querySelector('.recipient-address').value.trim();
                    
                    if (amount > 0 && recipient) {
                        totalTransfers++;
                        totalAmount += amount;
                    }
                });
            }
        }
        
        document.getElementById('totalTransfers').textContent = totalTransfers;
        document.getElementById('totalAmount').textContent = totalAmount.toFixed(6);
        
        const transferBtn = document.getElementById('batchTransferBtn');
        transferBtn.disabled = totalTransfers === 0 || !this.currentNetwork;
    }

    /**
     * 导入接收方数据
     */
    async importRecipients(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            document.getElementById('recipientsList').innerHTML = '';
            
            lines.forEach(line => {
                const [address, amount] = line.split(',').map(s => s.trim());
                if (address && amount) {
                    this.addRecipientRow();
                    const lastRow = document.querySelector('.recipient-row:last-child');
                    lastRow.querySelector('.recipient-address').value = address;
                    lastRow.querySelector('.recipient-amount').value = amount;
                }
            });
            
            this.updateTransferSummary();
            logger.log(`导入 ${lines.length} 个接收方`, 'success');
        } catch (error) {
            logger.log(`导入失败: ${error.message}`, 'error');
        }
    }
/**
     * 导入转账数据（批量模式）
     */
    async importTransferData(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            document.getElementById('transferList').innerHTML = '';
            
            lines.forEach(line => {
                const [senderIndex, recipient, amount] = line.split(',').map(s => s.trim());
                if (senderIndex && recipient && amount) {
                    this.addTransferRow();
                    const lastRow = document.querySelector('.transfer-row:last-child');
                    lastRow.querySelector('.sender-select').value = senderIndex;
                    lastRow.querySelector('.recipient-address').value = recipient;
                    lastRow.querySelector('.transfer-amount').value = amount;
                }
            });
            
            this.updateTransferSummary();
            logger.log(`导入 ${lines.length} 个转账任务`, 'success');
        } catch (error) {
            logger.log(`导入失败: ${error.message}`, 'error');
        }
    }

    /**
     * 检查所有钱包余额
     */
    async checkAllBalances() {
        if (!this.web3 || !this.currentNetwork) {
            showNotification('请先选择网络', 'error');
            return;
        }

        const isBatchMode = document.getElementById('transferModeSwitch').checked;
        const checkBtn = document.getElementById('checkBalanceBtn');
        
        checkBtn.disabled = true;
        checkBtn.textContent = '检查中...';
        
        try {
            if (isBatchMode) {
                await this.checkBatchBalances();
            } else {
                await this.checkDistributionBalance();
            }
        } catch (error) {
            logger.log(`余额检查失败: ${error.message}`, 'error');
        } finally {
            checkBtn.disabled = false;
            checkBtn.textContent = '检查余额';
        }
    }

    /**
     * 检查分发模式余额
     */
    async checkDistributionBalance() {
        const senderWalletIndex = document.getElementById('senderWallet').value;
        if (!senderWalletIndex) {
            showNotification('请选择发送方钱包', 'warning');
            return;
        }

        const wallets = walletManager.getWallets();
        const senderWallet = wallets[senderWalletIndex];
        
        if (!senderWallet) return;

        const balance = await this.web3.eth.getBalance(senderWallet.address);
        const balanceEth = parseFloat(this.web3.utils.fromWei(balance, 'ether'));
        
        let totalRequired = 0;
        let validRecipients = 0;
        const recipients = document.querySelectorAll('.recipient-row');
        
        recipients.forEach(row => {
            const amount = parseFloat(row.querySelector('.recipient-amount').value) || 0;
            const recipient = row.querySelector('.recipient-address').value.trim();
            if (amount > 0 && recipient && this.web3.utils.isAddress(recipient)) {
                totalRequired += amount;
                validRecipients++;
            }
        });

        const estimatedGasFee = validRecipients * 0.001;
        const totalWithGas = totalRequired + estimatedGasFee;
        const sufficient = balanceEth >= totalWithGas;
        
        const message = `
📊 分发模式余额检查结果：
💰 发送方余额: ${balanceEth.toFixed(6)} ETH
💸 需要转账: ${totalRequired.toFixed(6)} ETH
⛽ 预估Gas费: ${estimatedGasFee.toFixed(6)} ETH
📈 总计需要: ${totalWithGas.toFixed(6)} ETH
📋 有效接收方: ${validRecipients} 个
${sufficient ? '✅ 余额充足，可以转账' : '❌ 余额不足，请充值'}
        `;
        
        showNotification(message, sufficient ? 'success' : 'error');
        logger.log(`分发模式余额检查: ${sufficient ? '通过' : '失败'}`, sufficient ? 'success' : 'error');
        
        this.updateTransferButtonState(sufficient && validRecipients > 0);
    }
/**
     * 检查批量模式余额
     */
    async checkBatchBalances() {
        const rows = document.querySelectorAll('.transfer-row');
        const wallets = walletManager.getWallets();
        const balanceResults = [];
        const walletBalances = new Map();
        
        for (const row of rows) {
            const senderIndex = row.querySelector('.sender-select').value;
            const amount = parseFloat(row.querySelector('.transfer-amount').value) || 0;
            const recipient = row.querySelector('.recipient-address').value.trim();
            
            if (!senderIndex || amount <= 0 || !recipient || !this.web3.utils.isAddress(recipient)) continue;
            
            const wallet = wallets[senderIndex];
            if (!wallet) continue;
            
            try {
                let balanceEth;
                if (walletBalances.has(wallet.address)) {
                    balanceEth = walletBalances.get(wallet.address);
                } else {
                    const balance = await this.web3.eth.getBalance(wallet.address);
                    balanceEth = parseFloat(this.web3.utils.fromWei(balance, 'ether'));
                    walletBalances.set(wallet.address, balanceEth);
                }
                
                const estimatedGas = 0.001;
                const totalRequired = amount + estimatedGas;
                
                balanceResults.push({
                    address: wallet.address.slice(0, 10) + '...',
                    balance: balanceEth,
                    required: totalRequired,
                    amount: amount,
                    sufficient: balanceEth >= totalRequired
                });
            } catch (error) {
                logger.log(`检查钱包 ${wallet.address} 余额失败: ${error.message}`, 'error');
            }
        }
        
        const allSufficient = balanceResults.every(r => r.sufficient);
        const insufficientCount = balanceResults.filter(r => !r.sufficient).length;
        
        const message = `
📊 批量模式余额检查结果：
📋 检查钱包数: ${balanceResults.length} 个
✅ 余额充足: ${balanceResults.length - insufficientCount} 个
❌ 余额不足: ${insufficientCount} 个
${allSufficient ? '✅ 全部钱包余额充足' : '⚠️ 部分钱包余额不足'}
        `;
        
        showNotification(message, allSufficient ? 'success' : 'warning');
        logger.log(`批量余额检查: ${allSufficient ? '全部通过' : insufficientCount + '个余额不足'}`, allSufficient ? 'success' : 'warning');
        
        this.updateTransferButtonState(allSufficient && balanceResults.length > 0);
    }

    /**
     * 估算所有Gas费
     */
    async estimateAllGasFees() {
        if (!this.web3 || !this.currentNetwork) {
            showNotification('请先选择网络', 'error');
            return;
        }

        const estimateBtn = document.getElementById('estimateGasBtn');
        estimateBtn.disabled = true;
        estimateBtn.textContent = '估算中...';

        try {
            const isBatchMode = document.getElementById('transferModeSwitch').checked;
            let totalGasFee = 0;
            let transactionCount = 0;

            if (isBatchMode) {
                const result = await this.estimateBatchGasFees();
                totalGasFee = result.totalGasFee;
                transactionCount = result.transactionCount;
            } else {
                const result = await this.estimateDistributionGasFees();
                totalGasFee = result.totalGasFee;
                transactionCount = result.transactionCount;
            }

            document.getElementById('totalGasFee').textContent = totalGasFee.toFixed(6);
            
            const message = `
⛽ Gas费估算完成：
📋 交易数量: ${transactionCount} 笔
💰 总Gas费: ${totalGasFee.toFixed(6)} ETH
📊 平均Gas费: ${(totalGasFee / Math.max(transactionCount, 1)).toFixed(6)} ETH/笔
            `;
            
            showNotification(message, 'success');
            logger.log(`Gas费估算完成: ${transactionCount}笔交易，总计${totalGasFee.toFixed(6)}ETH`, 'success');
        } catch (error) {
            logger.log(`Gas费估算失败: ${error.message}`, 'error');
            showNotification('Gas费估算失败，请检查网络连接', 'error');
        } finally {
            estimateBtn.disabled = false;
            estimateBtn.textContent = '估算Gas费';
        }
    }
/**
     * 估算分发模式Gas费
     */
    async estimateDistributionGasFees() {
        const senderWalletIndex = document.getElementById('senderWallet').value;
        if (!senderWalletIndex) return { totalGasFee: 0, transactionCount: 0 };

        const wallets = walletManager.getWallets();
        const senderWallet = wallets[senderWalletIndex];
        if (!senderWallet) return { totalGasFee: 0, transactionCount: 0 };

        const recipients = document.querySelectorAll('.recipient-row');
        let totalGasFee = 0;
        let transactionCount = 0;

        const gasPrice = await this.web3.eth.getGasPrice();

        for (const row of recipients) {
            const amount = parseFloat(row.querySelector('.recipient-amount').value) || 0;
            const recipient = row.querySelector('.recipient-address').value.trim();
            
            if (amount > 0 && recipient && this.web3.utils.isAddress(recipient)) {
                try {
                    const gasLimit = await this.web3.eth.estimateGas({
                        from: senderWallet.address,
                        to: recipient,
                        value: this.web3.utils.toWei(amount.toString(), 'ether')
                    });
                    
                    const gasFee = parseFloat(this.web3.utils.fromWei((BigInt(gasPrice) * BigInt(gasLimit)).toString(), 'ether'));
                    totalGasFee += gasFee;
                    transactionCount++;
                } catch (error) {
                    totalGasFee += 0.001;
                    transactionCount++;
                    logger.log(`无法估算到 ${recipient} 的Gas费，使用默认值`, 'warning');
                }
            }
        }

        return { totalGasFee, transactionCount };
    }

    /**
     * 估算批量模式Gas费
     */
    async estimateBatchGasFees() {
        const rows = document.querySelectorAll('.transfer-row');
        const wallets = walletManager.getWallets();
        let totalGasFee = 0;
        let transactionCount = 0;

        const gasPrice = await this.web3.eth.getGasPrice();

        for (const row of rows) {
            const senderIndex = row.querySelector('.sender-select').value;
            const amount = parseFloat(row.querySelector('.transfer-amount').value) || 0;
            const recipient = row.querySelector('.recipient-address').value.trim();
            
            if (!senderIndex || amount <= 0 || !recipient || !this.web3.utils.isAddress(recipient)) continue;
            
            const wallet = wallets[senderIndex];
            if (!wallet) continue;

            try {
                const gasLimit = await this.web3.eth.estimateGas({
                    from: wallet.address,
                    to: recipient,
                    value: this.web3.utils.toWei(amount.toString(), 'ether')
                });
                
                const gasFee = parseFloat(this.web3.utils.fromWei((BigInt(gasPrice) * BigInt(gasLimit)).toString(), 'ether'));
                totalGasFee += gasFee;
                transactionCount++;
            } catch (error) {
                totalGasFee += 0.001;
                transactionCount++;
                logger.log(`无法估算从 ${wallet.address} 到 ${recipient} 的Gas费，使用默认值`, 'warning');
            }
        }

        return { totalGasFee, transactionCount };
    }

    /**
     * 更新转账按钮状态
     */
    updateTransferButtonState(canTransfer) {
        const transferBtn = document.getElementById('batchTransferBtn');
        transferBtn.disabled = !canTransfer || this.isTransferring;
        
        if (this.isTransferring) {
            transferBtn.textContent = '转账中...';
        } else if (canTransfer) {
            transferBtn.textContent = '开始转账';
        } else {
            transferBtn.textContent = '检查余额后可转账';
        }
    }
/**
     * 开始批量转账
     */
    async startBatchTransfer() {
        if (this.isTransferring) {
            showNotification('转账正在进行中，请等待完成', 'warning');
            return;
        }

        if (!this.web3 || !this.currentNetwork) {
            showNotification('请先选择网络', 'error');
            return;
        }

        const isBatchMode = document.getElementById('transferModeSwitch').checked;
        const transferTasks = this.prepareTransferTasks(isBatchMode);
        
        if (transferTasks.length === 0) {
            showNotification('没有有效的转账任务', 'error');
            return;
        }

        const confirmed = await this.confirmTransfer(transferTasks, isBatchMode);
        if (!confirmed) return;

        this.isTransferring = true;
        this.updateTransferButtonState(false);
        this.showTransferProgress();
        
        try {
            await this.executeTransfers(transferTasks);
        } catch (error) {
            logger.log(`转账执行失败: ${error.message}`, 'error');
            showNotification('转账执行出现异常，请查看详细日志', 'error');
        } finally {
            this.isTransferring = false;
            this.updateTransferButtonState(true);
        }
    }

    /**
     * 准备转账任务
     */
    prepareTransferTasks(isBatchMode) {
        const tasks = [];
        const wallets = walletManager.getWallets();

        if (isBatchMode) {
            const rows = document.querySelectorAll('.transfer-row');
            rows.forEach((row, index) => {
                const senderIndex = row.querySelector('.sender-select').value;
                const amount = parseFloat(row.querySelector('.transfer-amount').value) || 0;
                const recipient = row.querySelector('.recipient-address').value.trim();
                
                if (senderIndex && amount > 0 && recipient && this.web3.utils.isAddress(recipient)) {
                    const wallet = wallets[senderIndex];
                    if (wallet) {
                        tasks.push({
                            id: `batch_${index}`,
                            sender: wallet,
                            recipient: recipient,
                            amount: amount,
                            amountWei: this.web3.utils.toWei(amount.toString(), 'ether'),
                            mode: 'batch',
                            rowIndex: index
                        });
                    }
                }
            });
        } else {
            const senderWalletIndex = document.getElementById('senderWallet').value;
            if (senderWalletIndex) {
                const senderWallet = wallets[senderWalletIndex];
                if (senderWallet) {
                    const recipients = document.querySelectorAll('.recipient-row');
                    recipients.forEach((row, index) => {
                        const amount = parseFloat(row.querySelector('.recipient-amount').value) || 0;
                        const recipient = row.querySelector('.recipient-address').value.trim();
                        
                        if (amount > 0 && recipient && this.web3.utils.isAddress(recipient)) {
                            tasks.push({
                                id: `dist_${index}`,
                                sender: senderWallet,
                                recipient: recipient,
                                amount: amount,
                                amountWei: this.web3.utils.toWei(amount.toString(), 'ether'),
                                mode: 'distribution',
                                rowIndex: index
                            });
                        }
                    });
                }
            }
        }

        logger.log(`准备转账任务: ${tasks.length}个有效任务`, 'info');
        return tasks;
    }
/**
     * 确认转账
     */
    async confirmTransfer(tasks, isBatchMode) {
        const totalAmount = tasks.reduce((sum, task) => sum + task.amount, 0);
        const uniqueSenders = [...new Set(tasks.map(task => task.sender.address))].length;
        
        const confirmMessage = `
🔄 ${isBatchMode ? '批量转账' : '分发转账'} 确认：

📋 转账笔数: ${tasks.length} 笔
👤 发送方钱包: ${uniqueSenders} 个
💰 总转账金额: ${totalAmount.toFixed(6)} ETH
🌐 网络: ${this.currentNetwork.name}
⛽ 预估Gas费: ~${(tasks.length * 0.001).toFixed(6)} ETH

⚠️ 重要提醒：
• 转账开始后无法撤销
• 请确认所有地址和金额正确
• 确保钱包有足够余额支付Gas费

是否确认执行转账？
        `;

        const confirmed = confirm(confirmMessage);
        
        if (confirmed) {
            logger.log(`用户确认${isBatchMode ? '批量' : '分发'}转账: ${tasks.length}笔，总计${totalAmount.toFixed(6)}ETH`, 'info');
        } else {
            logger.log('用户取消转账操作', 'info');
        }

        return confirmed;
    }

    /**
     * 显示转账进度面板
     */
    showTransferProgress() {
        const progressContainer = document.getElementById('transferProgress');
        const resultsContainer = document.getElementById('transferResults');
        
        progressContainer.style.display = 'block';
        resultsContainer.style.display = 'none';
        
        this.updateTransferProgress(0, 0, '初始化转账...');
        
        document.getElementById('resultsList').innerHTML = '';
        
        progressContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * 更新转账进度显示
     */
    updateTransferProgress(current, total, status = '') {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressCount = document.getElementById('progressCount');
        
        if (!progressFill || !progressText || !progressCount) return;
        
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = status || `转账进行中... (${current}/${total})`;
        progressCount.textContent = `${current}/${total}`;
        
        if (percentage === 100) {
            progressFill.style.backgroundColor = '#28a745';
        } else if (percentage > 0) {
            progressFill.style.backgroundColor = '#007bff';
        }
    }

    /**
     * 执行转账队列
     */
    async executeTransfers(tasks) {
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        const startTime = Date.now();
        
        this.updateTransferProgress(0, tasks.length, '开始执行转账...');
        
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const currentStep = i + 1;
            
            this.updateTransferProgress(i, tasks.length, 
                `正在处理第 ${currentStep} 笔: ${task.amount}ETH → ${task.recipient.slice(0, 10)}...`);
            
            try {
                const result = await this.executeSingleTransfer(task);
                results.push(result);
                
                if (result.success) {
                    successCount++;
                    logger.log(`✅ 转账成功 [${currentStep}/${tasks.length}]: ${task.amount}ETH → ${task.recipient}`, 'success');
                } else {
                    failureCount++;
                    logger.log(`❌ 转账失败 [${currentStep}/${tasks.length}]: ${task.amount}ETH → ${task.recipient} - ${result.error}`, 'error');
                }
                
                this.addTransferResult(result, currentStep);
                
                if (i < tasks.length - 1) {
                    this.updateTransferProgress(currentStep, tasks.length, '等待下一笔转账...');
                    await this.delay(1500);
                }
                
            } catch (error) {
                const result = {
                    success: false,
                    task: task,
                    error: `执行异常: ${error.message}`,
                    timestamp: Date.now()
                };
                
                results.push(result);
                failureCount++;
                
                logger.log(`💥 转账异常 [${currentStep}/${tasks.length}]: ${error.message}`, 'error');
                this.addTransferResult(result, currentStep);
            }
        }
        
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        this.updateTransferProgress(tasks.length, tasks.length, 
            `转账完成！用时: ${totalTime}秒`);
        
        setTimeout(() => {
            this.showFinalResults(results, successCount, failureCount, totalTime);
        }, 1000);
        
        this.saveTransferToHistory(results);
        
        logger.log(`🏁 转账批处理完成: ${successCount}成功/${failureCount}失败，用时${totalTime}秒`, 
            failureCount === 0 ? 'success' : 'warning');
    }
/**
     * 执行单笔转账
     */
    async executeSingleTransfer(task) {
        try {
            const privateKey = await this.getPrivateKey(task.sender);
            if (!privateKey) {
                throw new Error('无法获取私钥');
            }
            
            const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
            const account = this.web3.eth.accounts.privateKeyToAccount(formattedPrivateKey);
            
            if (account.address.toLowerCase() !== task.sender.address.toLowerCase()) {
                throw new Error('私钥与钱包地址不匹配');
            }
            
            const nonce = await this.web3.eth.getTransactionCount(task.sender.address, 'pending');
            
            let gasLimit;
            try {
                gasLimit = await this.web3.eth.estimateGas({
                    from: task.sender.address,
                    to: task.recipient,
                    value: task.amountWei
                });
                gasLimit = Math.floor(gasLimit * 1.1);
            } catch (gasError) {
                gasLimit = 21000;
                logger.log(`Gas估算失败，使用默认值: ${gasLimit}`, 'warning');
            }
            
            const gasPrice = await this.web3.eth.getGasPrice();
            
            const txObject = {
                from: task.sender.address,
                to: task.recipient,
                value: task.amountWei,
                gas: gasLimit,
                gasPrice: gasPrice,
                nonce: nonce
            };
            
            const signedTx = await account.signTransaction(txObject);
            const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            
            const actualGasFee = this.web3.utils.fromWei(
                (BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice || gasPrice)).toString(), 
                'ether'
            );
            
            return {
                success: true,
                task: task,
                txHash: receipt.transactionHash,
                gasUsed: receipt.gasUsed.toString(),
                gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei'),
                gasFee: parseFloat(actualGasFee),
                blockNumber: receipt.blockNumber,
                timestamp: Date.now()
            };
            
        } catch (error) {
            let errorMessage = error.message;
            
            if (error.message.includes('insufficient funds')) {
                errorMessage = '余额不足（包括Gas费）';
            } else if (error.message.includes('nonce too low')) {
                errorMessage = 'Nonce值过低，请重试';
            } else if (error.message.includes('gas price too low')) {
                errorMessage = 'Gas价格过低';
            } else if (error.message.includes('intrinsic gas too low')) {
                errorMessage = 'Gas限制过低';
            } else if (error.message.includes('invalid address')) {
                errorMessage = '接收地址无效';
            }
            
            return {
                success: false,
                task: task,
                error: errorMessage,
                originalError: error.message,
                timestamp: Date.now()
            };
        }
    }

    /**
     * 获取私钥（安全处理）
     */
    async getPrivateKey(wallet) {
        if (wallet.privateKey) {
            return wallet.privateKey;
        }
        
        const storedKey = this.getStoredPrivateKey(wallet.address);
        if (storedKey) {
            return storedKey;
        }
        
        const userInputKey = await this.promptForPrivateKey(wallet);
        if (userInputKey) {
            const shouldStore = confirm('是否加密保存私钥到本地？(仅本次会话有效)');
            if (shouldStore) {
                this.storePrivateKeyTemporary(wallet.address, userInputKey);
            }
            return userInputKey;
        }
        
        return null;
    }

    /**
     * 弹窗获取私钥
     */
    async promptForPrivateKey(wallet) {
        const message = `
请输入钱包的私钥:
地址: ${wallet.address}
名称: ${wallet.name || '未命名钱包'}

⚠️ 注意：私钥仅用于本次转账，不会永久保存
        `;
        
        const privateKey = prompt(message);
        
        if (!privateKey) {
            return null;
        }
        
        const cleanKey = privateKey.trim();
        if (cleanKey.length !== 64 && cleanKey.length !== 66) {
            alert('私钥格式不正确！私钥应为64位十六进制字符串');
            return null;
        }
        
        return cleanKey;
    }
/**
     * 临时存储私钥（会话级别）
     */
    storePrivateKeyTemporary(address, privateKey) {
        if (!this.tempPrivateKeys) {
            this.tempPrivateKeys = new Map();
        }
        const encrypted = btoa(privateKey);
        this.tempPrivateKeys.set(address.toLowerCase(), encrypted);
    }

    /**
     * 获取临时存储的私钥
     */
    getStoredPrivateKey(address) {
        if (!this.tempPrivateKeys) {
            return null;
        }
        
        const encrypted = this.tempPrivateKeys.get(address.toLowerCase());
        if (encrypted) {
            try {
                return atob(encrypted);
            } catch (error) {
                return null;
            }
        }
        
        return null;
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 添加单个转账结果到显示列表
     */
    addTransferResult(result, index) {
        const resultsList = document.getElementById('resultsList');
        const resultsContainer = document.getElementById('transferResults');
        
        resultsContainer.style.display = 'block';
        
        const resultItem = document.createElement('div');
        resultItem.className = `transfer-result ${result.success ? 'success' : 'failure'}`;
        
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-index">#${index}</span>
                <span class="result-status ${result.success ? 'success' : 'error'}">
                    ${result.success ? '✅ 成功' : '❌ 失败'}
                </span>
                <span class="result-time">${new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="result-details">
                <div class="detail-row">
                    <span>发送方:</span>
                    <span class="address" title="${result.task.sender.address}">
                        ${result.task.sender.address.slice(0, 15)}...
                    </span>
                </div>
                <div class="detail-row">
                    <span>接收方:</span>
                    <span class="address" title="${result.task.recipient}">
                        ${result.task.recipient.slice(0, 15)}...
                    </span>
                </div>
                <div class="detail-row">
                    <span>金额:</span>
                    <span class="amount">${result.task.amount} ETH</span>
                </div>
                ${result.success ? `
                    <div class="detail-row">
                        <span>交易哈希:</span>
                        <span class="tx-hash" title="${result.txHash}">
                            <a href="${this.getExplorerUrl(result.txHash)}" target="_blank">
                                ${result.txHash.slice(0, 20)}...
                            </a>
                        </span>
                    </div>
                ` : `
                    <div class="detail-row error">
                        <span>错误信息:</span>
                        <span class="error-msg">${result.error}</span>
                    </div>
                `}
            </div>
        `;
        
        resultsList.appendChild(resultItem);
        
        setTimeout(() => {
            resultItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
/**
     * 显示最终结果汇总
     */
    showFinalResults(results, successCount, failureCount, totalTime) {
        const totalAmount = results
            .filter(r => r.success)
            .reduce((sum, r) => sum + r.task.amount, 0);
            
        const totalGasFee = results
            .filter(r => r.success && r.gasFee)
            .reduce((sum, r) => sum + r.gasFee, 0);
            
        const failedAmount = results
            .filter(r => !r.success)
            .reduce((sum, r) => sum + r.task.amount, 0);
        
        const message = `
🎉 转账批处理完成！

📊 执行统计:
✅ 成功转账: ${successCount} 笔
❌ 失败转账: ${failureCount} 笔
📈 成功率: ${((successCount / results.length) * 100).toFixed(1)}%
⏱️ 总用时: ${totalTime} 秒

💰 资金统计:
💸 成功转账金额: ${totalAmount.toFixed(6)} ETH
⛽ 总Gas费用: ${totalGasFee.toFixed(6)} ETH
💔 失败金额: ${failedAmount.toFixed(6)} ETH

🌐 网络: ${this.currentNetwork.name}
${failureCount === 0 ? 
    '🎊 恭喜！所有转账都成功完成！' : 
    '⚠️ 部分转账失败，建议检查失败原因后重新尝试失败的转账'}
        `;
        
        showNotification(message, failureCount === 0 ? 'success' : 'warning');
        
        const logLevel = failureCount === 0 ? 'success' : 'warning';
        logger.log(`批量转账完成: 成功${successCount}笔(${totalAmount.toFixed(6)}ETH)，失败${failureCount}笔，用时${totalTime}秒`, logLevel);
    }

    /**
     * 获取区块链浏览器URL
     */
    getExplorerUrl(txHash) {
        const explorers = {
            1: 'https://etherscan.io/tx/',
            56: 'https://bscscan.com/tx/',
            137: 'https://polygonscan.com/tx/',
            42161: 'https://arbiscan.io/tx/',
            10: 'https://optimistic.etherscan.io/tx/',
        };
        
        const baseUrl = explorers[this.currentNetwork?.chainId] || 'https://etherscan.io/tx/';
        return baseUrl + txHash;
    }
/**
     * 保存转账历史记录
     */
    saveTransferToHistory(results) {
        try {
            const historyItem = {
                id: Date.now(),
                timestamp: Date.now(),
                network: this.currentNetwork.name,
                networkChainId: this.currentNetwork.chainId,
                mode: document.getElementById('transferModeSwitch').checked ? 'batch' : 'distribution',
                results: results.map(r => ({
                    success: r.success,
                    senderAddress: r.task.sender.address,
                    recipient: r.task.recipient,
                    amount: r.task.amount,
                    txHash: r.txHash,
                    error: r.error,
                    gasFee: r.gasFee,
                    timestamp: r.timestamp
                })),
                summary: {
                    total: results.length,
                    success: results.filter(r => r.success).length,
                    failure: results.filter(r => !r.success).length,
                    totalAmount: results
                        .filter(r => r.success)
                        .reduce((sum, r) => sum + r.task.amount, 0),
                    totalGasFee: results
                        .filter(r => r.success && r.gasFee)
                        .reduce((sum, r) => sum + r.gasFee, 0)
                }
            };
            
            this.transferHistory.unshift(historyItem);
            
            if (this.transferHistory.length > 100) {
                this.transferHistory = this.transferHistory.slice(0, 100);
            }
            
            localStorage.setItem('transferHistory', JSON.stringify(this.transferHistory));
            logger.log(`转账历史已保存: ${results.length}笔转账记录`, 'info');
            
        } catch (error) {
            logger.log(`保存转账历史失败: ${error.message}`, 'error');
        }
    }

    /**
     * 加载转账历史记录
     */
    loadTransferHistory() {
        try {
            const history = localStorage.getItem('transferHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            logger.log('加载转账历史失败，使用空记录', 'warning');
            return [];
        }
    }

    /**
     * 销毁转账管理器
     */
    destroy() {
        if (this.tempPrivateKeys) {
            this.tempPrivateKeys.clear();
        }
        
        this.isTransferring = false;
        this.transferQueue = [];
        
        logger.log('转账管理器已销毁', 'info');
    }
}

// 创建全局转账管理器实例
let transferManager = null;

// 在 DOMContentLoaded 时初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('transferContainer')) {
        transferManager = new TransferManager();
        logger.log('转账管理器已初始化', 'success');
    }
});

