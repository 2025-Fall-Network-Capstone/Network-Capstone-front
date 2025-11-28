// src/App.jsx
import RoleLandingPage from "./pages/RoleLandingPage_he";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage.jsx";

function App() {
  // return <RoleLandingPage />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleLandingPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
