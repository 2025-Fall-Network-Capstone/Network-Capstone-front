// src/utils/fakeSocket.js

export function createFakeSocket(onMessage) {
  console.log("%c[FAKE SOCKET] STARTED", "color: green");

  const dummyData = [
    // 1. EV 기본 주행
    {
      type: "EV",
      data: { id: "EV1", speed: 50, lane_change:false, position:[10,5], direction:"STRAIGHT" }
    },
    // 2. EV 응급 ON
    {
      type: "EV",
      data: { id:"EV1", speed:55, lane_change:true, position:[11,5], direction:"STRAIGHT", emergency:true }
    },
    // 3. EV 속도 증가 + 이동
    {
      type: "EV",
      data: { id:"EV1", speed:65, lane_change:true, position:[12,6], direction:"STRAIGHT", emergency:true }
    },
    // 4. EV 응급 신호 전송 성공
    {
      type:"EV",
      data:{ result:"success", delivered_to:["AV1","AV2"] }
    },

    // 5. AV1 감지 이벤트
    {
      type:"AV",
      data:{ id:"AV1", speed:40, lane_change:false, position:[13,6], direction:"RIGHT", alert_radius:2, emergency_present:true }
    },
    // 6. AV1 차선 양보 시작
    {
      type:"AV",
      data:{ id:"AV1", speed:35, lane_change:true, position:[13,7], direction:"LEFT", alert_radius:2, emergency_present:true }
    },

    // 7. AV2 감지 이벤트
    {
      type:"AV",
      data:{ id:"AV2", speed:38, lane_change:false, position:[12,4], direction:"RIGHT", alert_radius:2, emergency_present:true }
    },
    // 8. AV2 속도 감소
    {
      type:"AV",
      data:{ id:"AV2", speed:30, lane_change:false, position:[12,4], direction:"RIGHT", alert_radius:2, emergency_present:true }
    },

    // 9. CONTROL: 전체 차량 상황
    {
      type:"CONTROL",
      data:{
        vehicles:[
          { id:"EV1", speed:65, position:[12,6] },
          { id:"AV1", speed:35, position:[13,7] },
          { id:"AV2", speed:30, position:[12,4] }
        ],
        alert_radius:2,
        emergency_present:true
      }
    },

    // 10. CONTROL: 반경 내 EV 존재
    {
      type:"CONTROL",
      data:{ alert_radius:2, emergency_present:true }
    },

    // 11. CONTROL: 반경 내 EV 없음 업데이트
    {
      type:"CONTROL",
      data:{ alert_radius:2, emergency_present:false }
    },

    // 12. CONTROL: 전체 상황 요약
    {
      type:"CONTROL",
      data:{
        vehicles:[
          { id:"EV1", speed:60, position:[15,10] },
          { id:"AV1", speed:33, position:[14,7] },
          { id:"AV2", speed:28, position:[12,4] }
        ],
        alert_radius:2,
        emergency_present:false
      }
    },
  ];

  let idx = 0;

  const interval = setInterval(() => {
    if (idx < dummyData.length) {
      onMessage(dummyData[idx]);
      idx++;
    } else {
      console.log("%c[FAKE SOCKET] END — 모든 이벤트 송출 완료", "color: gray");
    }
  }, 5000); // 5초 간격

  return () => clearInterval(interval);
}
