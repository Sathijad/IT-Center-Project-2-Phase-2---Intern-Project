import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format:
      logFormat === 'json'
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          ),
  }),
];

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'leave-attendance-api' },
  transports,
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

// Mask PII in production logs
const maskPII = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (process.env.NODE_ENV === 'production') {
    const masked = { ...obj };
    const fieldsToMask = ['email', 'lat', 'lng', 'reason'];
    fieldsToMask.forEach((field) => {
      if (masked[field]) {
        masked[field] = '***masked***';
      }
    });
    return masked;
  }
  return obj;
};

logger.info('Logger initialized', { level: logLevel, format: logFormat });

export default logger;
export { maskPII };

