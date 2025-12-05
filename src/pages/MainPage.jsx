// src/pages/MainPage.jsx

import "../styles/mainPage.css";
import "../styles/gridCar.css";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { RoleContext } from "../context/RoleContext.jsx";
import { createRealSocket } from "../utils/realSocket";

function MainPage() {
  const { role } = useContext(RoleContext);
  const [popup, setPopup] = useState(true);

  // 실제 출력되는 메시지 리스트
  const [messages, setMessages] = useState([]);

  // 1초마다 한 줄씩 내보내기 위한 메시지 큐
  const [logQueue, setLogQueue] = useState([]);

  // 3단계 5초 후 다른 메시지 출력용 타이머
  const stage3TimerRef = useRef(null);

  // 차량 위치 UI용
  const [items, setItems] = useState([
    { id: 1, name: "CONTROL", row: 1, col: 0, color: "#6BA6A1", border: "0 3px solid #12543E" },
    { id: 2, name: "AV1", row: 5, col: 3, color: "#9E94D1", border: "0 3px solid #3A2F71" },
    { id: 3, name: "AV2", row: 5, col: 6, color: "#9E94D1", border: "0 3px solid #3A2F71" },
    { id: 4, name: "EV", row: 6, col: 6, color: "#C18D94", border: "0 3px solid #751824" },
  ]);

  // Live State (자기 자신의 상태만)
  const [liveState, setLiveState] = useState({
    speed: 0,
    direction: "",
    position: [0, 0],
  });

  const navigate = useNavigate();
  const goToHomePage = () => navigate("/");

  // -----------------------------------------------------
  // 자연어형 로그 생성 함수들
  // -----------------------------------------------------

  const fmtPosition = (pos) => `(${pos?.[0]}, ${pos?.[1]})`;

  const logEVState = (state) =>
    `EV가 현재 시속 ${state.speed}km/h로 이동 중입니다. 방향은 ${
      state.direction
    }, 위치는 ${fmtPosition(state.position)}입니다.`;

  const logAVState = (state) =>
    `${state.id}가 시속 ${state.speed}km/h로 주행하고 있습니다. 방향은 ${
      state.direction
    }, 위치는 ${fmtPosition(state.position)}입니다.`;

  const logEmergency = (state) =>
    state.emergency ? `EV가 응급상황을 주변 차량에 전달했습니다.` : null;

  const logLaneChange = (state) =>
    state.lane_change ? `${state.id}가 차선 변경을 수행 중입니다.` : null;

  const logStageUpdate = (stage) => `관제가 Stage ${stage}로 변경했습니다.`;

  // -----------------------------------------------------
  // STATUS_ALL 로그 처리 → queue에 넣기
  // -----------------------------------------------------

  const handleStatusAll = (allStates) => {
    let logs = [];

    const EV = allStates.EV;
    const AV1 = allStates.AV1;
    const AV2 = allStates.AV2;

    // CONTROL → 모든 차량 상태 출력
    if (role === "CONTROL") {
      logs.push(logEVState(EV));
      logs.push(logAVState(AV1));
      logs.push(logAVState(AV2));
    }

    // EV → 다른 차량 상태만 출력
    if (role === "EV") {
      logs.push(logAVState(AV1));
      logs.push(logAVState(AV2));
    }

    // AV → 자기 제외, EV + 상대 AV 출력
    if (role === "AV1") {
      logs.push(logEVState(EV));
      logs.push(logAVState(AV2));
    }
    if (role === "AV2") {
      logs.push(logEVState(EV));
      logs.push(logAVState(AV1));
    }

    // emergency / lane_change 메시지 추가
    const dynamicMsgs = [logEmergency(EV), logLaneChange(AV1), logLaneChange(AV2)].filter(Boolean);

    logs = [...dynamicMsgs, ...logs];

    // ---- 기존: 즉시 출력하던 부분 수정 ----
    // setMessages(...) 삭제하고 queue에 넣기
    setLogQueue((prev) => [...prev, ...logs]);
  };

  // -----------------------------------------------------
  // 메시지 큐 관리: 1초마다 queue에서 하나씩 꺼내 messages로 이동
  // -----------------------------------------------------

  useEffect(() => {
    if (logQueue.length === 0) return;

    const timer = setInterval(() => {
      setLogQueue((prevQueue) => {
        if (prevQueue.length === 0) return [];

        const [nextLog, ...rest] = prevQueue;

        setMessages((prev) => [...prev, { text: nextLog, isSinho: false }]);

        return rest;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [logQueue]);

  // -----------------------------------------------------
  // WebSocket 연결
  // -----------------------------------------------------
  useEffect(() => {
    if (!role) return;

    const { mainSocket, controlSocket } = createRealSocket((packet) => {
      console.log("[MAINPAGE PACKET RECEIVED]", packet);

      // LiveState 업데이트 (내 차량)
      if (packet.type === role && packet.data) {
        setLiveState({
          speed: packet.data.speed ?? 0,
          direction: packet.data.direction ?? "",
          position: packet.data.position ?? [0, 0],
        });
      }

      // 차량 위치 업데이트 (EV/AV 전용)
      if (["EV", "AV1", "AV2"].includes(packet.type)) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.name === packet.type
              ? {
                  ...item,
                  row: packet.data.position?.[0] ?? item.row,
                  col: packet.data.position?.[1] ?? item.col,
                }
              : item
          )
        );
      }

      if (packet.type === "STAGE") {
        if (role === "CONTROL") {
          setLogQueue((prev) => [...prev, logStageUpdate(packet.data.stage)]);
        }
      }

      // STATUS_ALL 처리
      if (packet.type === "STATUS_ALL") {
        const allStates = packet.data;
        const currentStage = allStates["EV"]?.stage ?? null;

        // 4-1) 자연어 로그 생성
        handleStatusAll(allStates);

        // 4-2) 자신의 실시간 박스 업데이트
        const myState = allStates[role];
        if (myState) {
          setLiveState({
            speed: myState.speed ?? 0,
            direction: myState.direction ?? "__",
            position: myState.position ?? [0, 0],
          });
        }

        // 4-3) 모든 차량 그리드 위치 업데이트
        setItems((prevItems) =>
          prevItems.map((item) => {
            const state = allStates[item.name];
            if (!state) return item;

            const originalRow = state.position?.[0] ?? item.row;
            const originalCol = state.position?.[1] ?? item.col;

            // ---------------------- 🔥 Stage 3 예외 처리 ----------------------
            if (currentStage === 3) {
              // 처음에는 서버 state 그대로 반영
              const updatedItem = {
                ...item,
                row: originalRow,
                col: originalCol,
              };

              // 5초 후 (1,6)으로 이동시키는 타이머 (중복 방지)
              if (!stage3TimerRef.current) {
                stage3TimerRef.current = setTimeout(() => {
                  setItems((prev) =>
                    prev.map((v) => (v.name === item.name ? { ...v, row: 1, col: 6 } : v))
                  );
                }, 5000);
              }

              return updatedItem;
            }
            // -----------------------------------------------------------------

            // ---------------- 🔄 Stage 4 이상: 원래 위치 복구 ----------------
            if (currentStage > 3) {
              if (stage3TimerRef.current) {
                clearTimeout(stage3TimerRef.current);
                stage3TimerRef.current = null;
              }

              return {
                ...item,
                row: originalRow,
                col: originalCol,
              };
            }
            // -----------------------------------------------------------------

            // 기본 상태 업데이트
            return {
              ...item,
              row: originalRow,
              col: originalCol,
            };
          })
        );
      }
    }, role);

    if (role === "CONTROL") {
      mainSocket.on("connect", () => {
        mainSocket.emit("control_start", {
          role: "CONTROL",
          timestamp: Date.now(),
        });
      });
    }

    return () => {
      mainSocket.disconnect();
      controlSocket.disconnect();
    };
  }, [role]);

  // -----------------------------------------------------
  // UI Rendering
  // -----------------------------------------------------
  return (
    <div className="main-page-root">
      <div className="main-content">
        {/* HEADER */}
        <div className="main-header-section">
          <header className="nav-bar-m">
            <span className="nav-label-m">
              {role === "EV"
                ? "Emergency Vehicle"
                : role === "CONTROL"
                ? "Control Tower"
                : role === "AV1"
                ? "Auto Vehicle 1"
                : role === "AV2"
                ? "Auto Vehicle 2"
                : "Unknown Role"}
            </span>

            <span className="nav-divider-m">+++</span>

            <div className="role-tab-wrapper-m">
              <button
                className={`role-tab-m ${popup ? "active-m" : ""}`}
                onClick={() => setPopup(!popup)}>
                Chat
              </button>
              <button className="role-tab-m" onClick={goToHomePage}>
                Back Home →
              </button>
            </div>
          </header>
        </div>

        {/* BODY */}
        <div className="main-body-section">
          <div className="main-grid-frame">
            <div className="car-container">
              <div className="car-grid-frames">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`grid-item ${item.name === role ? "blink" : ""}`}
                    style={{
                      gridColumnStart: item.col + 1,
                      gridRowStart: item.row + 1,
                      backgroundColor: item.color,
                    }}>
                    {item.name}
                  </div>
                ))}

                {/* 도로 중앙선 */}
                <div className="col-border" style={{ gridColumn: "2 / 4" }} />
                <div
                  className="col-border"
                  style={{ gridColumn: "5 / 7", borderLeft: "10px dashed #ffffff" }}
                />
                <div className="col-border" style={{ gridColumn: "8 / 10" }} />
              </div>
            </div>
          </div>

          {popup && (
            <div className="main-chat-frame">
              <div className="main-chat-popup-content">
                <div className="main-chat-popup-header">
                  <div className="main-chat-title">통신 로그</div>
                </div>

                {/* 실시간 박스 (CONTROL 제외) */}
                {role !== "CONTROL" && (
                  <div className="main-chat-realtime-content">
                    <div className="realtime-title">실시간 동작 확인</div>

                    <div className="realtime-box-frame">
                      <div className="realtime-box">
                        <div className="realtime-box-sub-tittle">주행 속도</div>
                        <div className="realtime-box-text">{liveState.speed} km/h</div>
                      </div>

                      <div className="realtime-box">
                        <div className="realtime-box-sub-tittle">주행 방향</div>
                        <div className="realtime-box-text">{liveState.direction}</div>
                      </div>

                      <div className="realtime-box">
                        <div className="realtime-box-sub-tittle">현재 위치</div>
                        <div className="realtime-box-text">
                          ({liveState.position[0]}, {liveState.position[1]})
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="main-chat-popup-body">
                  {[...messages].reverse().map((m, i) => (
                    <div key={i} className="main-chat-box box-dongjak">
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainPage;
