import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateSchedulesFromLectures, getUserSchedules } from "../api/lectureSchedule";

const ScanningScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lectures, startDate, endDate } = location.state || {};


  useEffect(() => {
    const run = async () => {
      try {
        // 1) OCR → generate
        await generateSchedulesFromLectures(userId, semesterStart, semesterEnd, lectures);
  
        // 2) 새로 생성된 실제 일정 가져오기
        const schedules = await getUserSchedules(userId);
  
        navigate("/timelineview", { state: { schedules } });
      } catch (err) { … }
    };
    run();
  }, []);
  

  return (
    <div style={styles.container}>
      <h1 style={styles.logo}>Dayfull</h1>
      <p style={styles.loadingText}>강의 일정 생성 중 ···</p>
    </div>
  );
};

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    position: "relative",
    overflow: "hidden",
  },
  logo: {
    fontSize: "50px",
    fontWeight: "bold",
    color: "#56c8d8",
    fontFamily: "'Arial', sans-serif",
    marginBottom: "20px",
  },
  loadingText: {
    fontSize: "14px",
    color: "#888", 
  },
};

export default ScanningScreen;
