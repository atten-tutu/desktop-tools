/* eslint-disable no-console */
import { styleText } from "util";
import type { StartsWith } from "./typeTool.ts";

type LogLevel = "info" | "success" | "warning" | "error" | "debug" | "start";

type BasicStyleTextParams = Extract<Parameters<typeof styleText>[0], string>;
type BG = StartsWith<BasicStyleTextParams, "bg">;
interface LogStyle {
  text: Exclude<BasicStyleTextParams, BG>[];
  bg?: BG;
}

const LOG_STYLES: Record<LogLevel, LogStyle> = {
  info: {
    text: ["blueBright", "bold"],
  },
  success: {
    text: ["green", "bold"],
  },
  warning: {
    text: ["yellowBright", "bold"],
    bg: "bgBlack",
  },
  error: {
    text: ["white", "bold"],
    bg: "bgRed",
  },
  debug: {
    text: ["magentaBright", "bold"],
  },
  start: {
    text: ["cyanBright", "bold", "underline"],
  },
};

function pad(str: string, length: number, char = " ") {
  return str.padStart((str.length + length) / 2, char).padEnd(length, char);
}

/**
 * Base logging function that applies consistent styling
 */
function logWithStyle(level: LogLevel, message: string, prefix?: string) {
  if (process.env.NODE_ENV === "production") {
    switch (level) {
      case "error":
        console.error(message);
        break;
      case "warning":
        console.warn(message);
        break;
      case "debug":
        console.debug(message);
        break;
      case "info":
        console.info(message);
        break;
      default:
        console.log(message);
        break;
    }
    return;
  }
  const style = LOG_STYLES[level];
  const timestamp = new Date().toLocaleTimeString();
  const formattedMessage = prefix
    ? `[${timestamp}] ${prefix} ${message}`
    : `[${timestamp}] ${message}`;
  const styles: BasicStyleTextParams[] = style.text;
  if (style.bg) {
    styles.unshift(style.bg);
  }
  console.log(styleText(styles, pad(level.toUpperCase(), 9)), formattedMessage);
}

/**
 * Log an informational message
 */
export function logInfo(message: string) {
  logWithStyle("info", message, "📘");
}

/**
 * Log a success message
 */
export function logSuccess(message: string) {
  logWithStyle("success", message, "✨");
}

/**
 * Log a warning message
 */
export function logWarning(message: string) {
  logWithStyle("warning", message, "⚠️");
}

/**
 * Log an error message
 */
export function logError(message: string, error?: unknown) {
  logWithStyle("error", message, error ? `${error}` : "💥");
}

/**
 * Log a debug message (only in development)
 */
export function logDebug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    logWithStyle("debug", message, "🔧");
  }
}

/**
 * Log a process start message
 */
export function logStart(message: string) {
  logWithStyle("start", message, "🚀");
}

/**
 * Log a process completion message
 */
export function logComplete(message: string) {
  logWithStyle("success", message, "✅");
}

/**
 * Create a task logger that logs start and completion
 */
export async function withTaskLog<T>(
  taskName: string,
  task: () => Promise<T>,
): Promise<T> {
  try {
    logStart(`${taskName}...`);
    const result = await task();
    logSuccess(`${taskName} completed successfully!`);
    return result;
  } catch (error) {
    logError(`${taskName} failed!`, error);
    throw error;
  }
}

export function logUtilsTest() {
  logInfo("Utils test");
  logSuccess("Utils test");
  logWarning("Utils test");
  logError("Utils test");
  logDebug("Utils test");
  logStart("Utils test");
  logComplete("Utils test");
}