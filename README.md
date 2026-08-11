# 广告经营管理系统 (Ad Operations System)

基于 NoCode 平台构建的广告经营管理系统 Demo，用于展示多角色、多维度的广告业务经营管理场景。

## 功能模块

- **首页总览**：全局经营指标概览，实时掌握广告业务核心数据
- **目标管理**：设定和跟踪广告收入、MR、RF 等核心目标
- **激励测算**：广告激励政策的测算与模拟
- **经营诊断**：多维度分析广告业务经营状况，支持智能诊断消息下发
- **权限管理**：用户角色管理与权限审批

## 角色体系

系统支持 4 种角色，不同角色看到的数据维度和操作权限不同：

- **平台管理员 (platform_admin)**：全局视角，按区域/总商维度查看，可下钻到城市级
- **广告业务经理 (biz_manager)**：负责区域视角，跟踪城市级经营数据
- **合作商 (partner)**：负责城市视角，管理下属 BD 经营表现
- **BD**：门店级视角，查看门店诊断卡片和 AI 推荐话术

## 技术栈

- React + Vite
- shadcn/ui + Tailwind CSS
- react-router-dom (HashRouter)
- Supabase (数据库)
- 大象消息推送 (NoCode Edge Function)

## 本地开发

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

> **注意**：本项目为 Demo 展示用途，数据库连接和大象推送功能需要配置真实的 Supabase 实例和大象开放平台凭证。

## 项目结构

```
src/
├── components/
│   ├── dashboard/          # 业务组件（KPI卡片、诊断推送弹窗等）
│   ├── ui/                 # shadcn/ui 基础组件
│   └── PermissionGate.jsx  # 权限控制组件
├── config/
│   └── menuConfig.js       # 菜单配置
├── contexts/
│   ├── NoCodeContext.jsx    # NoCode SDK 上下文
│   └── UserContext.jsx      # 用户认证上下文
├── integrations/
│   └── supabase/client.js   # Supabase 客户端
├── layouts/
│   └── AdminLayout.jsx      # 管理后台布局
├── pages/
│   ├── BusinessDiagnosis.jsx   # 经营诊断
│   ├── GoalManagement.jsx      # 目标管理
│   ├── IncentiveCalculation.jsx # 激励测算
│   ├── Login.jsx               # 登录页
│   ├── Overview.jsx            # 首页总览
│   └── PermissionManagement.jsx # 权限管理
├── App.jsx
└── main.jsx
```

## 部署

本项目设计运行在 [NoCode 平台](https://nocode.sankuai.com) 上，部署地址：https://ad-ops-system.mynocode.host

## License

MIT
