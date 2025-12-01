// src/pages/MainPage.jsx

import "../styles/mainPage.css";
import mapImage from "../assets/map-background.jpg";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

import { renderEV, renderAV, renderControl } from "../utils/messageFormatter";

// 소켓 전환: fake 테스트 중
import { createFakeSocket as createRealSocket } from "../utils/fakeSocket";
// import { createRealSocket } from "../utils/realSocket";

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
    // EV UI
    if (role === "EV") {
      return (
        packet.type === "EV" ||                // 내 상태
        packet.type === "CONTROL"              // 관제가 EV에게 주는 정보
      );
    }

    // AV1 UI
    if (role === "AV1") {
      return (
        packet.type === "AV1" ||               // 내 상태
        packet.type === "EV" ||                // EV 사건/신호
        packet.type === "CONTROL"              // 관제 정보
      );
    }

    // AV2 UI
    if (role === "AV2") {
      return (
        packet.type === "AV2" ||               // 내 상태
        packet.type === "EV" ||                // EV 사건/신호
        packet.type === "CONTROL"              // 관제 정보
      );
    }

    // CONTROL UI (모두 표시)
    if (role === "CONTROL") return true;

    return false;
  };

  // -------------------------------------
  //  REAL WebSocket 연결
  // -------------------------------------
  useEffect(() => {
    const stop = createRealSocket((packet) => {
      // !!! 역할에 따라 시각화할지 말지를 결정 !!!
      if (!shouldDisplay(packet)) return;

      let messageArray = [];
      console.log("[MAINPAGE PACKET RECEIVED]", packet);

      // 타입별 메시지 포맷팅
      if (packet.type === "EV") messageArray = renderEV(packet.data);
      if (packet.type === "AV1" || packet.type === "AV2")
        messageArray = renderAV(packet.data);
      if (packet.type === "CONTROL") messageArray = renderControl(packet.data);

      if (!Array.isArray(messageArray)) messageArray = [];

      setMessages((prev) => [...prev, ...messageArray]);
    }, role);

    return () => stop();
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
