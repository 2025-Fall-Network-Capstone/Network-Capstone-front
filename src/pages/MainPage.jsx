// src/pages/MainPage.jsx

import "../styles/mainPage.css";
import mapImage from "../assets/map-background.jpg";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

import { renderEV, renderAV, renderControl } from "../utils/messageFormatter";
import { createRealSocket } from "../utils/realSocket";

function MainPage() {
  const { role } = useContext(RoleContext);
  const [popup, setPopup] = useState(true);
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();
  const goToHomePage = () => navigate("/");

  // -----------------------------
  // 역할별 필터링 규칙
  // -----------------------------
  const shouldDisplay = (packet) => {
    if (role === "EV") {
      return packet.type === "EV" || packet.type === "CONTROL";
    }
    if (role === "AV1") {
      return (
        packet.type === "AV1" ||
        packet.type === "EV" ||
        packet.type === "CONTROL"
      );
    }
    if (role === "AV2") {
      return (
        packet.type === "AV2" ||
        packet.type === "EV" ||
        packet.type === "CONTROL"
      );
    }
    if (role === "CONTROL") return true;
    return false;
  };

  // -------------------------------------
  // REAL WebSocket 연결 + 관제 시작 이벤트 전송
  // -------------------------------------
  useEffect(() => {
    if (!role) return;

    // createRealSocket가 socket을 리턴한다고 가정
    const socket = createRealSocket((packet) => {
      if (!shouldDisplay(packet)) return;

      let messageArray = [];
      console.log("[MAINPAGE PACKET RECEIVED]", packet);

      if (packet.type === "EV") messageArray = renderEV(packet.data);
      if (packet.type === "AV1" || packet.type === "AV2")
        messageArray = renderAV(packet.data);
      if (packet.type === "CONTROL") messageArray = renderControl(packet.data);

      if (!Array.isArray(messageArray)) messageArray = [];

      setMessages((prev) => [...prev, ...messageArray]);
    }, role);

    // 🔥🔥🔥 ADD: 관제 역할일 경우 시작 이벤트 emit
    if (role === "CONTROL") {
      socket.emit("control_start", {
        role: "CONTROL",
        timestamp: Date.now()
      });
      console.log("[SOCKET EMIT] control_start 전송 완료");
    }
    // 🔥🔥🔥 끝

    return () => {
      socket.disconnect();
    };
  }, [role]);

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
              </div>

              <div className="main-chat-popup-body">
                {messages
                  .filter((m) => m.text && m.text.trim() !== "")
                  .map((m, i) => (
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
