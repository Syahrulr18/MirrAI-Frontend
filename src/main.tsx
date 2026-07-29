import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/globals.css";

// Suppress noisy Mediapipe C++ WASM logs in the console
const originalWarn = console.warn;
const originalLog = console.log;
const originalInfo = console.info;

const isMediapipeLog = (msg: string) => {
  if (typeof msg !== "string") return false;
  return (
    msg.includes("Sets FaceBlendshapesGraph acceleration") ||
    msg.includes("Feedback manager requires a model") ||
    msg.includes("Using NORM_RECT without IMAGE_DIMENSIONS") ||
    msg.includes("OpenGL error checking is disabled") ||
    msg.includes("Created TensorFlow Lite XNNPACK delegate") ||
    msg.includes("Graph successfully started running") ||
    msg.includes("GL version:") ||
    msg.includes("Graph finished closing successfully") ||
    msg.includes("Successfully destroyed WebGL context")
  );
};

console.warn = (...args) => {
  if (isMediapipeLog(args[0])) return;
  originalWarn(...args);
};

console.log = (...args) => {
  if (isMediapipeLog(args[0])) return;
  originalLog(...args);
};

console.info = (...args) => {
  if (isMediapipeLog(args[0])) return;
  originalInfo(...args);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
