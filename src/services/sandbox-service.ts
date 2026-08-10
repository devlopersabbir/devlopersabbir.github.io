/**
 * Sandbox Execution Service
 * 
 * Provides an isolated execution environment for untrusted LLM-generated JavaScript/TypeScript code.
 * 
 * Production vs PoC Sandbox Note:
 * --------------------------------
 * In this client/edge PoC, we use an isolated Web Worker container with a hard execution timeout,
 * restricted scope (no DOM, no window, no process.env, no local storage), and URL validation.
 * 
 * For a full production backend (Node.js API / Cloud service), this sandbox layer should be offloaded to:
 * 1. Docker containers with network policy restrictions (e.g. egress filtering).
 * 2. Firecracker MicroVMs or gVisor sandbox containers (e.g. AWS Lambda / Cloud Run isolate).
 * 3. isolated-vm (V8 isolates with strict memory limit & cpu timeouts).
 */

export interface SandboxResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTimeMs?: number;
}

export const executeInSandbox = async (
  code: string,
  timeoutMs: number = 5000
): Promise<SandboxResult> => {
  const startTime = Date.now();

  // Basic security pre-check: block private IP / internal localhost requests in code strings
  const blockedPatterns = [
    /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)/i,
    /process\.env/i,
    /document\./i,
    /localStorage/i,
    /sessionStorage/i,
    /cookie/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(code)) {
      return {
        success: false,
        error: `Security violation: Generated code attempted to access restricted resources or private network pattern (${pattern}).`,
      };
    }
  }

  // Wrap user code inside an async IIFE inside a Web Worker script string
  const workerCode = `
    self.onmessage = async (e) => {
      const codeToRun = e.data;
      try {
        // Intercept fetch to enforce safe external HTTP requests
        const originalFetch = self.fetch;
        const safeFetch = async (url, options) => {
          const urlString = String(url);
          if (
            /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)/i.test(urlString)
          ) {
            throw new Error("Access to private IP / internal network resource is blocked.");
          }
          return originalFetch(url, options);
        };

        const runner = new Function("fetch", \`
          return (async () => {
            \${codeToRun}
          })();
        \`);

        const result = await runner(safeFetch);
        self.postMessage({ success: true, result });
      } catch (err) {
        self.postMessage({ success: false, error: err.message || String(err) });
      }
    };
  `;

  return new Promise<SandboxResult>((resolve) => {
    let worker: Worker | null = null;
    let timer: any = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (worker) {
        worker.terminate();
        worker = null;
      }
    };

    try {
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);

      timer = setTimeout(() => {
        cleanup();
        resolve({
          success: false,
          error: `Execution timed out after ${timeoutMs}ms (infinite loop or network delay protection).`,
          executionTimeMs: Date.now() - startTime,
        });
      }, timeoutMs);

      worker.onmessage = (e: MessageEvent) => {
        const { success, result, error } = e.data;
        cleanup();
        URL.revokeObjectURL(workerUrl);

        if (success) {
          resolve({
            success: true,
            data: result,
            executionTimeMs: Date.now() - startTime,
          });
        } else {
          resolve({
            success: false,
            error: error || "Sandbox execution failed",
            executionTimeMs: Date.now() - startTime,
          });
        }
      };

      worker.onerror = (e: ErrorEvent) => {
        cleanup();
        URL.revokeObjectURL(workerUrl);
        resolve({
          success: false,
          error: e.message || "Runtime error in worker sandbox",
          executionTimeMs: Date.now() - startTime,
        });
      };

      // Clean up helper if code returns direct expression vs statements
      let cleanedCode = code.trim();
      // If code starts with return statement or is plain block, format cleanly
      if (!cleanedCode.includes("return ") && !cleanedCode.includes("const ") && !cleanedCode.includes("let ")) {
        cleanedCode = `return ${cleanedCode};`;
      }

      worker.postMessage(cleanedCode);
    } catch (err: any) {
      cleanup();
      resolve({
        success: false,
        error: err.message || "Failed to initialize sandbox worker",
        executionTimeMs: Date.now() - startTime,
      });
    }
  });
};
