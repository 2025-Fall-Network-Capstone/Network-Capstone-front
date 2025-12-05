// src/pages/RoleLandingPage.jsx
import "../styles/roleLanding_he.css";
import roadImg from "../assets/road.jpg";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { RoleContext } from "../context/RoleContext.jsx";

function RoleLandingPage() {
  const { role, setRole, setStartSignal } = useContext(RoleContext);
  const navigate = useNavigate();

  const goToMainPage = () => {
    // CONTROL일 때만 시작 신호 플래그 설정
    if (role === "CONTROL") {
      setStartSignal(true);
    }

    navigate("/main");
  };

  return (
    <div className="landing-root-h">
      <div className="landing-all-h">
        <div className="landing-container-h">

          <header className="nav-bar-h">
            <span className="nav-label-h">Role Setting</span>
            <span className="nav-divider-h">+++</span>

            <div className="role-tab-wrapper-h">
              <button
                className={`role-tab-h ${role === "EV" ? "active-h" : ""}`}
                onClick={() => setRole("EV")}
              >
                Emergency Vehicle
              </button>

              <button
                className={`role-tab-h ${role === "CONTROL" ? "active-h" : ""}`}
                onClick={() => setRole("CONTROL")}
              >
                Control Tower
              </button>

              <button
                className={`role-tab-h ${role === "AV1" ? "active-h" : ""}`}
                onClick={() => setRole("AV1")}
              >
                Auto Vehicle 1
              </button>

              <button
                className={`role-tab-h ${role === "AV2" ? "active-h" : ""}`}
                onClick={() => setRole("AV2")}
              >
                Auto Vehicle 2
              </button>
            </div>
          </header>

          <section className="content-h">
            <div className="title-des-content-h">
              <h1 className="landing-title-h">
                Emergency-Situation
                <br />
                Dashboard
              </h1>

              <p className="landing-desc-h">
                선택한 역할( {role} )로 대시보드를 표시합니다.
              </p>
            </div>

            {/* ★ 이 버튼을 눌러야 시작 신호가 전송됨 */}
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
