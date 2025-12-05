// src/utils/realSocket.js
import { io } from "socket.io-client";

export function createRealSocket(onMessage, role) {

  const SERVER_MAP = {
    EV: "http://192.168.0.34:5000",
    AV1: "http://192.168.0.118:5001",
    AV2: "http://192.168.0.7:5002",
    CONTROL: "http://192.168.0.119:5003",
  };

  const targetServer = SERVER_MAP[role];
  const socket = io(targetServer, {
    transports: ["websocket"],
  });

  //------------------------------------------------------
  // 🔥 소켓 연결
  //------------------------------------------------------
  socket.on("connect", () => {
    console.log(`[REAL SOCKET] Connected to ${targetServer} (role=${role})`);
    socket.emit("register", { role });
  });

  socket.on("disconnect", () => {
    console.log("[REAL SOCKET] Disconnected");
  });

  //------------------------------------------------------
  // 🔥 1) EV 서버에서 받는 이벤트
  //------------------------------------------------------
  if (role === "EV") {
    socket.on("ev_state", (state) => {
      console.log("[REAL SOCKET] EV SELF STATE:", state);

      onMessage({
        type: "EV",
        data: state,
      });
    });
  }

  //------------------------------------------------------
  // 🔥 2) AV1 서버에서 받는 이벤트
  //------------------------------------------------------
  if (role === "AV1") {
    socket.on("av1_state", (state) => {
      console.log("[REAL SOCKET] AV1 SELF STATE:", state);

      onMessage({
        type: "AV1",
        data: state,
      });
    });
  }

  //------------------------------------------------------
  // 🔥 3) AV2 서버에서 받는 이벤트
  //------------------------------------------------------
  if (role === "AV2") {
    socket.on("av2_state", (state) => {
      console.log("[REAL SOCKET] AV2 SELF STATE:", state);

      onMessage({
        type: "AV2",
        data: state,
      });
    });
  }

  //------------------------------------------------------
  // 🔥 4) CONTROL 서버에서 받는 stage_update
  //------------------------------------------------------
  if (role === "CONTROL") {
    socket.on("stage_update", (packet) => {
      console.log("[REAL SOCKET] CONTROL STAGE UPDATE:", packet);

      onMessage({
        type: "STAGE",
        data: packet,
      });
    });
  }

  //------------------------------------------------------
  // 🔥 (옵션) — 모든 서버에서 vehicle_state, status_all 받기
  //------------------------------------------------------
  socket.on("vehicle_state", (packet) => {
    onMessage({
      type: packet.id,
      data: packet.state,
    });
  });

  socket.on("status_all", (allState) => {
    Object.keys(allState).forEach((key) => {
      onMessage({
        type: key,
        data: allState[key],
      });
    });
  });

  return socket;
}
