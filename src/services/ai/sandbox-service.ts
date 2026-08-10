/**
 * Sandbox Execution Service (PROTOTYPE IMPLEMENTATION)
 */

export interface SandboxResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTimeMs?: number;
}

/**
 * Clean and sanitize code received from LLM JSON response
 */
export const cleanCodeString = (code: string): string => {
  if (!code) return "";
  let cleaned = code.trim();

  // Strip markdown code fences if present at start/end
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:javascript|js|typescript|ts)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  // Remove trailing markdown code fences if still left over
  cleaned = cleaned.replace(/\s*```$/i, "").trim();

  // Ensure code returns a value if no explicit return statement exists
  if (!/\breturn\b/.test(cleaned)) {
    if (/\b(const|let|var)\s+data\s*=/.test(cleaned)) {
      cleaned += "\nreturn typeof data !== 'undefined' ? data : null;";
    } else if (/\b(const|let|var)\s+res(ponse)?\s*=/.test(cleaned)) {
      cleaned += "\nreturn typeof response !== 'undefined' ? response : (typeof res !== 'undefined' ? res : null);";
    }
  }

  // If code is on a single line with semicolons, format it into clean multiline JS statements
  if (!cleaned.includes("\n") && cleaned.includes(";")) {
    const stmts = cleaned
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (stmts.length > 1) {
      cleaned = stmts.map((s) => (s.endsWith("}") || s.endsWith("{") ? s : s + ";")).join("\n");
    }
  }

  return cleaned;
};

export const executeInSandbox = async (
  code: string,
  timeoutMs: number = 5000
): Promise<SandboxResult> => {
  const startTime = Date.now();
  const cleanedCode = cleanCodeString(code);

  console.log("[SANDBOX DEBUG] Raw Input Code:", JSON.stringify(code));
  console.log("[SANDBOX DEBUG] Sanitized Code:", JSON.stringify(cleanedCode));

  // Basic security pre-check: block private IP / internal localhost requests in code strings
  const blockedPatterns = [
    /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|169\.254\.169\.254)/i,
    /process\.env/i,
    /document\./i,
    /localStorage/i,
    /sessionStorage/i,
    /cookie/i,
    /eval\s*\(/i,
    /require\s*\(/i,
    /import\s*\(/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(cleanedCode)) {
      const securityErr = `Security violation: Generated code attempted to access restricted resources or private network pattern (${pattern}).`;
      console.error("[SANDBOX SECURITY ERROR]:", securityErr);
      return {
        success: false,
        error: securityErr,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  // Try direct in-browser AsyncFunction execution first with safe scope fallback
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

    const originalFetch = globalThis.fetch;
    const safeFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
      const urlString = String(url);
      if (
        /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|169\.254\.169\.254)/i.test(urlString)
      ) {
        throw new Error("Access to private IP / internal network resource is blocked.");
      }
      return originalFetch(url, options);
    };

    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
      warn: (...args: any[]) => logs.push("[WARN] " + args.map(a => String(a)).join(" ")),
      error: (...args: any[]) => logs.push("[ERROR] " + args.map(a => String(a)).join(" "))
    };

    const runner = new AsyncFunction("fetch", "console", cleanedCode);
    let result = await runner(safeFetch, customConsole);

    if ((result === undefined || result === null) && logs.length > 0) {
      result = logs.join("\n");
    }

    console.log("[SANDBOX DIRECT EXECUTION SUCCESS]:", result);
    return {
      success: true,
      data: result,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    console.error("[SANDBOX DIRECT EXECUTION ERROR]:", err);
    return {
      success: false,
      error: err?.message || String(err),
      executionTimeMs: Date.now() - startTime,
    };
  }
};
