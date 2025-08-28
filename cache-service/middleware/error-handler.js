const logger = require('../lib/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error(`错误: ${error.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  });

  // Mongoose错误处理
  if (err.name === 'CastError') {
    const message = '资源未找到';
    error = new AppError(message, 404);
  }

  // Mongoose重复字段错误
  if (err.code === 11000) {
    const message = '重复字段值';
    error = new AppError(message, 400);
  }

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400);
  }

  // Redis错误处理
  if (err.message.includes('Redis') || err.message.includes('redis')) {
    error = new AppError('缓存服务暂时不可用', 503);
  }

  // 网络错误处理
  if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND') {
    error = new AppError('网络连接失败', 503);
  }

  // 发送错误响应
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
module.exports.AppError = AppError;