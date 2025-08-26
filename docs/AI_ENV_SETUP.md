# AI解读环境配置说明

## 环境配置

### 开发环境
- 使用 `.env.development` 文件配置
- API地址：`http://localhost:3001/api`
- 启动命令：`npm run dev`

### 生产环境
- 使用 `.env.production` 文件配置
- API地址：`https://ai4dh.com/api`
- 构建命令：`npm run build:prod`

## 环境变量

| 变量名 | 开发环境 | 生产环境 | 说明 |
|--------|----------|----------|------|
| VITE_APP_ENV | development | production | 应用环境标识 |
| VITE_API_BASE_URL | http://localhost:3001/api | https://ai4dh.com/api | AI服务API地址 |

## 构建命令

- `npm run dev` - 启动开发服务器
- `npm run build:prod` - 构建生产版本
- `npm run build:dev` - 构建开发版本
- `npm run lint` - 代码质量检查

## 注意事项

1. 环境变量必须以 `VITE_` 开头才能在Vite中正确加载
2. 生产环境构建时会自动使用 `.env.production` 文件
3. 开发环境启动时会自动使用 `.env.development` 文件
4. 修改环境变量后需要重启开发服务器才能生效