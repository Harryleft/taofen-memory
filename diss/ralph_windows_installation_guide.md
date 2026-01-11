# Ralph Windows 安装指南

## 诊断结果

你的Windows环境完全准备好安装Ralph了！

- ✅ WSL2 (Ubuntu 24.04) 已安装
- ✅ Git Bash 已安装
- ✅ Node.js v23.1.0 已安装
- ✅ Git 2.45.1 已安装
- ✅ jq 1.8.1 已安装

---

## 方案一：WSL2 安装（推荐）

**优点**：
- 完整功能支持，包括 `ralph --monitor` (tmux集成)
- 原生Bash环境
- 最佳兼容性
- 路径处理更简洁

**缺点**：
- 需要在WSL2环境中工作
- 文件系统有轻微性能开销

### 安装步骤

#### 1. 启动WSL2 Ubuntu

在PowerShell或CMD中运行：

```powershell
wsl
```

或者指定Ubuntu：

```powershell
wsl -d Ubuntu-24.04
```

#### 2. 更新系统并安装依赖

```bash
# 更新包管理器
sudo apt update && sudo apt upgrade -y

# 安装Ralph所需的工具
sudo apt install -y bash jq git tmux curl wget

# Node.js可能在WSL中未安装，检查版本
node --version
# 如果未安装，使用NodeSource仓库安装最新版
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 3. 安装Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

#### 4. 克隆并安装Ralph

```bash
# 进入用户主目录
cd ~

# 克隆Ralph仓库
git clone https://github.com/frankbria/ralph-claude-code.git
cd ralph-claude-code

# 运行安装脚本
./install.sh
```

#### 5. 配置PATH

```bash
# 添加Ralph到PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### 6. 验证安装

```bash
# 检查Ralph是否安装成功
ralph --help

# 应该看到Ralph的帮助信息
```

#### 7. 创建第一个Ralph项目

```bash
# 创建项目
ralph-setup my-first-project

# 进入项目目录
cd my-first-project

# 编辑PROMPT.md，添加你的项目需求
nano PROMPT.md
# 或者使用VSCode: code PROMPT.md

# 启动Ralph（带监控）
ralph --monitor
```

#### 8. tmux监控使用

`ralph --monitor` 会自动创建一个tmux会话：

- **Ctrl+B 然后 D** - 分离会话（Ralph继续运行）
- **Ctrl+B 然后 ←/→** - 在左右面板之间切换
- **重新连接**：
  ```bash
  tmux list-sessions  # 查看会话
  tmux attach -t <session-name>  # 重新连接
  ```

### WSL2文件访问

- Windows访问WSL文件：`\\wsl$\Ubuntu-24.04\home\用户名\`
- WSL访问Windows文件：`/mnt/c/Users/用户名/`

---

## 方案二：Git Bash 安装（功能受限）

**优点**：
- 轻量级，不需要WSL2
- 直接访问Windows文件系统

**缺点**：
- **无法使用 `ralph --monitor`**（没有tmux支持）
- 路径转换问题（`/c/Users/用户名/...`）
- 某些功能可能需要调整

### 安装步骤

#### 1. 打开Git Bash

在开始菜单中搜索 "Git Bash" 并打开

#### 2. 配置Git Bash环境

```bash
# 设置HOME环境变量（如果未设置）
echo 'export HOME="$USERPROFILE"' >> ~/.bashrc
echo 'cd "$HOME"' >> ~/.bashrc

# 添加Node.js和npm到PATH（如果需要）
echo 'export PATH="/c/Program Files/nodejs:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### 3. 验证工具可用性

```bash
# 检查必需工具
node --version
npm --version
git --version
jq --version

# 如果jq未找到，手动下载：
# https://stedolan.github.io/jq/download/
# 将jq.exe放到 C:\Program Files\Git\usr\bin\
```

#### 4. 安装Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

#### 5. 克隆并安装Ralph

```bash
# 进入用户主目录
cd ~

# 克隆Ralph仓库
git clone https://github.com/frankbria/ralph-claude-code.git
cd ralph-claude-code

# 运行安装脚本
bash install.sh
```

#### 6. 配置PATH

```bash
# 添加Ralph到PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### 7. 验证安装

```bash
# 检查Ralph是否安装成功
ralph --help
```

#### 8. 创建第一个Ralph项目

```bash
# 创建项目
ralph-setup my-first-project

# 进入项目目录
cd my-first-project

# 编辑PROMPT.md
notepad PROMPT.md
# 或者使用VSCode: code PROMPT.md

# 启动Ralph（不要使用--monitor，Git Bash不支持）
ralph

# 在另一个Git Bash窗口中运行监控（手动）
cd ~/my-first-project
ralph-monitor
```

### Git Bash的限制

由于Git Bash不支持tmux，你**不能使用** `ralph --monitor`。替代方案：

1. **使用两个Git Bash窗口**：
   - 窗口1：`ralph`
   - 窗口2：`ralph-monitor`

2. **或者使用Windows Terminal**：
   - 安装Windows Terminal
   - 打开多个标签页，分别运行ralph和ralph-monitor

---

## 快速对比

| 特性 | WSL2 方案 | Git Bash 方案 |
|------|-----------|---------------|
| 完整功能 | ✅ | ❌ |
| tmux监控 | ✅ | ❌ |
| 路径简洁 | ✅ (/home/user/) | ❌ (/c/Users/user/) |
| 性能 | ⚠️ (轻微开销) | ✅ (原生) |
| 文件访问 | 需要\\wsl$ | 直接访问 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 常见问题

### Q1: WSL2中Node.js版本太旧？

使用NodeSource仓库安装最新版：

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

### Q2: Git Bash中找不到jq？

1. 下载jq.exe：https://stedolan.github.io/jq/download/
2. 放到 `C:\Program Files\Git\usr\bin\`
3. 重新打开Git Bash

### Q3: 如何在VSCode中编辑WSL文件？

安装VSCode的WSL扩展：

```bash
# 在WSL中
code .

# 或在Windows中打开WSL文件夹
code \\wsl$\Ubuntu-24.04\home\用户名\my-project
```

### Q4: Ralph安装后找不到命令？

确保PATH配置正确：

```bash
# WSL2
echo $PATH | grep .local/bin

# Git Bash
echo $PATH | grep .local/bin

# 如果没有，重新添加
export PATH="$HOME/.local/bin:$PATH"
```

### Q5: 如何卸载Ralph？

```bash
# WSL2 或 Git Bash
cd ~/ralph-claude-code
./install.sh uninstall
```

---

## 下一步

安装完成后：

1. 阅读 [Ralph README](https://github.com/frankbria/ralph-claude-code)
2. 创建你的第一个项目：`ralph-setup my-awesome-project`
3. 编写清晰的 `PROMPT.md`
4. 运行 `ralph --monitor`（WSL2）或 `ralph`（Git Bash）
5. 观察AI开始构建你的项目！

---

## 需要帮助？

- Ralph Issues: https://github.com/frankbria/ralph-claude-code/issues
- Claude Code: https://claude.ai/code
- WSL文档: https://docs.microsoft.com/en-us/windows/wsl/

祝开发愉快！🚀
