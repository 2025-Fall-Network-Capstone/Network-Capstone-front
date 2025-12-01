// src/pages/MainPage.jsx

import "../styles/mainPage.css";
import mapImage from "../assets/map-background.jpg";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

import { renderEV, renderAV, renderControl } from "../utils/messageFormatter";
// 소켓만 교체!
import { createFakeSocket as createRealSocket } from "../utils/fakeSocket";
// import { createRealSocket } from "../utils/realSocket"; // ← realsocket 사용 시 주석 해제


function MainPage() {
  const { role } = useContext(RoleContext);
  const [popup, setPopup] = useState(true);
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  const goToHomePage = () => {
    navigate("/");
  };

  // -------------------------------------
  //   REAL WebSocket 연결 (Control Tower 기준)
  // -------------------------------------
  useEffect(() => {
    const stop = createRealSocket((packet) => {
      let messageArray = [];

      console.log("[MAINPAGE PACKET RECEIVED]", packet);

      // ==============================
      // 1) TYPE 기반 메시지 분기
      // ==============================
      if (packet.type === "EV") {
        messageArray = renderEV(packet.data);
      }

      if (packet.type === "AV1" || packet.type === "AV2") {
        messageArray = renderAV(packet.data);
      }

      if (packet.type === "CONTROL") {
        messageArray = renderControl(packet.data);
      }

      // ==============================
      // 3) 메시지 push
      // ==============================
      if (!Array.isArray(messageArray)) {
        messageArray = [];
      }

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

              {/* 실시간 메시지 */}
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
