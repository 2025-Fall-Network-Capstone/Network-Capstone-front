// // src/context/PopupContext.jsx
// import { createContext, useState } from "react";

// export const PopupContext = createContext();

// export function PopupProvider({ children }) {
//   const [popup, setPopup] = useState(true); // 기본값 EV

//   // 역할이 바뀌면 HTML 루트에 클래스 적용
//   // useEffect(() => {
//   //   document.documentElement.className = `${popup.toLowerCase()}-theme`;
//   // }, [popup]);

//   return <PopupContext.Provider value={{ popup, setPopup }}>{children}</PopupContext.Provider>;
// }
