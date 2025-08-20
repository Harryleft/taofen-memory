FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY backend/package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制应用代码
COPY backend/ .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改文件所有权
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "server.js"]
