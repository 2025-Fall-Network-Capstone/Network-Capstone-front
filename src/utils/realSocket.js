// src/utils/realSocket.js
import { io } from "socket.io-client";

export function createRealSocket(onMessage, role) {
  // CONTROL 서버 주소 — 필요하면 config에서 가져오게 수정 가능
  const socket = io("http://127.0.0.1:5000", {
    transports: ["websocket"]
  });

  socket.on("connect", () => {
    console.log("[REAL SOCKET] Connected to CONTROL server");
  });

  // EV에서 보내는 메시지 받기
  socket.on("ev_state", (data) => {
    console.log("[REAL SOCKET] EV STATE:", data);
    onMessage({ type: "EV", data });
  });

  // AV1에서 보내는 메시지 받기
  socket.on("av1_state", (data) => {
    console.log("[REAL SOCKET] AV1 STATE:", data);
    onMessage({ type: "AV1", data });
  });

  // AV2에서 보내는 메시지 받기
  socket.on("av2_state", (data) => {
    console.log("[REAL SOCKET] AV2 STATE:", data);
    onMessage({ type: "AV2", data });
  });

  socket.on("disconnect", () => {
    console.log("[REAL SOCKET] Disconnected from CONTROL");
  });

  return () => {
    socket.disconnect();
  };
}
