// src/utils/messageFormatter.js

// --------------------------------------
// 0) prefix(출처 표시) 적용 도우미
// --------------------------------------
function withPrefix(role, messages) {
  return messages.map((m) => ({
    ...m,
    text: `[${role}] ${m.text}`,
  }));
}

// --------------------------------------
// 1) SIMPLE STATE (속도/방향/위치) → 값만 전달
// --------------------------------------
function formatSimpleState(data) {
  let messages = [];

  if (data.speed !== undefined) {
    messages.push({
      text: `${data.speed}km/h`,
      isSinho: false,
      key: "speed",
    });
  }

  if (data.direction) {
    const dirMap = {
      straight: "직진",
      left_turn: "좌회전",
      right_turn: "우회전",
    };

    messages.push({
      text: dirMap[data.direction] || data.direction,
      isSinho: false,
      key: "direction",
    });
  }

  if (data.position) {
    messages.push({
      text: `(${data.position[0]}, ${data.position[1]})`,
      isSinho: false,
      key: "position",
    });
  }

  return messages;
}

// --------------------------------------
// 2) EV FORMATTER
// --------------------------------------
export function renderEV(data) {
  let messages = [];

  // 상태 값 (simple)
  messages.push(...formatSimpleState(data));

  // 차선 변경 → 신호
  if (data.lane_change !== undefined) {
    messages.push({
      text: data.lane_change ? "차선 변경 중" : "차선 유지 중",
      isSinho: true,
      key: "lane_change",
    });
  }

  // 응급 모드 이벤트
  if (data.emergency) {
    messages.push({
      text: "응급 모드 활성화",
      isSinho: true,
    });
  }

  // 신호 전달 성공
  if (data.delivered_to) {
    messages.push({
      text: `신호 전송 완료 → ${data.delivered_to.join(", ")}`,
      isSinho: true,
    });
  }

  return withPrefix("EV", messages);
}

// --------------------------------------
// 3) AV FORMATTER (AV1 / AV2 공통)
// --------------------------------------
export function renderAV(data) {
  let messages = [];

  // 상태 값
  messages.push(...formatSimpleState(data));

  // 차선 변경 → 신호
  if (data.lane_change !== undefined) {
    messages.push({
      text: data.lane_change ? "차선 변경 중" : "차선 유지 중",
      isSinho: true,
      key: "lane_change",
    });
  }

  // 응급 감지/해제
  if (data.alert_radius !== undefined && data.emergency_present !== undefined) {
    messages.push({
      text: data.emergency_present
        ? `반경 ${data.alert_radius}km 내 응급 차량 감지`
        : `응급 상황 해제`,
      isSinho: true,
    });
  }

  // EV 신호 수신
  if (data.emergency_ev) {
    messages.push({
      text: `${data.emergency_ev.id}로부터 응급 신호 수신`,
      isSinho: true,
    });
  }

  const prefix = data.id || "AV";
  return withPrefix(prefix, messages);
}

// --------------------------------------
// 4) CONTROL FORMATTER
// --------------------------------------
export function renderControl(data) {
  let messages = [];

  // 전체 차량 목록 전달
  if (data.vehicles) {
    data.vehicles.forEach((v) => {
      messages.push({
        text: `${v.id} | ${v.speed}km/h | (${v.position[0]}, ${v.position[1]})`,
        isSinho: false,
      });
    });
  }

  // 응급 차량 존재 여부
  if (data.alert_radius !== undefined && data.emergency_present !== undefined) {
    messages.push({
      text: data.emergency_present
        ? `반경 ${data.alert_radius}km 내 응급 차량 존재`
        : "반경 내 안정 상태",
      isSinho: true,
    });
  }

  return withPrefix("CONTROL", messages);
}
