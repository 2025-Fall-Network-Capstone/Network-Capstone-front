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

  const [messages, setMessages] = useState([]);
  const [logQueue, setLogQueue] = useState([]);

  // Stage 3 타이머
  const stage3TimerRef = useRef(null);

  const dirMap = {
    straight: "직진",
    left_turn: "좌회전",
    right_turn: "우회전",
  };

  const initialItems = [
    {
      id: 1,
      name: "CONTROL",
      speed: 0,
      row: 1,
      col: 0,
      direction: "straight",
      color: "#6BA6A1",
      border: "0 3px solid #12543E",
    },
    {
      id: 2,
      name: "AV1",
      speed: 40,
      row: 5,
      col: 3,
      direction: "straight",
      color: "#9E94D1",
      border: "0 3px solid #3A2F71",
    },
    {
      id: 3,
      name: "AV2",
      speed: 40,
      row: 5,
      col: 6,
      direction: "straight",
      color: "#9E94D1",
      border: "0 3px solid #3A2F71",
    },
    {
      id: 4,
      name: "EV",
      speed: 70,
      row: 6,
      col: 6,
      direction: "straight",
      color: "#C18D94",
      border: "0 3px solid #751824",
    },
  ];

  const [items, setItems] = useState(initialItems);

  function getInitialLiveState(role) {
    const item = initialItems.find((v) => v.name === role);
    if (!item) return { speed: 0, direction: "", position: [0, 0] };
    return {
      speed: item.speed,
      direction: item.direction,
      position: [item.row, item.col],
    };
  }

  const [liveState, setLiveState] = useState(() => getInitialLiveState(role));
  const [stage5Logged, setStage5Logged] = useState(false);
  const [globalStage, setGlobalStage] = useState(null);

  const navigate = useNavigate();
  const goToHomePage = () => navigate("/");

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

  const handleStatusAll = (allStates) => {
    let logs = [];

    const EV = allStates.EV;
    const AV1 = allStates.AV1;
    const AV2 = allStates.AV2;

    if (role === "CONTROL") {
      logs.push(logEVState(EV));
      logs.push(logAVState(AV1));
      logs.push(logAVState(AV2));
    }

    if (role === "EV") {
      logs.push(logAVState(AV1));
      logs.push(logAVState(AV2));
    }

    if (role === "AV1") {
      logs.push(logEVState(EV));
      logs.push(logAVState(AV2));
    }
    if (role === "AV2") {
      logs.push(logEVState(EV));
      logs.push(logAVState(AV1));
    }

    const dynamicMsgs = [logEmergency(EV), logLaneChange(AV1), logLaneChange(AV2)].filter(Boolean);

    logs = [...dynamicMsgs, ...logs];
    setLogQueue((prev) => [...prev, ...logs]);
  };

  // 메시지 큐 → 1초 간격으로 출력
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
  // 🔥 FIX: Stage에 반응하는 타이머 전용 useEffect
  // -----------------------------------------------------
  useEffect(() => {
    if (globalStage === 3) {
      if (!stage3TimerRef.current) {
        stage3TimerRef.current = setTimeout(() => {
          setItems((prev) => prev.map((v) => (v.name === "EV" ? { ...v, row: 1, col: 6 } : v)));
        }, 5000);
      }
    }

    // Stage 4 이상 → 타이머 정리
    if (globalStage > 3) {
      if (stage3TimerRef.current) {
        clearTimeout(stage3TimerRef.current);
        stage3TimerRef.current = null;
      }
    }
  }, [globalStage]); // 🔥 FIX 핵심

  // -----------------------------------------------------
  // WebSocket
  // -----------------------------------------------------
  useEffect(() => {
    if (!role) return;

    const { mainSocket, controlSocket } = createRealSocket((packet) => {
      console.log("[MAINPAGE PACKET RECEIVED]", packet);

      if (packet.type === role && packet.data) {
        setLiveState({
          speed: packet.data.speed ?? 0,
          direction: packet.data.direction ?? "",
          position: packet.data.position ?? [0, 0],
        });

        if (packet.data.stage === 5 && !stage5Logged) {
          setStage5Logged(true);
          setLogQueue((prev) => [...prev, "EV가 반경 2km를 벗어났습니다."]);
        }
      }

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
        setGlobalStage(packet.data.stage);

        if (role === "CONTROL") {
          setLogQueue((prev) => [...prev, logStageUpdate(packet.data.stage)]);
        }
      }

      if (packet.type === "STATUS_ALL") {
        const allStates = packet.data;

        // Stage 5 메시지
        if (globalStage === 5) {
          setLogQueue((prev) => [...prev, "EV가 반경 2km를 벗어났습니다."]);
        }

        handleStatusAll(allStates);

        const myState = allStates[role];
        if (myState) {
          const init = initialItems.find((item) => item.name === role);

          setLiveState({
            speed: myState.speed ?? init?.speed ?? 0,
            direction: myState.direction ?? init?.direction ?? "__",
            position: myState.position ?? [init?.row ?? 0, init?.col ?? 0],
          });
        }

        setItems((prevItems) =>
          prevItems.map((item) => {
            const state = allStates[item.name];
            if (!state) return item;

            const originalRow = state.position?.[0] ?? item.row;
            const originalCol = state.position?.[1] ?? item.col;

            // 🔥 기존 Stage3 타이머는 그대로 두되 비활성화됨 (useEffect로 이동)
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
  }, [role, globalStage]);

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
                        <div className="realtime-box-text">{dirMap[liveState.direction]}</div>
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
