# 配置GLM Coding Plan（智谱AI）指南

## 当前情况

你现在的环境变量：
```bash
ANTHROPIC_BASE_URL=https://pmpjfbhq.cn-nb1.rainapp.top  # ❌ 旧的中转站，不能用了
ANTHROPIC_AUTH_TOKEN=sk-HYCF4hCOIsYi8Izk50i8zxplrBgdRQRc6cr1EVjHHAe67F89
```

需要切换到智谱AI的GLM Coding Plan。

---

## 步骤1：获取智谱AI API密钥

### 访问智谱AI开放平台
1. 打开：https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入API密钥页面
4. 创建新的API密钥

### 保存API密钥
- 将API密钥保存到安全的地方
- 格式类似：`your-api-key-here`

---

## 步骤2：配置环境变量（推荐方式）

### 方案A：临时配置（当前终端会话）

```bash
# 在WSL2中执行
export ANTHROPIC_AUTH_TOKEN="你的智谱AI_API密钥"
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"

# 验证配置
env | grep ANTHROPIC
```

### 方案B：永久配置（推荐）

编辑 `~/.bashrc` 文件：

```bash
# 打开配置文件
nano ~/.bashrc

# 在文件末尾添加以下内容
export ANTHROPIC_AUTH_TOKEN="你的智谱AI_API密钥"
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"

# 保存并退出（Ctrl+X, Y, Enter）

# 重新加载配置
source ~/.bashrc

# 验证配置
env | grep ANTHROPIC
```

---

## 步骤3：配置GLM模型

### 创建/修改Claude Code配置文件

```bash
# 创建配置目录（如果不存在）
mkdir -p ~/.claude

# 编辑配置文件
nano ~/.claude/settings.json
```

添加以下内容：

```json
{
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
  }
}
```

### 验证JSON格式

```bash
# 使用Python验证JSON格式（如果有Python）
python3 -m json.tool ~/.claude/settings.json

# 或者使用在线工具验证
# https://jsonlint.com/
```

---

## 步骤4：测试配置

### 关闭所有Claude Code进程

```bash
# 杀死所有claude进程
pkill claude

# 或者查找并手动杀死
ps aux | grep claude
```

### 打开新的终端窗口

```bash
# 启动新的WSL会话
wsl

# 验证环境变量
env | grep ANTHROPIC

# 应该看到：
# ANTHROPIC_AUTH_TOKEN=你的智谱AI_API密钥
# ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
```

### 启动Claude Code

```bash
# 进入项目目录
cd ~/vibe_coding/taofen_web

# 启动Claude Code
claude

# 在Claude Code中输入：
/status

# 应该显示使用的模型是GLM-4.7
```

---

## 步骤5：验证Ralph能够使用

### 快速测试

```bash
# 确保在项目目录
cd ~/vibe_coding/taofen_web

# 创建一个简单的测试
echo "请输出：Hello from GLM-4.7" | claude

# 看看输出是否正常
```

### 启动Ralph

```bash
# 如果上面测试成功，启动Ralph
ralph --monitor
```

---

## 完整配置脚本

为了方便，我为你创建了一个自动化配置脚本：

```bash
#!/bin/bash
# GLM Coding Plan 配置脚本

echo "=== 配置GLM Coding Plan ==="
echo ""

# 输入API密钥
read -p "请输入你的智谱AI API密钥: " API_KEY

if [ -z "$API_KEY" ]; then
    echo "错误：API密钥不能为空"
    exit 1
fi

# 设置环境变量
export ANTHROPIC_AUTH_TOKEN="$API_KEY"
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"

# 添加到~/.bashrc
echo "" >> ~/.bashrc
echo "# GLM Coding Plan 配置" >> ~/.bashrc
echo "export ANTHROPIC_AUTH_TOKEN=\"$API_KEY\"" >> ~/.bashrc
echo "export ANTHROPIC_BASE_URL=\"https://open.bigmodel.cn/api/paas/v4/\"" >> ~/.bashrc

# 创建Claude配置目录
mkdir -p ~/.claude

# 创建配置文件
cat > ~/.claude/settings.json << 'EOF'
{
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7"
  }
}
EOF

echo ""
echo "✅ 配置完成！"
echo ""
echo "请执行以下命令使配置生效："
echo "  source ~/.bashrc"
echo ""
echo "然后运行以下命令验证："
echo "  env | grep ANTHROPIC"
echo "  claude"
echo ""
echo "在Claude Code中输入："
echo "  /status"
echo ""
```

保存为 `setup_glm_coding_plan.sh`，然后运行：

```bash
bash setup_glm_coding_plan.sh
```

---

## 故障排查

### 问题1：配置不生效

**解决方案：**

```bash
# 1. 关闭所有Claude Code进程
pkill -9 claude

# 2. 删除旧配置
rm -f ~/.claude/settings.json

# 3. 重新配置
source ~/.bashrc

# 4. 重新启动Claude Code
claude
```

### 问题2：API调用失败

**检查：**

```bash
# 验证API密钥
curl -X POST https://open.bigmodel.cn/api/paas/v4/chat/completions \
  -H "Authorization: Bearer $ANTHROPIC_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-4.7","messages":[{"role":"user","content":"测试"}]}'
```

### 问题3：模型切换不成功

**验证配置文件：**

```bash
# 查看配置文件
cat ~/.claude/settings.json

# 在Claude Code中检查
claude
# 然后输入：/status

# 应该显示使用的是GLM-4.7
```

### 问题4：JSON格式错误

**使用工具验证：**

```bash
# 在线验证
# https://jsonlint.com/

# 或使用Python
python3 -m json.tool ~/.claude/settings.json
```

---

## 验证清单

配置完成后，确保以下所有项都通过：

- [ ] 环境变量 `ANTHROPIC_AUTH_TOKEN` 已设置
- [ ] 环境变量 `ANTHROPIC_BASE_URL` 指向智谱AI
- [ ] `~/.claude/settings.json` 文件存在且格式正确
- [ ] 运行 `claude` 能够正常启动
- [ ] 在Claude Code中输入 `/status` 显示GLM-4.7
- [ ] 简单测试能够正常响应
- [ ] Ralph能够正常调用

---

## 注意事项

1. **API密钥安全**
   - 不要将API密钥提交到Git
   - 不要分享给他人
   - 定期更换密钥

2. **配置文件位置**
   - WSL2：`~/.claude/settings.json`
   - Windows（Git Bash）：`~/.claude/settings.json`

3. **模型选择**
   - `glm-4.5-air`：快速、经济（Haiku级别）
   - `glm-4.7`：平衡（Sonnet/Opus级别）
   - 根据需求选择合适的模型

4. **API限制**
   - 注意智谱AI的API调用限制
   - 监控使用量
   - 避免超出配额

---

## 下一步

配置完成后：

```bash
# 1. 重新加载配置
source ~/.bashrc

# 2. 验证配置
env | grep ANTHROPIC

# 3. 测试Claude Code
claude

# 4. 在Claude Code中验证模型
/status

# 5. 退出Claude Code
exit

# 6. 启动Ralph
cd ~/vibe_coding/taofen_web
ralph --monitor
```

现在你应该可以使用GLM-4.7了！🚀
