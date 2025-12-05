// src/pages/RoleLandingPage.jsx
import "../styles/roleLanding_he.css";
import roadImg from "../assets/road.jpg";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

function RoleLandingPage() {
  const { role, setRole } = useContext(RoleContext);
  const navigate = useNavigate();

  const goToMainPage = () => {
    navigate("/main");
  };

  return (
    <div className="landing-root-h">
      <div className="landing-all-h">
        <div className="landing-container-h">
          {/* NAVIGATION BAR */}
          <header className="nav-bar-h">
            <span className="nav-label-h">Role Setting</span>
            <span className="nav-divider-h">+++</span>

            <div className="role-tab-wrapper-h">
              <button
                className={`role-tab-h ${role === "EV" ? "active-h" : ""}`}
                onClick={() => setRole("EV")}>
                Emergency Vehicle
              </button>
              <button
                className={`role-tab-h ${role === "CONTROL" ? "active-h" : ""}`}
                onClick={() => setRole("CONTROL")}>
                Control Tower
              </button>
              <button
                className={`role-tab-h ${role === "AV" ? "active-h" : ""}`}
                onClick={() => setRole("AV")}>
                Auto Vehicle
              </button>
            </div>
          </header>

          {/* CONTENT AREA */}
          <section className="content-h">
            <div className="title-des-content-h">
              {/* TITLE */}
              <h1 className="landing-title-h">
                Emergency-Situation
                <br />
                Dashboard
              </h1>

              {/* DESCRIPTION */}
              <p className="landing-desc-h">
                {role}인 경우 대시보드를 표시합니다. 무엇을 입력해야 할지는 잘 모르겠지만 대략 두 줄
                정도면 충분할 것 같습니다. 그래서 내용을 채워넣는 부분입니다.
              </p>
            </div>

            {/* BUTTON */}
            <button onClick={goToMainPage} className="landing-btn-h">
              Show My Dashboard →
            </button>
          </section>
        </div>

        <div className="right-side-h">
          <img src={roadImg} alt="road view" className="landing-img-h" />
        </div>
      </div>
    </div>
  );
}

export default RoleLandingPage;
