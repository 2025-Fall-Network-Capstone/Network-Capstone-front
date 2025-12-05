// src/utils/realSocket.js
import { io } from "socket.io-client";

export function createRealSocket(onMessage, role) {
  //------------------------------------------------------
  // 역할별 서버 매핑
  //------------------------------------------------------
  const SERVER_MAP = {
    EV: "http://172.20.62.16:5000",
    AV1: "http://172.20.57.184:5001",
    AV2: "http://172.20.93.219:5002",
    CONTROL: "http://172.20.96.208:5003",
  };

  const myServer = SERVER_MAP[role];

  //------------------------------------------------------
  // ⭐ mainSocket: 자기 서버와 연결 (각 차량의 고유 서버)
  //------------------------------------------------------
  const mainSocket = io(myServer, { transports: ["websocket"] });

  mainSocket.on("connect", () => {
    console.log(`[REAL SOCKET] Connected to MY-SERVER ${myServer} (role=${role})`);
  });

  mainSocket.on("disconnect", () => {
    console.log("[REAL SOCKET] Disconnected from MY-SERVER");
  });

  //------------------------------------------------------
  // ⭐ controlSocket: Control Tower 서버와 연결
  //------------------------------------------------------
  const controlSocket = io(SERVER_MAP["CONTROL"], {
    transports: ["websocket"],
  });

  controlSocket.on("connect", () => {
    console.log(`[REAL SOCKET] Connected to CONTROL Tower (5003)`);
  });

  controlSocket.on("disconnect", () => {
    console.log("[REAL SOCKET] Disconnected from CONTROL Tower");
  });

  //------------------------------------------------------
  // ⭐ stage_update: CT → 모든 차량 전달
  //------------------------------------------------------
  controlSocket.on("stage_update", (packet) => {
    console.log("[REAL SOCKET] stage_update:", packet);
    onMessage({ type: "STAGE", data: packet });
  });

  //------------------------------------------------------
  // ⭐ 자기 상태(ev_state, av1_state, av2_state)
  //------------------------------------------------------
  const SELF_EVENT = {
    EV: "ev_state",
    AV1: "av1_state",
    AV2: "av2_state",
  }[role];

  if (SELF_EVENT) {
    mainSocket.on(SELF_EVENT, (state) => {
      console.log(`[REAL SOCKET] SELF STATE (${role}):`, state);
      onMessage({ type: role, data: state });
    });
  }

  //------------------------------------------------------
  // ⭐ vehicle_state (단일 차량 상태 업데이트)
  //------------------------------------------------------
  const handleVehicleState = (packet) => {
    // packet = { id: "EV"/"AV1"/"AV2", state: {...} }
    console.log("[REAL SOCKET] vehicle_state →", packet);
    onMessage({ type: packet.id, data: packet.state });
  };

  mainSocket.on("vehicle_state", handleVehicleState);
  controlSocket.on("vehicle_state", handleVehicleState);

  //------------------------------------------------------
  // ⭐ status_all (핵심!) — CT → 모든 차량 전체 상태 전송
  //------------------------------------------------------
  controlSocket.on("status_all", (packet) => {
    /*
      packet 구조 예시:
      {
        EV: { speed: 10, lane_change: false, ... },
        AV1: { ... },
        AV2: { ... }
      }
    */
    console.log("[REAL SOCKET] status_all received:", packet);

    onMessage({
      type: "STATUS_ALL",  // 프론트 내부 판별용
      data: packet,         // EV/AV1/AV2 전체 상태
    });
  });

  //------------------------------------------------------
  // ⭐ 소켓 객체 반환 (disconnect 등 사용 가능)
  //------------------------------------------------------
  return { mainSocket, controlSocket };
}
