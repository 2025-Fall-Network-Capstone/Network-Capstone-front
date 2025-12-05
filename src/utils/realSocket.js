// src/utils/realSocket.js
import { io } from "socket.io-client";

export function createRealSocket(onMessage, role) {
  const socket = io("http://192.168.0.119:5003", {
    transports: ["websocket"],
  });

  // --- 연결 ---
  socket.on("connect", () => {
    console.log("[REAL SOCKET] Connected to CONTROL");

    // 접속 시 role 등록
    socket.emit("register", { role });
  });

  socket.on("disconnect", () => {
    console.log("[REAL SOCKET] Disconnected from CONTROL");
  });

  socket.on("error", (msg) => {
    console.warn("[REAL SOCKET ERROR]", msg);
  });

  // ===================================================
  // 1) vehicle_update → EV / AV1 / AV2 상태 업데이트
  // ===================================================
  socket.on("vehicle_update", (packet) => {
    /*
      packet 구조:
      {
        id: "EV" | "AV1" | "AV2",
        state: { speed, lane_change, position, ... }
      }
    */

    const { id, state } = packet;

    console.log(`[REAL SOCKET] ${id} STATE:`, state);

    onMessage({
      type: id, // "EV" / "AV1" / "AV2"
      data: state,
    });
  });

  // ===================================================
  // 2) status_all → 전체 차량 상태 한번에 수신
  // ===================================================
  socket.on("status_all", (allState) => {
    // allState = { EV: {...}, AV1: {...}, AV2: {...} }

    console.log("[REAL SOCKET] ALL STATE:", allState);

    Object.keys(allState).forEach((key) => {
      onMessage({
        type: key,
        data: allState[key],
      });
    });
  });

  // ===================================================
  // 3) stage_update → 전체 글로벌 Stage 업데이트
  // ===================================================
  socket.on("stage_update", (packet) => {
    console.log("[REAL SOCKET] STAGE UPDATE:", packet);

    onMessage({
      type: "STAGE",
      data: packet,
    });
  });

  return socket;
}
