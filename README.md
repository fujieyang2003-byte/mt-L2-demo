# 广告经营管理系统 (Ad Operations System)

广告经营管理系统 Demo，用于展示多角色、多维度的广告业务经营管理场景。纯前端项目，所有数据均为 Demo 模拟数据，无需数据库。

**在线体验**：[https://mt-l2-demo.pages.dev](https://mt-l2-demo.pages.dev)

## 功能模块

- **首页总览**：全局经营指标概览，支持区域/城市多维度下钻，AI 智能分析面板（打字机逐字效果）
- **产品分析**：产品经营总览、区域透视、分客群分析、产品明细
- **商家分析**：商家分层透视、商家分客群分析、商家明细，支持下钻到单个商家
- **渠道分析**：区域/总商/城市/BD 四大视角透视，渠道年框看板
- **多业务线切换**：外卖 / 到餐 / 闪购 / 医药四大业务线，顶部一键切换
- **权限管理**：用户角色管理与权限审批

全站配备苹果风格动效（页面切换、Tab 切换、级联淡入、按压反馈）与统一的 AI 智能分析面板。

## 角色体系

系统支持 4 种角色，登录页面可自由切换体验：

- **平台管理员**：全局视角，按区域/总商维度查看，可下钻到城市级
- **广告业务经理**：负责区域视角，跟踪城市级经营数据
- **合作商**：负责城市视角，管理下属 BD 经营表现
- **BD/运营**：门店级视角，查看门店诊断卡片和 AI 推荐话术

## 技术栈

- React + Vite
- shadcn/ui + Tailwind CSS
- react-router-dom (HashRouter)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── components/
│   ├── dashboard/          # 业务组件（KPI卡片、诊断推送弹窗等）
│   ├── ui/                 # shadcn/ui 基础组件
│   └── PermissionGate.jsx  # 权限控制组件
├── config/
│   └── menuConfig.js       # 菜单配置（外卖/到餐/闪购/医药）
├── contexts/
│   ├── BizLineContext.jsx  # 业务线切换上下文
│   └── UserContext.jsx      # 用户认证上下文（Demo 模式）
├── layouts/
│   └── AdminLayout.jsx      # 管理后台布局
├── pages/
│   ├── Overview*.jsx           # 首页总览（全局/区域/城市）
│   ├── Product*.jsx            # 产品分析系列页面
│   ├── Merchant*.jsx           # 商家分析系列页面
│   ├── Channel*.jsx            # 渠道透视系列页面（含年框看板）
│   ├── Login.jsx               # 登录页（角色选择）
│   └── PermissionManagement.jsx # 权限管理
├── App.jsx
└── main.jsx
```

## 部署

本项目通过 [Cloudflare Pages](https://pages.cloudflare.com) 部署，连接 GitHub 仓库后自动构建。

构建配置：
- **Build command**：`npm run build`
- **Build output directory**：`dist`

## License

MIT
