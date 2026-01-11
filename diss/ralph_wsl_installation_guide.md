# WSL中Ralph永久安装指南

## 📋 前提条件检查

在安装Ralph之前，确保你的WSL环境满足以下要求：

### 1. 检查已安装的依赖

```bash
# 检查Bash版本（需要4.0+）
bash --version

# 检查Node.js和npm
node --version
npm --version

# 检查Git
git --version

# 检查jq（JSON处理工具）
jq --version

# 检查tmux
tmux -V
```

### 2. 安装Claude Code CLI

```bash
# 全局安装Claude Code
npm install -g @anthropic-ai/claude-code

# 验证安装
claude --version
```

### 3. 安装缺失的依赖（如果需要）

```bash
# 更新包管理器
sudo apt update

# 安装jq
sudo apt install -y jq

# 安装tmux
sudo apt install -y tmux

# 安装Bash（如果版本过低）
sudo apt install -y bash
```

---

## 🚀 Ralph安装步骤

### 步骤1: 克隆Ralph仓库

```bash
# 克隆到临时目录
cd /tmp
git clone https://github.com/frankbria/ralph-claude-code.git
cd ralph-claude-code
```

### 步骤2: 执行安装脚本

```bash
# 运行安装脚本
./install.sh
```

这个脚本会：
- 在 `~/.ralph/` 创建Ralph主目录
- 将 `ralph`、`ralph-monitor`、`ralph-setup` 命令添加到你的PATH
- 创建必要的配置文件和目录结构
- 安装到 `/usr/local/bin/` 或添加到 `~/.bashrc`

### 步骤3: 验证安装

```bash
# 重新加载shell配置
source ~/.bashrc

# 检查Ralph命令是否可用
ralph --help

# 查看Ralph版本
ralph --status
```

如果命令可以正常运行，说明安装成功！

---

## 🧹 清理安装文件（可选）

安装完成后，你可以删除临时克隆的仓库：

```bash
cd /tmp
rm -rf ralph-claude-code
```

---

## ✅ 永久性说明

### 为什么这是永久安装？

1. **全局命令**: Ralph的命令已添加到系统PATH中
2. **Shell配置**: 安装脚本修改了 `~/.bashrc`，每次启动终端都会加载
3. **独立目录**: Ralph的主文件在 `~/.ralph/`，不受临时文件影响
4. **可执行链接**: 脚本链接到 `/usr/local/bin/` 或在PATH中

### 验证永久性

```bash
# 关闭当前终端，打开新的终端
# 然后直接运行：
ralph --help

# 如果命令可用，说明安装是永久的
```

---

## 🎯 使用Ralph

### 为新项目设置Ralph

```bash
# 创建新的Ralph项目
ralph-setup my-awesome-project
cd my-awesome-project

# 编辑项目需求
nano PROMPT.md          # 主要开发指令
nano @fix_plan.md       # 优先任务列表
nano @AGENT.md          # 构建和运行指令

# 启动Ralph循环（带监控）
ralph --monitor
```

### 在现有项目中使用Ralph

```bash
cd your-existing-project

# 如果有PRD文档，导入它
ralph-import requirements.md project-name
cd project-name

# 或手动初始化
ralph-setup .
# 然后配置PROMPT.md等文件

# 启动Ralph
ralph --monitor
```

### tmux监控快捷键

在Ralph监控会话中：
- `Ctrl+B` 然后 `D` - 分离会话（Ralph继续运行）
- `Ctrl+B` 然后 `←/→` - 在面板间切换
- `tmux list-sessions` - 查看活动会话
- `tmux attach -t <session-name>` - 重新连接到会话

---

## 🔧 常用配置

### 修改调用限制

```bash
# 设置每小时最多50次API调用
ralph --calls 50 --monitor
```

### 设置超时时间

```bash
# 设置30分钟执行超时
ralph --timeout 30 --monitor
```

### 详细输出模式

```bash
# 显示详细进度
ralph --verbose --monitor
```

---

## 📊 监控和调试

### 查看状态

```bash
# JSON格式状态输出
ralph --status

# 手动查看日志
tail -f ~/.ralph/logs/ralph.log

# 使用监控仪表板
ralph-monitor
```

### 检查Ralph目录结构

```bash
# 查看Ralph主目录
ls -la ~/.ralph/

# 典型输出：
# drwxr-xr-x  ralph_loop.sh      # 主循环脚本
# drwxr-xr-x  lib/               # 库文件
# drwxr-xr-x  logs/              # 执行日志
# drwxr-xr-x  projects/          # 项目模板
```

---

## 🛠️ 卸载Ralph

如果需要卸载Ralph：

```bash
# 重新运行安装脚本并传递uninstall参数
cd /tmp/ralph-claude-code  # 或重新克隆
./install.sh uninstall

# 手动清理（如果自动卸载失败）
rm -rf ~/.ralph
rm /usr/local/bin/ralph
rm /usr/local/bin/ralph-monitor
rm /usr/local/bin/ralph-setup
```

---

## 🐛 常见问题

### 问题1: 命令未找到

**症状**: 运行 `ralph` 时提示 "command not found"

**解决方案**:
```bash
# 重新加载shell配置
source ~/.bashrc

# 如果还是不行，手动添加到PATH
echo 'export PATH="$HOME/.ralph:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 问题2: 权限被拒绝

**症状**: 运行 `./install.sh` 时提示 "Permission denied"

**解决方案**:
```bash
# 添加执行权限
chmod +x ./install.sh
./install.sh
```

### 问题3: Claude Code未安装

**症状**: 提示找不到claude命令

**解决方案**:
```bash
# 安装Claude Code CLI
npm install -g @anthropic-ai/claude-code
```

### 问题4: tmux会话丢失

**症状**: 无法重新连接到Ralph监控会话

**解决方案**:
```bash
# 列出所有活动会话
tmux list-sessions

# 重新连接到特定会话
tmux attach -t ralph-monitor
```

### 问题5: API限制

**症状**: 遇到5小时API限制

**解决方案**: Ralph会自动检测并提示你选择等待或退出。你可以在配置中调整限制阈值。

---

## 📚 更多资源

- **Ralph GitHub**: https://github.com/frankbria/ralph-claude-code
- **Claude Code文档**: https://docs.anthropic.com/claude-code
- **tmux快捷键**: https://github.com/tmux/tmux/wiki

---

## ✨ 安装成功标志

如果你能成功运行以下命令，说明Ralph已正确安装：

```bash
ralph --help
ralph-setup test-project
cd test-project
ralph --status
```

祝使用愉快！🚀
