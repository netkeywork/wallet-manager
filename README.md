# 钱包管理工具

一个基于纯前端技术的区块链钱包管理工具，支持多网络钱包管理、批量操作、转账功能等。

## 🚀 功能特性

- 📱 **钱包管理**：导入/删除/导出，支持 JSON/TXT/CSV 格式
- 🌐 **多网络支持**：Ethereum、BSC、Arbitrum、Optimism、Linea、Solana  
- 📊 **余额查询**：批量查询钱包余额，显示总计
- 📝 **日志系统**：操作记录分类显示，成功/失败统计
- 💸 **转账功能**：分发模式 + 多对多模式（开发中）

## 📁 项目结构

```
wallet-manager/
├── index.html          # 主页面结构
├── css/
│   └── style.css      # 样式文件
├── js/
│   ├── main.js        # 主程序入口
│   ├── wallet.js      # 钱包管理功能
│   └── logger.js      # 日志系统
└── README.md          # 项目文档
```

## 🛠️ 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **存储**：localStorage  
- **架构**：模块化设计

## 📈 开发进度

- [x] **第一阶段**：基础布局 + 钱包管理界面
- [ ] **第二阶段**：文件导入 + 网络配置 + 余额查询  
- [ ] **第三阶段**：转账功能实现

## 🚀 快速开始

1. 克隆项目
```bash
git clone https://github.com/你的用户名/wallet-manager.git
cd wallet-manager
```

2. 打开项目
```bash
# 使用本地服务器打开（推荐）
python -m http.server 8000
# 或直接双击 index.html
```

3. 访问 `http://localhost:8000`

## 🔒 安全提醒

⚠️ **重要提醒**：
- 本工具为开发测试用途，请勿在生产环境使用大额资金
- 私钥信息仅存储在本地浏览器，请做好备份
- 建议在安全环境下使用，定期清理浏览器数据

## 📄 许可证

MIT License
