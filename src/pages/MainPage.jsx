import "../styles/mainPage.css";
import mapImage from "../assets/map-background.jpg";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

import { renderEV, renderAV, renderControl } from "../utils/messageFormatter";
import { createFakeSocket } from "../utils/fakeSocket";

function MainPage() {
  const { role } = useContext(RoleContext);
  const [popup, setPopup] = useState(true);
  const [messages, setMessages] = useState([]); // ★ 실시간 로그 저장

  const navigate = useNavigate();

  const goToHomePage = () => {
    navigate("/");
  };

  // -------------------------------
  //  Fake WebSocket 연결
  // -------------------------------
  useEffect(() => {
    const stop = createFakeSocket((packet) => {
      let messageArray = [];

      if (role === "EV") messageArray = renderEV(packet.data);
      if (role === "AV") messageArray = renderAV(packet.data);
      if (role === "CONTROL") messageArray = renderControl(packet.data);

      // 배열이 아닌 경우를 위한 처리
      if (!Array.isArray(messageArray)) {
        messageArray = [];
      }

      setMessages((prev) => [...prev, ...messageArray]);
    });

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
        {popup && (
          <div className="main-body-section">
            <div className="main-chat-popup-content">
              <div className="main-chat-popup-header">
                <div className="main-chat-title">통신 로그</div>
              </div>

              {/* 🔥 여기에 실시간 메세지가 들어간다 */}
              <div className="main-chat-popup-body">
                {messages
                  .filter((m) => m.text && m.text.trim() !== "") // ★ 빈 메시지 제거
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