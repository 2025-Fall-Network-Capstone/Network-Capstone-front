// src/utils/realSocket.js
import { io } from "socket.io-client";

export function createRealSocket(onMessage, role) {
  //------------------------------------------------------
  // 1) 각 기기의 고유 서버 (자기 state 받기)
  //------------------------------------------------------
  const SERVER_MAP = {
    EV: "http://192.168.0.34:5000",
    AV1: "http://192.168.0.118:5001",
    AV2: "http://192.168.0.7:5002",
    CONTROL: "http://192.168.0.119:5003",
  };

  const myServer = SERVER_MAP[role];

  const mainSocket = io(myServer, {
    transports: ["websocket"],
  });

  mainSocket.on("connect", () => {
    console.log(`[REAL SOCKET] Connected to main server ${myServer} (role=${role})`);
  });

  mainSocket.on("disconnect", () => {
    console.log("[REAL SOCKET] Main server disconnected");
  });

  //------------------------------------------------------
  // 2) 모든 차량이 관제서버(5003)에 연결 (stage_update 받고 싶음)
  //------------------------------------------------------
  const controlServer = "http://192.168.0.119:5003";
  const controlSocket = io(controlServer, {
    transports: ["websocket"],
  });

  controlSocket.on("connect", () => {
    console.log("[REAL SOCKET] Connected to CONTROL Tower (5003)");
  });

  // CONTROL → stage_update
  controlSocket.on("stage_update", (packet) => {
    console.log("[REAL SOCKET] Received stage_update from CT:", packet);

    onMessage({
      type: "STAGE",
      data: packet,
    });
  });

  //------------------------------------------------------
  // ⭐ 차량별 이벤트 수신 (자기 서버에서만 날아옴)
  //------------------------------------------------------
  if (role === "EV") {
    mainSocket.on("ev_state", (state) => {
      console.log("[REAL SOCKET] EV SELF STATE:", state);
      onMessage({ type: "EV", data: state });
    });
  }

  if (role === "AV1") {
    mainSocket.on("av1_state", (state) => {
      console.log("[REAL SOCKET] AV1 SELF STATE:", state);
      onMessage({ type: "AV1", data: state });
    });
  }

  if (role === "AV2") {
    mainSocket.on("av2_state", (state) => {
      console.log("[REAL SOCKET] AV2 SELF STATE:", state);
      onMessage({ type: "AV2", data: state });
    });
  }

  //------------------------------------------------------
  // 공통 vehicle_state (각 서버에서 올 수 있음)
  //------------------------------------------------------
  mainSocket.on("vehicle_state", (packet) => {
    onMessage({ type: packet.id, data: packet.state });
  });

  controlSocket.on("vehicle_state", (packet) => {
    onMessage({ type: packet.id, data: packet.state });
  });

  //------------------------------------------------------
  // 반환: 두 소켓 모두 반환
  //------------------------------------------------------
  return { mainSocket, controlSocket };
}
