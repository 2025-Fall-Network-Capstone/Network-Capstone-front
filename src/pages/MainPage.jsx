import "../styles/mainPage.css";
import mapImage from "../assets/map-background.jpg";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { RoleContext } from "../context/RoleContext.jsx";
// import { PopupContext } from "../context/PopupContext";

function MainPage() {
  const { role } = useContext(RoleContext);
  const [popup, setPopup] = useState(true);
  const navigate = useNavigate();

  const goToHomePage = () => {
    navigate("/");
  };

  return (
    <div className="main-page-root">
      <img src={mapImage} className="main-background-img" />
      <div className="main-content">
        <div className="main-header-section">
          <header className="nav-bar-m">
            {role === "EV" ? (
              <span className="nav-label-m">Emergency Vehicle</span>
            ) : role === "CONTROL" ? (
              <span className="nav-label-m">Control Tower</span>
            ) : (
              <span className="nav-label-m">Auto Vehicle</span>
            )}

            <span className="nav-divider-m">+++</span>

            <div className="role-tab-wrapper-m">
              <button
                className={`role-tab-m ${popup === true ? "active-m" : ""}`}
                onClick={() => {
                  setPopup(!popup);
                }}>
                Chat
              </button>
              <button className={`role-tab-m`} onClick={goToHomePage}>
                Back Home →
              </button>
            </div>
          </header>
        </div>

        {popup ? (
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
                <div className="">
                  <div className=""></div>
                  <div className=""></div>
                  <div className=""></div>
                </div>
                <div className="main-chat-box box-dongjak">.</div>
                <div className="main-chat-box box-dongjak">.</div>
                <div className="main-chat-box box-dongjak">.</div>
                <div className="main-chat-box box-dongjak">.</div>
                <div className="main-chat-box box-dongjak">.</div>
                <div className="main-chat-box box-sinho">.</div>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default MainPage;
