// src/utils/realSocket.js
import { io } from "socket.io-client";

export function createRealSocket(onMessage, role) {

  //------------------------------------------------------
  // 1) 각 기기의 고유 서버 (자기 서버)
  //------------------------------------------------------
  const SERVER_MAP = {
    EV: "http://192.168.0.34:5000",
    AV1: "http://192.168.0.118:5001",
    AV2: "http://192.168.0.7:5002",
    CONTROL: "http://192.168.0.119:5003",
  };

  const myServer = SERVER_MAP[role];

  //------------------------------------------------------
  // ⭐ mainSocket: 자기 서버와 연결 (자기 state 받기)
  //------------------------------------------------------
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
  // ⭐ controlSocket: Control Tower(5003)와 연결
  //------------------------------------------------------
  const controlSocket = io("http://192.168.0.119:5003", {
    transports: ["websocket"],
  });

  controlSocket.on("connect", () => {
    console.log("[REAL SOCKET] Connected to Control Tower (5003)");
  });

  controlSocket.on("disconnect", () => {
    console.log("[REAL SOCKET] Control Tower disconnected");
  });

  //------------------------------------------------------
  // ⭐ CT → 모든 차량에게 stage_update 브로드캐스트
  //------------------------------------------------------
  controlSocket.on("stage_update", (packet) => {
    console.log("[REAL SOCKET] Received stage_update:", packet);

    onMessage({
      type: "STAGE",
      data: packet,
    });
  });

  //------------------------------------------------------
  // ⭐ 차량별 자기 서버에서 보내는 상태 수신 (중요)
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
  // ⭐ vehicle_state (CT or 각 차량 서버에서 올 수 있음)
  //------------------------------------------------------
  mainSocket.on("vehicle_state", (packet) => {
    onMessage({ type: packet.id, data: packet.state });
  });

  controlSocket.on("vehicle_state", (packet) => {
    onMessage({ type: packet.id, data: packet.state });
  });

  //------------------------------------------------------
  // ⭐ 두 소켓 모두 반환해서 MainPage에서 제어 가능하게
  //------------------------------------------------------
  return { mainSocket, controlSocket };
}
