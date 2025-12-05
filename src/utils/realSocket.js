// src/utils/realSocket.js
import { io } from "socket.io-client";

export function createRealSocket(onMessage, role) {

  // 🔥 1) 역할별 서버 주소 매핑
  const SERVER_MAP = {
    EV: "http://192.168.0.34:5000",
    AV1: "http://192.168.0.118:5001",
    AV2: "http://192.168.0.7:5002",
    CONTROL: "http://192.168.0.119:5003",
  };

  // 🔥 2) role 기반으로 접속 서버 선택
  const targetServer = SERVER_MAP[role];
  console.log(`%c[REAL SOCKET] Connecting to ${targetServer} for role=${role}`, "color: orange;");

  // 🔥 3) 실제 소켓 연결
  const socket = io(targetServer, {
    transports: ["websocket"],
  });

  //------------------------------------------------------
  // 역할별 필터링 로직 (로그용 — 실제 필터링은 MainPage에서)
  //------------------------------------------------------
  const shouldDisplay = (packetType) => {
    if (role === "EV") return packetType === "EV" || packetType === "CONTROL";
    if (role === "AV1") return packetType === "AV1" || packetType === "EV" || packetType === "CONTROL";
    if (role === "AV2") return packetType === "AV2" || packetType === "EV" || packetType === "CONTROL";
    if (role === "CONTROL") return true;
    return false;
  };

  const debugLog = (packetType, label) => {
    const pass = shouldDisplay(packetType);

    console.log(
      `%c[RS-FILTER] role=${role} | packet=${packetType} | ${label} | 표시 → ${pass}`,
      `color: ${pass ? "green" : "red"}; font-weight:bold;`
    );
  };

  //------------------------------------------------------
  // 🔥 --- 연결 ---
  //------------------------------------------------------
  socket.on("connect", () => {
    console.log(`%c[REAL SOCKET] Connected to ${targetServer} (role=${role})`, "color: green;");

    // 차량 서버는 register를 사용할 수도, 안 할 수도 있음
    socket.emit("register", { role });
  });

  socket.on("disconnect", () => {
    console.log("[REAL SOCKET] Disconnected");
  });

  socket.on("error", (msg) => {
    console.warn("[REAL SOCKET ERROR]", msg);
  });

  //------------------------------------------------------
  // 1) vehicle_state
  //------------------------------------------------------
  socket.on("vehicle_state", (packet) => {
    const { id, state } = packet;

    debugLog(id, "vehicle_state 수신");
    console.log(`[REAL SOCKET] ${id} STATE:`, state);

    onMessage({
      type: id,
      data: state,
    });
  });

  //------------------------------------------------------
  // 2) status_all
  //------------------------------------------------------
  socket.on("status_all", (allState) => {
    console.log("[REAL SOCKET] ALL STATE:", allState);

    Object.keys(allState).forEach((key) => {
      debugLog(key, "status_all 개별 패킷");

      onMessage({
        type: key,
        data: allState[key],
      });
    });
  });

  //------------------------------------------------------
  // 3) stage_update
  //------------------------------------------------------
  socket.on("stage_update", (packet) => {
    debugLog("STAGE", "stage_update 수신");
    console.log("[REAL SOCKET] STAGE UPDATE:", packet);

    onMessage({
      type: "STAGE",
      data: packet,
    });
  });

  return socket;
}
