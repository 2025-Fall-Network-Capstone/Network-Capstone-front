// src/pages/MainPage.jsx

import "../styles/mainPage.css";
import "../styles/gridCar.css";
// import mapImage from "../assets/map-background.jpg";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

import { createRealSocket } from "../utils/realSocket";

function MainPage() {
  const { role } = useContext(RoleContext);
  const [popup, setPopup] = useState(true);
  const [messages, setMessages] = useState([]);
  const [items, setItems] = useState([
    { id: 1, name: "CONTROL", row: 1, col: 0, color: "#6BA6A1", border: "0 3px solid #12543E" },
    { id: 2, name: "AV1", row: 5, col: 3, color: "#9E94D1", border: "0 3px solid #3A2F71" },
    { id: 3, name: "AV2", row: 5, col: 6, color: "#9E94D1", border: "0 3px solid #3A2F71" },
    { id: 4, name: "EV", row: 6, col: 6, color: "#C18D94", border: "0 3px solid #751824" },
  ]);

  // ⭐ 실시간 차량 상태 저장 ⭐
  const [liveState, setLiveState] = useState({
    speed: 0,
    direction: "",
    position: [0, 0],
  });

  const navigate = useNavigate();
  const goToHomePage = () => navigate("/");

  //------------------------------------------------------
  // 역할별 필터링
  //------------------------------------------------------
  const shouldDisplay = (packet) => {
    if (role === "EV") return packet.type === "EV" || packet.type === "CONTROL";
    if (role === "AV1")
      return packet.type === "AV1" || packet.type === "EV" || packet.type === "CONTROL";
    if (role === "AV2")
      return packet.type === "AV2" || packet.type === "EV" || packet.type === "CONTROL";
    if (role === "CONTROL") return true;
    return false;
  };

  //------------------------------------------------------
  // WebSocket 연결
  //------------------------------------------------------
  useEffect(() => {
    if (!role) return;

    const socket = createRealSocket((packet) => {
      if (!shouldDisplay(packet)) return;

      console.log("[MAINPAGE PACKET RECEIVED]", packet);

      // ⭐ 자신의 역할 데이터일 때만 실시간 상태 업데이트 ⭐
      if (packet.type === role && packet.data) {
        setLiveState({
          speed: packet.data.speed ?? 0,
          direction: packet.data.direction ?? "",
          position: packet.data.position ?? [0, 0],
        });
      }

      // ⭐ 로그는 기존 방식 유지 ⭐
      let newMsg = [];
      if (packet.type === "STAGE") {
        newMsg = [{ text: `[Stage] ${packet.data.stage}`, isSinho: false }];
      }

      if (packet.type === "EV" || packet.type === "AV1" || packet.type === "AV2") {
        if (packet.type === "EV") {
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.name === "EV"
                ? {
                    ...item,
                    row: packet.data.positionRow ?? item.row,
                    col: packet.data.positionCol ?? item.col,
                  }
                : item
            )
          );
        }
        if (packet.type === "AV1") {
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.name === "AV1"
                ? {
                    ...item,
                    row: packet.data.positionRow ?? item.row,
                    col: packet.data.positionCol ?? item.col,
                  }
                : item
            )
          );
        }
        if (packet.type === "AV2") {
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.name === "AV2"
                ? {
                    ...item,
                    row: packet.data.positionRow ?? item.row,
                    col: packet.data.positionCol ?? item.col,
                  }
                : item
            )
          );
        }
      }

      setMessages((prev) => [...prev, ...newMsg]);
    }, role);

    // CONTROL → 시작 신호 emit
    if (role === "CONTROL") {
      socket.on("connect", () => {
        console.log("[CONTROL SOCKET CONNECTED]");

        socket.emit("control_start", {
          role: "CONTROL",
          timestamp: Date.now(),
        });

        console.log("[SOCKET EMIT] control_start 전송 완료");
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [role]);

  //------------------------------------------------------
  // UI Rendering
  //------------------------------------------------------
  return (
    <div className="main-page-root">
      {/* 도로 상황 표시 */}
      {/* <img src={mapImage} className="main-background-img" /> */}

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
                      borderColor: item.bordercolor,
                    }}>
                    {item.name}
                  </div>
                ))}
                {/* 원하는 column 사이 위치에 선 추가 */}
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
                  <div className="main-chat-popup-header-right">
                    <span className="right-box sinho">&nbsp;</span>
                    <span className="right-text">동작</span>
                    <span className="right-box dongjaK">&nbsp;</span>
                    <span className="right-text">신호</span>
                  </div>
                </div>

                <div className="main-chat-popup-body">
                  {/* 실시간 동작 값 표시 */}
                  {role != "CONTROL" && (
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
                            ({liveState.position[0]} , {liveState.position[1]})
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 로그 박스 */}
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`main-chat-box ${m.isSinho ? "box-sinho" : "box-dongjak"}`}>
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
