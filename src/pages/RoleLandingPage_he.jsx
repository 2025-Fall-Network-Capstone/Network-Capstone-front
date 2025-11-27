// src/pages/RoleLandingPage.jsx
import "../styles/roleLanding_he.css";
import roadImg from "../assets/road.jpg";
import { useContext } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

function RoleLandingPage() {
  const { role, setRole } = useContext(RoleContext);

  return (
    <div className="landing-root">
      <div className="landing-all">
        <div className="landing-container">
          {/* NAVIGATION BAR */}
          <header className="nav-bar">
            <span className="nav-label">Role Setting</span>
            <span className="nav-divider">+++</span>

            <div className="role-tab-wrapper">
              <button
                className={`role-tab ${role === "EV" ? "active" : ""}`}
                onClick={() => setRole("EV")}>
                Emergency Vehicle
              </button>
              <button
                className={`role-tab ${role === "CONTROL" ? "active" : ""}`}
                onClick={() => setRole("CONTROL")}>
                Control Tower
              </button>
              <button
                className={`role-tab ${role === "AV" ? "active" : ""}`}
                onClick={() => setRole("AV")}>
                Auto Vehicle
              </button>
            </div>
          </header>

          {/* CONTENT AREA */}
          <section className="content">
            <div className="title-des-content">
              {/* TITLE */}
              <h1 className="landing-title">
                Emergency-Situation
                <br />
                Dashboard
              </h1>

              {/* DESCRIPTION */}
              <p className="landing-desc">
                EV인 경우 대시보드를 표시합니다. 무엇을 입력해야 할지는 잘 모르겠지만 대략 두 줄
                정도면 충분할 것 같습니다. 그래서 내용을 채워넣는 부분입니다.
              </p>
            </div>
            {/* BUTTON */}
            <button className="landing-btn">Show My Dashboard →</button>
          </section>
        </div>
        <div className="right-side">
          <img src={roadImg} alt="road view" className="landing-img" />
        </div>
      </div>
    </div>
  );
}

export default RoleLandingPage;
