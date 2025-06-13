/**
 * Log an informational message
 */
export declare function logInfo(message: string): void;
/**
 * Log a success message
 */
export declare function logSuccess(message: string): void;
/**
 * Log a warning message
 */
export declare function logWarning(message: string): void;
/**
 * Log an error message
 */
export declare function logError(message: string, error?: unknown): void;
/**
 * Log a debug message (only in development)
 */
export declare function logDebug(message: string): void;
/**
 * Log a process start message
 */
export declare function logStart(message: string): void;
/**
 * Log a process completion message
 */
export declare function logComplete(message: string): void;
/**
 * Create a task logger that logs start and completion
 */
export declare function withTaskLog<T>(taskName: string, task: () => Promise<T>): Promise<T>;
export declare function logUtilsTest(): void;
