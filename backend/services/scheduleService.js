const db = require("../lib/db");
const { v4: uuidv4 } = require("uuid");
const { getDurations } = require("../services/travelTimeService");
const { findNearestSchedule } = require("../utils/distance"); 
const haversine = require("haversine-distance");
const { getGeocode } = require("../services/geocodeService");



// 일정 전체 조회
exports.getSchedules = async (user_id) => {
  const result = await db.query(
    "SELECT * FROM schedules WHERE user_id = $1 ORDER BY start_time",
    [user_id]
  );
  return result.rows;
};

// 일정 한 개 조회
exports.getScheduleById = async (id) => {
  const result = await db.query(
    `SELECT * FROM schedules WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

// 일주일 기준 일정 조회

exports.getUserSchedulesWithinWeek = async (user_id) => {
  const result = await db.query(
    `SELECT * FROM schedules 
     WHERE user_id = $1 
     ORDER BY start_time ASC`,
    [user_id]
  );

  return result.rows;
};


// 일정 추가
exports.addSchedule = async ({ 
  id = uuidv4(), 
  user_id,
  title,
  start_time,
  end_time,
  latitude,
  longitude,
  address,
  place_id = null,
  move_type = null,
  move_duration = null,
  walk_duration = null,
  transit_duration = null,
  drive_duration = null,
  is_recurring = false,
  color,
  source = "manual",
  recommendation_id = null
}) => {
  let description = null;
  let opening_hours = null;

  // 🔍 place_id가 있으면 장소 정보 조회
  if (place_id) {
    const placeRes = await db.query(
      `SELECT description, hours FROM places WHERE id = $1`,
      [place_id]
    );
    if (placeRes.rows.length > 0) {
      description = placeRes.rows[0].description;
      opening_hours = placeRes.rows[0].hours;
    }
  }

  const result = await db.query(
    `INSERT INTO schedules (
      id, user_id, title, start_time, end_time,
      latitude, longitude, address, place_id,
      move_type, move_duration,
      walk_duration, transit_duration, drive_duration,
      is_recurring, source, color, description, opening_hours, recommendation_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
     RETURNING *`,
    [
      id, user_id, title, start_time, end_time,
      latitude, longitude, address, place_id,
      move_type, move_duration,
      walk_duration, transit_duration, drive_duration,
      is_recurring, source, color, description, opening_hours, 
      recommendation_id || null
    ]
  );

  return result.rows[0];
};

// 일정 삭제
exports.deleteSchedule = async (id) => {
  console.log("🧨 DB에서 삭제 시도 중:", id);
  await db.query("DELETE FROM schedules WHERE id = $1", [id]);
  console.log("✅ DB 삭제 완료");
};

// 일정 수정
exports.updateSchedule = async (id, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in data) {
    fields.push(`${key} = $${idx}`);
    values.push(data[key]);
    idx++;
  }

  values.push(id);
  const query = `UPDATE schedules SET ${fields.join(", ")} WHERE id = $${idx}`;
  await db.query(query, values);
};

// 이번 주 월요일 구하기
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// 날짜 + n일
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// 중복 일정 체크
async function checkIfAlreadyExists(userId, startTime) {
  const result = await db.query(
    `SELECT id FROM schedules 
     WHERE user_id = $1 AND start_time = $2`,
    [userId, startTime]
  );
  return result.rows.length > 0;
}

// 일정 하나를 기준으로 4주치 복사 (일정 추가 시 사용)
exports.generateRecurringForSchedule = async (schedule) => {
  const {
    user_id,
    title,
    start_time,
    end_time,
    latitude,
    longitude,
    address,
    place_id,
    move_type,
    move_duration,
    walk_duration,
    transit_duration,
    drive_duration,
    source
  } = schedule;

  for (const weekOffset of [7, 14, 21, 28]) {
    const newStart = new Date(start_time);
    const newEnd = new Date(end_time);
    newStart.setDate(newStart.getDate() + weekOffset);
    newEnd.setDate(newEnd.getDate() + weekOffset);

    const exists = await checkIfAlreadyExists(user_id, newStart);
    if (exists) continue;

    await db.query(
      `INSERT INTO schedules (
        id, user_id, title, start_time, end_time,
        latitude, longitude, address, place_id,
        move_type, move_duration,
        walk_duration, transit_duration, drive_duration,
        is_recurring, source
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true,$15)`,
      [
        uuidv4(),
        user_id,
        title,
        newStart,
        newEnd,
        latitude,
        longitude,
        address,
        place_id,
        move_type,
        move_duration,
        walk_duration,
        transit_duration,
        drive_duration,
        source || "manual"
      ]
    );
  }
};

// 거리 계산
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 한 달 반복 일정 복사 (4주간 생성)
exports.generateMonthRecurringSchedules = async () => {
  const today = new Date();
  const thisMonday = getMonday(today);         
  const nextMonday = addDays(thisMonday, 7);  

  const result = await db.query(
    `SELECT * FROM schedules
     WHERE is_recurring = true
       AND start_time >= $1 AND start_time < $2`,
    [thisMonday, nextMonday]
  );

  const schedules = result.rows;
  let copied = 0;

  for (const sched of schedules) {
    const {
      user_id,
      title,
      start_time,
      end_time,
      latitude,
      longitude,
      address,
      place_id,
      move_type,
      move_duration,
      walk_duration,
      transit_duration,
      drive_duration,
      source
    } = sched;
    for (const weekOffset of [7, 14, 21, 28]) {
      const newStart = new Date(start_time);
      const newEnd = new Date(end_time);
      newStart.setDate(newStart.getDate() + weekOffset);
      newEnd.setDate(newEnd.getDate() + weekOffset);

      const exists = await checkIfAlreadyExists(user_id, newStart);
      if (exists) continue;

      await db.query(
        `
        INSERT INTO schedules (
          id, user_id, title, start_time, end_time,
          latitude, longitude, address, place_id,
          move_type, move_duration,
          walk_duration, transit_duration, drive_duration,
          is_recurring, source
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true,$15)
        `,
        [
          uuidv4(),
          user_id,
          title,
          newStart,
          newEnd,
          latitude,
          longitude,
          address,
          place_id,
          move_type,
          move_duration,
          walk_duration,
          transit_duration,
          drive_duration,
          source || "manual"
        ]
      );

      copied++;
    }
  }

  return {
    message: `✅ ${copied}개의 반복 일정이 한 달 치로 생성되었습니다.`,
  };
};

// index.js 의 cron.schedule 에서 호출하는 이름으로 alias 추가
exports.generateNextMonthRecurringSchedules = exports.generateMonthRecurringSchedules;

exports.createAutoSchedule = async ({ user_id, place, source = "recommendation", color, recommendation_id}) => {
   // 1. 좌표가 없으면 geocode로 보완
   console.log("🧠 일정 로딩 시작");

  if (!place.latitude || !place.longitude) {
    console.warn("📍 Perplexity 좌표 누락 → Google Geocoding으로 보완 시도");
    const coords = await getGeocode(place.location);
    place.latitude = coords.latitude;
    place.longitude = coords.longitude;
  }

  // 2. 사용자 일정 가져오기
  console.trace("🧭 getUserSchedulesWithinWeek() 호출 위치 추적");
  const schedules = await exports.getUserSchedulesWithinWeek(user_id);
  let fromSchedule = null;
  let fromAddress = "서울 성동구"; // 기본값

  if (schedules.length > 0) {
    fromSchedule = findNearestSchedule(schedules, place);
    if (fromSchedule?.address) {
      fromAddress = fromSchedule.address;
    }
  }
  console.log("📆 불러온 일정 수:", schedules.length);
console.log("🧾 불러온 일정 리스트:", schedules.map(s => ({
  title: s.title,
  start: s.start_time,
  lat: s.latitude,
})));


  // 3. 이동시간 계산
  const durations = await getDurations({
    from: fromAddress,
    target: {
      latitude: place.latitude,
      longitude: place.longitude,
    }
  });

  const durationMap = {
    walking: durations.walk,
    driving: durations.drive,
    transit: durations.transit
  };

  // 4. 가장 짧은 이동수단 선택

  let shortestType = "walking";
  let shortestDuration = durations.walk;
  for (const [type, dur] of Object.entries(durationMap)) {
    if (dur !== null && dur < shortestDuration) {
      shortestType = type;
      shortestDuration = dur;
    }
  }

  // 5. 빈 시간대 탐색 (이동시간 포함)
  const durationMinutes = 60;
  const timeSlot = findAvailableSlot(schedules, shortestDuration, durationMinutes, place.latitude, place.longitude);


  if (!timeSlot) {
    throw new Error("⚠️ 적절한 빈 시간대를 찾을 수 없습니다.");
  }

  const { start_time, end_time } = timeSlot;

  // 6. 일정 생성

  const insertResult = await db.query(
     `INSERT INTO schedules (
      id, user_id, title, start_time, end_time,
      latitude, longitude, address,
      move_type, move_duration,
      walk_duration, transit_duration, drive_duration,
      is_recurring, source, color, place_id, recommendation_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
    [
      uuidv4(),
      user_id,
      place.title,
      start_time,
      end_time,
      place.latitude,
      place.longitude,
      place.location,
      shortestType,
      shortestDuration,
      durations.walk,
      durations.transit,
      durations.drive,
      false,
      source,
      color,
      place.id, 
      recommendation_id || null
    ]
  );

  return insertResult.rows[0]; 
};

function findAvailableSlot(schedules, moveMinutes, durationMinutes, targetLat, targetLon) {
  const totalMinutes = moveMinutes + durationMinutes;
  const sorted = [...schedules].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const slots = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const prevEnd = new Date(sorted[i].end_time);
    const nextStart = new Date(sorted[i + 1].start_time);
    const gap = (nextStart - prevEnd) / (1000 * 60);

    if (gap >= totalMinutes) {
      const slotStart = new Date(prevEnd.getTime() + moveMinutes * 60 * 1000);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      const dist = calculateDistance(sorted[i].latitude, sorted[i].longitude, targetLat, targetLon);
      slots.push({ start_time: slotStart, end_time: slotEnd, distance: dist });
    }
  }

  // 마지막 일정 이후의 빈 시간 고려
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    const lastEnd = new Date(last.end_time);
    const slotStart = new Date(lastEnd.getTime() + moveMinutes * 60 * 1000);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
    const dist = calculateDistance(last.latitude, last.longitude, targetLat, targetLon);
    slots.push({ start_time: slotStart, end_time: slotEnd, distance: dist });
  }

  // 거리 기준 정렬
  slots.sort((a, b) => a.distance - b.distance);
  return slots[0] || null;
}
