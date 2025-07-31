import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as path from 'path';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}${stack ? `\n${stack}` : ''}`;
    }),
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'error.log') }),
  ],
});
