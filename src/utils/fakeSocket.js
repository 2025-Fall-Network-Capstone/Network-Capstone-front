// src/utils/fakeSocket.js

export function createFakeSocket(onMessage) {
  console.log("%c[FAKE SOCKET] STARTED", "color: green");

  const dummyData = [
    // 1. EV 기본 주행
    {
      type: "EV",
      data: {
        id: "EV",
        speed: 50,
        lane_change: false,
        position: [10, 5],
        direction: "STRAIGHT"
      }
    },

    // 2. EV 응급 ON
    {
      type: "EV",
      data: {
        id: "EV",
        speed: 55,
        lane_change: true,
        position: [11, 5],
        direction: "STRAIGHT",
        emergency: true
      }
    },

    // 3. EV 속도 증가 + 이동
    {
      type: "EV",
      data: {
        id: "EV",
        speed: 65,
        lane_change: true,
        position: [12, 6],
        direction: "STRAIGHT",
        emergency: true
      }
    },

    // 4. EV: 전달 성공 신호
    {
      type: "EV",
      data: { delivered_to: ["AV1", "AV2"], result: "success" }
    },

    // -----------------------------
    // AV1 이벤트
    // -----------------------------
    {
      type: "AV1",
      data: {
        id: "AV1",
        speed: 40,
        lane_change: false,
        position: [13, 6],
        direction: "RIGHT",
        alert_radius: 2,
        emergency_present: true
      }
    },

    {
      type: "AV1",
      data: {
        id: "AV1",
        speed: 35,
        lane_change: true,
        position: [13, 7],
        direction: "LEFT",
        alert_radius: 2,
        emergency_present: true
      }
    },

    // -----------------------------
    // AV2 이벤트
    // -----------------------------
    {
      type: "AV2",
      data: {
        id: "AV2",
        speed: 38,
        lane_change: false,
        position: [12, 4],
        direction: "RIGHT",
        alert_radius: 2,
        emergency_present: true
      }
    },

    {
      type: "AV2",
      data: {
        id: "AV2",
        speed: 30,
        lane_change: false,
        position: [12, 4],
        direction: "RIGHT",
        alert_radius: 2,
        emergency_present: true
      }
    },

    // -----------------------------
    // CONTROL 이벤트
    // -----------------------------
    {
      type: "CONTROL",
      data: {
        vehicles: [
          { id: "EV", speed: 65, position: [12, 6] },
          { id: "AV1", speed: 35, position: [13, 7] },
          { id: "AV2", speed: 30, position: [12, 4] }
        ],
        alert_radius: 2,
        emergency_present: true
      }
    },

    {
      type: "CONTROL",
      data: { alert_radius: 2, emergency_present: true }
    },

    {
      type: "CONTROL",
      data: { alert_radius: 2, emergency_present: false }
    },

    {
      type: "CONTROL",
      data: {
        vehicles: [
          { id: "EV", speed: 60, position: [15, 10] },
          { id: "AV1", speed: 33, position: [14, 7] },
          { id: "AV2", speed: 28, position: [12, 4] }
        ],
        alert_radius: 2,
        emergency_present: false
      }
    },

    // 추가 테스트용: STAGE 업데이트
    {
      type: "STAGE",
      data: { stage: 1 }
    },
    {
      type: "STAGE",
      data: { stage: 2 }
    },
    {
      type: "STAGE",
      data: { stage: 3 }
    }
  ];

  let idx = 0;

  const interval = setInterval(() => {
    if (idx < dummyData.length) {
      console.log("%c[FAKE SEND]", "color: purple", dummyData[idx]);
      onMessage(dummyData[idx]);
      idx++;
    } else {
      console.log("%c[FAKE SOCKET] END — 모든 이벤트 송출 완료", "color: gray");
    }
  }, 3000); // 3초 간격 테스트

  return () => clearInterval(interval);
}
