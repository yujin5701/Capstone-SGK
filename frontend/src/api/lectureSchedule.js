// src/api/lectureSchedule.js
export const generateSchedulesFromLectures = async (userId, semesterStart, semesterEnd, lectures) => {
  const response = await axios.post("/api/schedule/generate-from-lectures", {
    userId,
    semesterStart,
    semesterEnd,
    lectures,
  });
  return response.data.schedules;
};

export const getUserSchedules = async (userId) => {
  // ← lecture-schedules 가 아니라 schedule 테이블에서 조회
  const response = await axios.get(`/api/schedule`, {
    params: { user_id: userId }
  });
  return response.data;  // 컨트롤러가 enriched array를 리턴하도록 되어 있습니다.
};
