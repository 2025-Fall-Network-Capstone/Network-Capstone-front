// src/utils/messageFormatter.js

// 공통 변환
function formatCommon(data) {
  let lines = [];

  if (data.speed !== undefined)
    lines.push(`⚡ 현재 속도는 ${data.speed}km/h 입니다`);

  if (data.lane_change !== undefined)
    lines.push(data.lane_change ? `↪️ 차선을 변경하고 있습니다` : `➡️ 현재 차선을 유지하고 있습니다`);

  if (data.direction)
    lines.push(
      data.direction === "STRAIGHT"
        ? "⬆️ 직진으로 진행 중입니다"
        : data.direction === "LEFT"
        ? "⬅️ 좌회전으로 진행 중입니다"
        : "➡️ 우회전으로 진행 중입니다"
    );

  if (data.position)
    lines.push(`📍 현재 위치는 (${data.position[0]}, ${data.position[1]}) 입니다`);

  return lines;
}

// EV
export function renderEV(data) {
  let messages = [];

  // dongjak - 상태정보
  let stateLines = formatCommon(data);
  stateLines.forEach(line => messages.push({ text: line, isSinho: false }));

  // sinho - 이벤트
  if (data.emergency) 
    messages.push({ text: `🚨 응급 모드가 활성화되었습니다`, isSinho: true });

  if (data.delivered_to)
    messages.push({ text: `📡 신호 전송이 완료되었습니다. 대상: ${data.delivered_to.join(", ")}`, isSinho: true });

  return messages;
}

// AV
export function renderAV(data) {
  let messages = [];

  // dongjak - 상태정보
  let stateLines = formatCommon(data);
  stateLines.forEach(line => messages.push({ text: line, isSinho: false }));

  // sinho - 응급 감지
  if (data.alert_radius !== undefined && data.emergency_present !== undefined) {
    if (data.emergency_present) {
      messages.push({ 
        text: `⚠️ 반경 ${data.alert_radius}km 내에 응급 차량이 감지되었습니다. 주의하시기 바랍니다`, 
        isSinho: true 
      });
    } else {
      messages.push({ 
        text: `✅ 응급 상황이 해제되었습니다`, 
        isSinho: true 
      });
    }
  }

  // sinho - EV 신호 수신
  if (data.emergency_ev)
    messages.push({ 
      text: `🚨 ${data.emergency_ev.id}로부터 응급 신호를 수신했습니다`, 
      isSinho: true 
    });

  return messages;
}

// Control Tower
export function renderControl(data) {
  let messages = [];

  // dongjak - 차량 리스트
  if (data.vehicles) {
    data.vehicles.forEach(v => {
      messages.push({ 
        text: `📊 ${v.id} — 속도 ${v.speed}km/h, 위치 (${v.position[0]}, ${v.position[1]})`, 
        isSinho: false 
      });
    });
  }

  // sinho - EV 존재 여부
  if (data.alert_radius !== undefined && data.emergency_present !== undefined) {
    if (data.emergency_present) {
      messages.push({ 
        text: `🚨 반경 ${data.alert_radius}km 내에 응급 차량이 있습니다`, 
        isSinho: true 
      });
    } else {
      messages.push({ 
        text: `✅ 반경 ${data.alert_radius}km 내에 응급 차량이 없습니다`, 
        isSinho: true 
      });
    }
  }

  return messages;
}