# 智能测评系统 - 使用手册

## 📖 目录

1. [项目简介](#项目简介)
2. [系统要求](#系统要求)
3. [快速开始](#快速开始)
4. [环境配置](#环境配置)
5. [启动服务](#启动服务)
6. [功能说明](#功能说明)
7. [常见问题](#常见问题)
8. [故障排除](#故障排除)

---

## 项目简介

智能测评系统是一个 **AI 驱动的 K12 素质教育测评平台**，覆盖 AIGC / Scratch / Python / C++ / 数理逻辑 五大测评方向。

### 核心功能

- **AI 智能出题** - 根据知识点自动生成高质量测评题目
- **六维度学情分析** - 知识掌握度、逻辑思维、学习潜力、薄弱环节、优势领域、发展建议
- **防作弊监控** - 页面切换检测、答题时间追踪、异常行为标记
- **智能组卷** - 根据知识点分布和难度梯度生成个性化试卷
- **课程推荐** - 基于测评结果智能推荐学习路径和班级
- **数据可视化** - 雷达图、柱状图、环形图多维展示学情数据

### 技术架构

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端 | React + TypeScript + Vite | 18.3 / 5.8 / 6.4 |
| 样式 | Tailwind CSS | 3.4 |
| 后端 | Express | 4.21 |
| 数据库 | SQLite3 | 6.0 |
| 可视化 | Chart.js | 4.5 |
| 状态管理 | Zustand | 5.0 |

---

## 系统要求

### 硬件要求

- **操作系统**: Windows 10/11 或 macOS 或 Linux
- **内存**: 至少 4GB RAM（推荐 8GB）
- **存储**: 至少 2GB 可用空间

### 软件要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **浏览器**: Chrome / Edge / Firefox 最新版本

### 网络要求

- **网络连接**: 需要稳定的互联网连接（用于 AI 功能和资源加载）
- **防火墙**: 允许 Node.js 访问本地端口（5173、8080）

---

## 快速开始

### 步骤 1：克隆项目

```bash
git clone https://github.com/polikm/smart-assessment-system.git
cd smart-assessment-system
```

### 步骤 2：安装依赖

```bash
npm install
```

> **注意**: 如果遇到 `sqlite3` 编译错误，请参考[故障排除](#故障排除)章节。

### 步骤 3：配置环境变量

项目根目录下已包含 `.env` 文件，配置如下：

```env
# 数据库配置
DATABASE_URL=./data.sqlite

# JWT 密钥（生产环境必须修改）
JWT_SECRET=your-secret-key-change-in-production

# AI API Key（可选）
AI_API_KEY=your-ai-api-key

# 服务端口
PORT=8080
```

### 步骤 4：启动服务

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run client:dev  # 前端
npm run server:dev  # 后端
```

### 步骤 5：访问系统

- **前端页面**: http://127.0.0.1:5173
- **后端 API**: http://127.0.0.1:8080

---

## 环境配置

### Windows 用户

#### 防火墙配置

如果遇到网络连接问题，需要添加防火墙规则：

```powershell
# 以管理员身份运行 PowerShell
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="D:\Program Files\nodejs\node.exe" enable=yes
```

#### Hosts 文件配置

确保 `C:\Windows\System32\drivers\etc\hosts` 文件包含：

```
127.0.0.1       localhost
::1             localhost
```

#### 端口配置

默认端口配置：
- 前端：5173
- 后端：8080

如需修改，编辑以下文件：
- `.env` - 修改 `PORT` 变量
- `vite.config.ts` - 修改 `proxy.target`

### macOS/Linux 用户

```bash
# 安装依赖
npm install

# 启动服务
npm run dev
```

---

## 启动服务

### 开发模式

```bash
# 同时启动前后端（推荐）
npm run dev

# 仅启动前端
npm run client:dev

# 仅启动后端
npm run server:dev
```

### 生产模式

```bash
# 构建前端
npm run build

# 预览构建结果
npm run preview
```

### 服务状态检查

```bash
# 检查前端是否运行
curl http://127.0.0.1:5173

# 检查后端 API 是否运行
curl http://127.0.0.1:8080/api
```

---

## 功能说明

### 学生端

#### 登录
- 使用学生账号登录系统
- 默认账号：`student` / `123456`

#### 在线测评
- 选择测评科目（AIGC / Scratch / Python / C++ / 数理逻辑）
- 答题界面支持单选、多选、判断题
- 实时显示答题进度和时间

#### 查看报告
- 六维度能力雷达图
- 详细得分分析
- AI 智能分析建议
- 课程推荐

#### 成长档案
- 历次测评记录
- 能力成长曲线
- 学习进度追踪

#### 通知公告
- 查看教师发布的通知
- 考试安排提醒

### 教师端

#### 登录
- 使用教师账号登录系统
- 默认账号：`teacher` / `123456`

#### 班级管理
- 创建和管理班级
- 添加/移除学生
- 查看班级统计

#### 测评管理
- 创建测评试卷
- 发布测评任务
- 查看学生答题情况

#### 学员管理
- 查看学生基本信息
- 查看学生测评报告
- 导出学生数据

#### 报告管理
- 查看班级整体报告
- 对比分析
- 导出报告

#### 通知管理
- 创建通知模板
- 发布通知给学生
- 查看通知发送记录

### 管理端

#### 登录
- 使用管理员账号登录系统
- 默认账号：`admin` / `admin123`

#### 用户管理
- 创建和管理用户
- 分配角色权限
- 重置用户密码

#### 题库管理
- 添加/编辑/删除题目
- 题目分类管理
- AI 智能出题

#### 测评管理
- 创建测评配置
- 管理测评记录
- 测评统计分析

#### 课程管理
- 添加课程信息
- 课程排期管理
- 课程状态管理

#### 班级管理
- 创建和管理班级
- 分配教师
- 班级统计

#### AI 配置
- 配置 AI API Key
- 管理 AI 智能体
- 查看 AI 使用日志

#### 学情大盘
- 整体数据统计
- 趋势分析
- 多维度对比

#### 证书管理
- 生成学生证书
- 证书模板管理
- 证书查询

#### 知识库
- 管理知识点
- 知识点关联
- 学习路径配置

---

## 常见问题

### Q1: 安装依赖时出现 sqlite3 编译错误

**问题**: `npm install` 时报错 `gyp ERR! find VS`

**解决方案**:

1. 使用预编译版本：
   ```bash
   npm install sqlite3 --build-from-source=false
   ```

2. 或安装 Visual Studio C++ 工具：
   - 下载 [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
   - 安装 "Desktop development with C++" 工作负载

### Q2: 启动服务时出现端口占用错误

**问题**: `Error: listen EADDRINUSE: address already in use`

**解决方案**:

1. 查找占用端口的进程：
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # macOS/Linux
   lsof -i :8080
   ```

2. 终止进程或更换端口：
   ```bash
   # 修改 .env 文件中的 PORT
   PORT=8081
   ```

### Q3: 前端无法连接后端 API

**问题**: 前端页面加载正常，但 API 请求失败

**解决方案**:

1. 检查后端服务是否启动：
   ```bash
   curl http://127.0.0.1:8080/api
   ```

2. 检查 Vite 代理配置：
   ```typescript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'http://127.0.0.1:8080',
         changeOrigin: true
       }
     }
   }
   ```

3. 检查防火墙设置

### Q4: 数据库初始化失败

**问题**: `SQLITE_CANTOPEN: unable to open database file`

**解决方案**:

1. 确保 `data` 目录存在：
   ```bash
   mkdir data
   ```

2. 检查 `.env` 文件中的数据库路径：
   ```env
   DATABASE_URL=./data.sqlite
   ```

3. 确保有文件写入权限

### Q5: AI 功能无法使用

**问题**: AI 出题或报告分析失败

**解决方案**:

1. 检查 AI API Key 配置：
   ```env
   AI_API_KEY=your-actual-api-key
   ```

2. 验证 API Key 有效性
3. 检查网络连接

### Q6: 页面样式异常

**问题**: 页面显示错乱或样式缺失

**解决方案**:

1. 清除浏览器缓存
2. 检查 Tailwind CSS 是否正确加载
3. 重新启动开发服务器：
   ```bash
   npm run client:dev
   ```

---

## 故障排除

### 网络连接问题

#### 症状：`ENOTSOCK: socket operation on non-socket`

**原因**: Windows 防火墙或安全软件阻止了 Node.js 网络访问

**解决方案**:

1. **临时禁用防火墙**（仅用于测试）：
   ```powershell
   netsh advfirewall set allprofiles state off
   ```

2. **添加防火墙规则**：
   ```powershell
   netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="D:\Program Files\nodejs\node.exe" enable=yes
   ```

3. **使用管理员权限运行**：
   - 右键点击 PowerShell
   - 选择"以管理员身份运行"
   - 执行 `npm run dev`

#### 症状：`getaddrinfo EAI_FAIL localhost`

**原因**: hosts 文件中 localhost 解析被禁用

**解决方案**:

1. 编辑 `C:\Windows\System32\drivers\etc\hosts` 文件
2. 取消注释以下行：
   ```
   127.0.0.1       localhost
   ::1             localhost
   ```

### 数据库问题

#### 症状：数据库文件损坏或无法访问

**解决方案**:

1. 使用备份恢复：
   ```bash
   # 项目包含多个备份文件
   cp data.sqlite.backup.20260508 data.sqlite
   ```

2. 重新初始化数据库：
   ```bash
   # 删除现有数据库
   rm data.sqlite
   
   # 重新启动服务器，会自动创建新数据库
   npm run server:dev
   ```

### 依赖问题

#### 症状：`module not found` 或依赖版本冲突

**解决方案**:

1. 清除缓存并重新安装：
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. 检查 Node.js 版本：
   ```bash
   node --version  # 应该 >= 18.0.0
   ```

3. 更新依赖：
   ```bash
   npm update
   ```

### 性能问题

#### 症状：页面加载缓慢或卡顿

**解决方案**:

1. 检查网络连接
2. 清除浏览器缓存
3. 使用生产模式构建：
   ```bash
   npm run build
   npm run preview
   ```

4. 检查数据库查询性能
5. 优化图片和资源加载

---

## 开发指南

### 项目结构

```
smart-assessment-system/
├── api/                    # 后端 API
│   ├── routes/            # 路由模块
│   ├── services/          # 业务逻辑
│   ├── middleware/        # 中间件
│   ├── scripts/           # 数据初始化脚本
│   └── db.ts             # 数据库配置
├── src/                   # 前端源码
│   ├── pages/            # 页面组件
│   │   ├── admin/       # 管理端
│   │   ├── student/     # 学生端
│   │   └── teacher/     # 教师端
│   ├── components/       # 公共组件
│   ├── stores/          # 状态管理
│   └── utils/           # 工具函数
├── public/              # 静态资源
└── tests/               # 测试脚本
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前后端开发服务器 |
| `npm run client:dev` | 仅启动前端开发服务器 |
| `npm run server:dev` | 仅启动后端开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行代码检查 |
| `npm run check` | 运行 TypeScript 类型检查 |

### 测试

```bash
# 运行 API 测试
cd tests
python api_test.py

# 运行完整系统测试
python full_system_test.py

# 运行前端测试
python playwright_test.py
```

---

## 技术支持

### 获取帮助

- **项目文档**: 查看 `README.md`
- **测试报告**: 查看 `tests/` 目录下的测试报告
- **问题反馈**: 提交 Issue 到项目仓库

### 常用资源

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Express 文档](https://expressjs.com/)
- [SQLite 文档](https://www.sqlite.org/docs.html)

---

## 版本信息

- **当前版本**: v2.7
- **最后更新**: 2026-05-19
- **Node.js 要求**: >= 18.0.0

---

## 附录

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 教师 | teacher | 123456 |
| 学生 | student | 123456 |

### 端口说明

| 服务 | 默认端口 | 说明 |
|------|----------|------|
| 前端 | 5173 | Vite 开发服务器 |
| 后端 | 8080 | Express API 服务器 |

### 数据库文件

- **主数据库**: `data/data.sqlite`
- **备份文件**: `data.sqlite.backup.*`

---

**祝您使用愉快！** 🎉