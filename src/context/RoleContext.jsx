// src/context/RoleContext.jsx
import { createContext, useState, useEffect } from "react";

export const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [role, setRole] = useState("EV"); // 기본값 EV

  // 역할이 바뀌면 HTML 루트에 클래스 적용
  useEffect(() => {
    if (role == "AV1" || role == "AV2" || role == "AV") {
      document.documentElement.className = `av-theme`;
      return;
    }
    document.documentElement.className = `${role.toLowerCase()}-theme`;
  }, [role]);

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}
