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
                className={`role-tab-h ${role === "AV1" ? "active-h" : ""}`}
                onClick={() => setRole("AV1")}>
                Auto Vehicle 1
              </button>
              <button
                className={`role-tab-h ${role === "AV2" ? "active-h" : ""}`}
                onClick={() => setRole("AV2")}>
                Auto Vehicle 2
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
                {role}의 주행 흐름을 가장 선명하게 보여주는 공간입니다.<br />
                지금 이 순간 차량이 어떤 상태에 있는지, 대시보드를 통해 바로 확인해보세요.
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
