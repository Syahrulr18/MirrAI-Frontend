/**
 * Suppresses TensorFlow Lite WASM INFO messages from MediaPipe
 * that spam the console during model initialization.
 * 
 * These messages ("INFO: Created TensorFlow Lite XNNPACK delegate for CPU.")
 * come from MediaPipe's WASM binary through emscripten's put_char/write.
 * They write to stderr/stdout which triggers console output.
 */

const TF_LITE_PATTERNS = [
  "Created TensorFlow Lite",
  "XNNPACK delegate",
  "Initialized TensorFlow Lite",
  "TfLiteXNNPack",
];

let isPatched = false;

export function suppressMediaPipeWasmLogs() {
  if (isPatched) return;
  isPatched = true;

  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalLog = console.log;
  const originalError = console.error;
  const originalDebug = console.debug;
  const originalTrace = console.trace;

  const shouldSuppress = (...args: any[]): boolean => {
    const message = args.map(String).join(" ");
    return TF_LITE_PATTERNS.some((pattern) => message.includes(pattern));
  };

  console.warn = (...args: any[]) => {
    if (!shouldSuppress(...args)) originalWarn.apply(console, args);
  };

  console.info = (...args: any[]) => {
    if (!shouldSuppress(...args)) originalInfo.apply(console, args);
  };

  console.log = (...args: any[]) => {
    if (!shouldSuppress(...args)) originalLog.apply(console, args);
  };

  console.error = (...args: any[]) => {
    if (!shouldSuppress(...args)) originalError.apply(console, args);
  };

  console.debug = (...args: any[]) => {
    if (!shouldSuppress(...args)) originalDebug.apply(console, args);
  };

  console.trace = (...args: any[]) => {
    if (!shouldSuppress(...args)) originalTrace.apply(console, args);
  };
}
