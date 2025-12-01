// src/pages/MainPage.jsx

import "../styles/mainPage.css";
import mapImage from "../assets/map-background.jpg";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

import { createRealSocket } from "../utils/realSocket";

function MainPage() {
  const { role } = useContext(RoleContext);
  const [popup, setPopup] = useState(true);
  const [messages, setMessages] = useState([]);

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
    if (role === "EV")
      return packet.type === "EV" || packet.type === "CONTROL";
    if (role === "AV1")
      return (
        packet.type === "AV1" ||
        packet.type === "EV" ||
        packet.type === "CONTROL"
      );
    if (role === "AV2")
      return (
        packet.type === "AV2" ||
        packet.type === "EV" ||
        packet.type === "CONTROL"
      );
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
      <img src={mapImage} className="main-background-img" />

      <div className="main-content">
        {/* HEADER */}
        <div className="main-header-section">
          <header className="nav-bar-m">
            <span className="nav-label-m">
              {role === "EV"
                ? "Emergency Vehicle"
                : role === "CONTROL"
                ? "Control Tower"
                : "Auto Vehicle"}
            </span>

            <span className="nav-divider-m">+++</span>

            <div className="role-tab-wrapper-m">
              <button
                className={`role-tab-m ${popup ? "active-m" : ""}`}
                onClick={() => setPopup(!popup)}
              >
                Chat
              </button>
              <button className="role-tab-m" onClick={goToHomePage}>
                Back Home →
              </button>
            </div>
          </header>
        </div>

        {/* BODY */}
        {popup && (
          <div className="main-body-section">
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
                <div className="main-chat-realtime-content">
                  <div className="realtime-title">실시간 동작 확인</div>

                  <div className="realtime-box-frame">
                    <div className="realtime-box">
                      <div className="realtime-box-sub-tittle">주행 속도</div>
                      <div className="realtime-box-text">
                        {liveState.speed} km/h
                      </div>
                    </div>

                    <div className="realtime-box">
                      <div className="realtime-box-sub-tittle">주행 방향</div>
                      <div className="realtime-box-text">
                        {liveState.direction}
                      </div>
                    </div>

                    <div className="realtime-box">
                      <div className="realtime-box-sub-tittle">현재 위치</div>
                      <div className="realtime-box-text">
                        ({liveState.position[0]} , {liveState.position[1]})
                      </div>
                    </div>
                  </div>
                </div>

                {/* 로그 박스 */}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`main-chat-box ${
                      m.isSinho ? "box-sinho" : "box-dongjak"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;
