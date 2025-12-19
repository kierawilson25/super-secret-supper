type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private sensitiveKeys = ['password', 'token', 'email', 'session', 'key', 'secret', 'auth'];

  private sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) return data;

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      if (this.sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        (sanitized as Record<string, unknown>)[key] = '[REDACTED]';
      } else if (typeof (sanitized as Record<string, unknown>)[key] === 'object') {
        (sanitized as Record<string, unknown>)[key] = this.sanitize((sanitized as Record<string, unknown>)[key]);
      }
    }

    return sanitized;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (this.isProduction && level === 'debug') return;

    const sanitizedContext = context ? this.sanitize(context) : undefined;

    if (this.isProduction) {
      // TODO: Send to logging service (e.g., Sentry, LogRocket, Datadog)
      // this.sendToLoggingService(level, message, sanitizedContext);
      return;
    }

    // Development only - log to console
    const timestamp = new Date().toISOString();
    const logData = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    switch (level) {
      case 'error':
        console.error(logData, sanitizedContext || '');
        break;
      case 'warn':
        console.warn(logData, sanitizedContext || '');
        break;
      default:
        console.log(logData, sanitizedContext || '');
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
