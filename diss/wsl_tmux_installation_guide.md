# WSL中安装tmux指南

## 快速安装（Ubuntu/Debian）

```bash
# 1. 更新包管理器
sudo apt update

# 2. 安装tmux
sudo apt install -y tmux

# 3. 验证安装
tmux -V
```

就这么简单！应该会显示类似：`tmux 3.3a`

---

## 如果遇到问题

### 问题1：无法找到tmux包

```bash
# 添加Ubuntu Universe仓库（Ubuntu特定）
sudo add-apt-repository universe
sudo apt update
sudo apt install -y tmux
```

### 问题2：权限被拒绝

```bash
# 确保使用sudo
sudo apt install -y tmux

# 或者切换到root用户
sudo -i
apt install -y tmux
exit
```

### 问题3：包管理器锁定

```bash
# 解除锁定
sudo rm /var/lib/dpkg/lock-frontend
sudo rm /var/lib/dpkg/lock
sudo dpkg --configure -a
sudo apt install -y tmux
```

---

## 安装其他Linux发行版

### Debian
```bash
sudo apt install -y tmux
```

### Fedora
```bash
sudo dnf install -y tmux
```

### Arch Linux
```bash
sudo pacman -S tmux
```

### openSUSE
```bash
sudo zypper install -y tmux
```

---

## tmux基本使用

### 启动和退出

```bash
# 启动新会话
tmux

# 启动命名会话
tmux new -s mysession

# 分离会话（保持后台运行）
# 按 Ctrl+B 然后按 D

# 重新连接会话
tmux attach -t mysession
# 或
tmux a -t mysession

# 杀死会话
tmux kill-session -t mysession
```

### 常用快捷键

所有快捷键都以 `Ctrl+B` 为前缀（称为Prefix键）

```
Ctrl+B 然后 D    - 分离会话
Ctrl+B 然后 C    - 创建新窗口
Ctrl+B 然后 N    - 切换到下一个窗口
Ctrl+B 然后 P    - 切换到上一个窗口
Ctrl+B 然后 ,    - 重命名当前窗口
Ctrl+B 然后 %    - 垂直分割窗口
Ctrl+B 然后 "    - 水平分割窗口
Ctrl+B 然后 ←/→  - 在分割面板之间切换
Ctrl+B 然后 [    - 进入复制模式（可以滚动）
Ctrl+B 然后 ]    - 粘贴
Ctrl+B 然后 ?    - 显示所有快捷键帮助
```

### 会话管理

```bash
# 列出所有会话
tmux ls
# 或
tmux list-sessions

# 强制杀死所有会话
tmux kill-server

# 查看某个会话的详细信息
tmux show-options -g
```

---

## 配置tmux（可选）

创建配置文件：

```bash
# 创建配置文件
nano ~/.tmux.conf
```

推荐的配置内容：

```bash
# 设置鼠标模式（可以用鼠标切换面板、调整大小）
set -g mouse on

# 设置默认终端模式为256色
set -g default-terminal "screen-256color"

# 设置窗口和面板索引从1开始（更符合键盘布局）
set -g base-index 1
setw -g pane-base-index 1

# 更容易记的快捷键：使用Ctrl+A代替Ctrl+B
# unbind C-b
# set -g prefix C-a
# bind C-a send-prefix

# 重载配置文件
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# 启用vi模式键
setw -g mode-keys vi

# 状态栏美化
set -g status-bg black
set -g status-fg white
set -g status-interval 60
set -g status-left-length 30
set -g status-left '#[fg=green](#S) #(whoami) '
set -g status-right '#[fg=yellow]#(cut -d " " -f 1-3 /proc/loadavg)#[default] #[fg=white]%H:%M#[default]'
```

保存后，重载配置：

```bash
# 在tmux会话中按
Ctrl+B 然后 :source-file ~/.tmux.conf

# 或在命令行
tmux source-file ~/.tmux.conf
```

---

## tmux与Ralph使用

### 使用Ralph的--monitor选项

```bash
# Ralph会自动创建tmux会话
ralph --monitor
```

这会创建：
- **左面板**：Ralph循环执行
- **右面板**：实时监控仪表板

### 手动监控（备选方案）

如果不使用`--monitor`：

```bash
# 终端1：启动Ralph
cd ~/vibe_coding/taofen_web
ralph

# 终端2：启动监控
cd ~/vibe_coding/taofen_web
ralph-monitor
```

或者手动创建tmux会话：

```bash
# 创建水平分割的会话
tmux new-session -s ralph \; split-window -h -c '#{pane_current_path}' \;

# 在左面板运行Ralph
ralph

# 切换到右面板（Ctrl+B 然后 →）
ralph-monitor
```

---

## 常见问题

### Q: 如何在tmux中滚动查看历史输出？

```
1. 按 Ctrl+B 然后 [
2. 使用方向键或Page Up/Down滚动
3. 按 q 退出滚动模式
```

或者启用鼠标模式后直接用鼠标滚轮。

### Q: 如何调整面板大小？

```bash
# 启用鼠标模式后，直接拖动边框

# 或使用快捷键（在前面按Ctrl+B）:
:resize-pane -D 10    # 向下扩大当前面板10行
:resize-pane -U 10    # 向上扩大当前面板10行
:resize-pane -L 10    # 向左扩大当前面板10列
:resize-pane -R 10    # 向右扩大当前面板10列
```

### Q: 如何在面板之间复制粘贴？

```bash
# 启用鼠标模式后，直接用鼠标选择和复制

# 或使用vi模式：
# 1. Ctrl+B 然后 [ 进入复制模式
# 2. 空格开始选择
# 3. 移动光标选择文本
# 4. Enter复制
# 5. Ctrl+B 然后 ] 粘贴
```

### Q: tmux会话丢失了怎么办？

```bash
# 查看所有会话
tmux ls

# 重新连接
tmux attach -t <session-name>

# 如果不确定名称，直接attach到最后一个
tmux attach
```

---

## 下一步

安装完成后：

```bash
# 1. 验证tmux工作正常
tmux -V

# 2. 启动一个测试会话
tmux new -s test

# 3. 试试分割窗口（Ctrl+B 然后 "）
# 4. 分离会话（Ctrl+B 然后 D）
# 5. 重新连接
tmux attach -t test

# 6. 删除测试会话
tmux kill-session -t test
```

现在你可以使用 `ralph --monitor` 了！🚀
