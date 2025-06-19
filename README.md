# 📆 E-CLAIR: Dayfull


[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-22.13.1-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-6.2-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-20.10-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT4o-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)
[![Perplexity](https://img.shields.io/badge/Perplexity-llama3--sonar-000000?style=flat)](https://www.perplexity.ai/)


---
<br>

## 📌 프로젝트 개요

> 대학생의 하루를 다채롭게 채워주는 스마트 일정 관리 서비스, **Dayfull**

**Dayfull**은 대학 강의 시간표와 통합된 일정 자동 생성, 가고 싶은 장소 자동 배치, 그리고 개인화된 장소 추천 기능을 제공하는 **스마트 캘린더 플랫폼**입니다.


### 테스트 주소 및 계정:
- 테스트 주소:
- 테스트 ID:
- 테스트 PASSWORD:

---

<br>

## 👥 팀 정보

**44팀 E-CLAIR**

| 이름 | 역할 |
|------|------|
| 구자은 | 프론트엔드 / UI 디자인 |
| 궁유진 | 백엔드 / AI |
| 손수민 | 백엔드 / AI |

---

<br>

## 🔍 주요 기능

### 📅 1. 시간표 OCR 기반 일정 생성
- **에브리타임** 시간표 이미지를 업로드하면, OCR로 강의명/시간/장소 정보를 추출하고 자동 반복 일정을 생성합니다.
- → `Google Vision API`, `PostgreSQL`, `GPT` 

### 📍 2. 장소명 입력만으로 자동 일정 배치
- 사용자가 입력한 장소명에 대해 위치, 운영시간, 거리 정보를 탐색한 후 **가장 효율적인 시간대에 일정 자동 배치**
- → `Perplexity API`, `TMAP / Google Maps API`, `Redis`, `PostgreSQL`

### 🌟 3. 개인화 기반 장소 추천
- 타임라인의 빈 시간대를 클릭하면 사용자의 동선, 선호 키워드를 고려해 추천 장소를 제시
- 추천된 장소는 한 줄 소개, 이동 수단별 소요 시간과 함께 제공되고 바로 일정으로 추가 가능
- → `GPT`, `Redis`, `Perplexity API`, `Kakao Local API`, `TMAP API`

---

<br>

## 🎨 서비스 플로우 (Figma)

👉 [Figma 링크 보기](https://www.figma.com/design/Fk1fj1MQfqRAMOVf8soijl/Dayfull---1%EC%B0%A8-%EB%B3%B4%EA%B3%A0%EC%84%9C?node-id=0-1)

---

<br>

## 🗂️ 소스코드 설명

해당 프로젝트는 코드 가독성 향상 및 기능별 유지보수 용이를 위해 `controllers`, `routes`, `services` 구조로 분리하여 구현하였다. 

`controllers`는 클라이언트 요청을 받아 서비스에 전달하고 응답을 반환하는 입구 역할, `routes`는 URL 경로와 HTTP 메서드에 따라 어떤 controller 함수를 호출할지 정의한다. `services`는 실제 비즈니스 로직을 수행하는 핵심 계층이다.


```
/Capstone-SGK(main)
├── backend  # Node.js 기반 백엔드 서버
│   ├── controllers  # 각 기능별로 라우팅 요청을 받아 서비스 호출
│   │   ├── addressController.js  # 사용자 주소 관리 기능
│   │   ├── autoScheduleController.js  # 장소명 기반 일정 생성 기능
│   │   ├── feedbackController.js  # 피드백 저장 및 키워드 추출 기능
│   │   ├── placeController.js  # 장소 CRUD 기능
│   │   ├── placeInfoController.js  # 장소 정보 브라우징 기능
│   │   ├── recommendationController.js  # 추천 관련 기능
│   │   ├── scheduleController.js  # 일정 CRUD 관련 기능
│   │   └── travelTimeController.js  # 이동시간 탐색 기능
│   ├── keys                # Firebase 인증용 키 
│   │   └── dayfull-timetable-e933618fea72.json
│   ├── lib                 # 외부 API, DB, Redis 연결
│   │   ├── db.js
│   │   ├── openai.js
│   │   └── redis.js
│   ├── middleware          # 인증 관련 미들웨어
│   │   └── authMiddleware.js
│   ├── middlewares         # 이미지 업로드 미들웨어
│   │   └── multer.js
│   ├── models              # 시간표 이미지 추출 기능
│   │   └── lectureModel.js
│   ├── routes              # controllers와 연결되는 HTTP endpoint 경로
│   │   ├── addressRoutes.js
│   │   ├── autoScheduleRoutes.js
│   │   ├── classScheduleRoutes.js
│   │   ├── distanceRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── lectureScheduleRoutes.js
│   │   ├── placeInfoRoutes.js
│   │   ├── placeRoutes.js
│   │   ├── preferenceRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── scheduleRoutes.js
│   │   └── userRoutes.js
│   ├── services            # 핵심 비즈니스 로직 처리
│   │   ├── addressService.js
│   │   └── (...)
│   ├── utils               # 거리 계산, 좌표 격자 변환, 시간 파싱 등 공통 함수 모음
│   │   ├── distance.js
│   │   ├── gridPositions.js
│   │   └── parseDuration.js
│   ├── .dockerignore
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
│
├── frontend                # Next.js 기반 프론트엔드 클라이언트
│   ├── public
│   │   ├── timetable.png
│   │   └── vite.svg
│   ├── src
│   │   ├── api             # 백엔드와 통신하는 API 함수
│   │   │   ├── autoschedule.js
│   │   │   └── (...)
│   │   ├── assets          # 프로젝트에서 사용하는 로고/아이콘
│   │   │   ├── react.svg
│   │   ├── components      # 공통 UI 컴포넌트
│   │   │   ├── AddTopBar.jsx
│   │   │   └── (...)
│   │   ├── screens         # 화면별 페이지 구성 
│   │   │   ├── AddAddressScreen.jsx
│   │   │   └── (...)
│   │   ├── styles
│   │   │   └── custom.css
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .dockerignore
│   ├── .env
│   ├── .env.docker
│   ├── .gitignore
│   ├── dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── vite.config.js
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
│
├── init                   # 초기 DB 스키마 설정
│   ├── init.sql
│   ├── lectureSchedules.sql
│   └── lectures.sql
├── postgresql             # PostgreSQL 컨테이너용 커스텀 설정
│   └── Dockerfile
├── redis                  # Redis 컨테이너 설정
│   └── Dockerfile
├── src                    # 스타트 초기 구현 코드(현재는 사용 X)
│   ├── dayfull_timetable.py
│   ├── recomm.py
│   └── redis_connection.py
├── .gitignore
├── README.md
├── Capstone-1stReport-44-E_CLAIR v1-2025-03-28.md
├── Capstone-2ndReport-44-E_CLAIR v1-2025-05-07.md
├── ERD 수정본.png
├── Ground_Rule.MD
├── SW 구조도.png
├── SW구조도수정본 (1).png
├── docker-compose.yml
└── 피그마.png
```

<br>

---

## 🛠️ How to build & install 

### 🐳 How to Run with Docker

Dayfull Docker 환경에서 쉽게 실행할 수 있도록 구성되어 있습니다.

PostgreSQL, Redis, 백엔드, 프론트엔드까지 한 번에 실행할 수 있어 개발과 테스트가 간편합니다.

### 1️⃣ 레포지토리 클론

```bash
git clone https://github.com/Yeolmaeg/Capstone-SGK.git
cd Capstone-SGK
```

### 2️⃣ 환경 변수 파일 설정

📁 `/backend/.env`

```
DB_HOST=postgresql
DB_PORT=5432
DB_NAME=dayfullpg
DB_USER=postgres
DB_PASSWORD=dayfull
REDIS_HOST=redis
REDIS_PORT=6379

OPENAI_API_KEY=your_openai_key
PERPLEXITY_API_KEY=your_perplexity_key
GOOGLE_APPLICATION_CREDENTIALS=./keys/dayfull-timetable-e933618fea72.json
```

📁 `/frontend/.env.docker`

```
VITE_PORT=5173
DOCKER=true
```

현재 위의 환경변수 파일이 이미 존재합니다. 그리고 도커 환경에서는 이와 같은 설정이  `docker-compose.yml`에 포함되어 있기 때문에, 특정 명령어 실행 없이 PostgreSQL 컨테이너가 자동으로 다음을 수행합니다.

- `dayfullpg` 데이터베이스 생성
- `postgres` 계정과 비밀번호 `dayfull` 자동 설정
- `/init` 디렉토리의 SQL 파일을 실행해 초기 데이터 스키마 생성

---

### 3️⃣ 도커로 전체 애플리케이션 실행

프로젝트 루트 디렉토리에서 아래 명령어를 실행하면 백엔드, 프론트엔드, PostgreSQL, Redis 컨테이너가 실행됩니다.

- `postgresql`, `redis` 먼저 실행됨
- `backend`는 `.env` 설정에 따라 DB/Redis에 연결됨
- `frontend`는 `npm run dev`로 개발 서버를 띄우고 브라우저용 앱 제공
- 프론트에서 API 요청을 보내면 백엔드로 전달되고, DB/Redis와 연결됨

```bash
docker-compose up --build
```

 초기 실행 시 다소 시간이 걸릴 수 있으며, 빌드 후 모든 컨테이너가 자동으로 동일 네트워크에 연결됩니다.

---

<br>

## 🚧 How to test
Dayfull의 API는 RESTful 방식으로 제공되며, Postman을 활용한 기능 테스트가 가능합니다

---

### 🛠️ 1. Postman 설치 및 실행

1. Postman 공식 사이트 접속 → https://www.postman.com/downloads/
2. 운영체제에 맞는 설치 파일 다운로드 후 설치
3. 실행 후 회원가입
4. 앱 실행 후 **Workspace → New → HTTP Request** 선택

---

### 테스트 계정

```bash
{
  "email": "테스트메일@example.com",
  "password": "12345678",
  "userId": "f49687dd-3a03-4516-a798-3faab06abefc"
}
```

---

### 📬 2. 주요 기능 API 요청 명세 및 응답 예시

### 1.  장소명 기반 일정 생성 기능

- **Method**: `POST`
- **URL**: `https://dayfull.onrender.com/api/auto-schedule`
- **Body (JSON) 예시**

```json
{
  "place_name": "왕십리 힙덱",
  "user_id": "f49687dd-3a03-4516-a798-3faab06abefc"
}
```
![실제Body](./dayfull테스트/포스트맨1.png)

- **Response (JSON) 예시**

```json
{
  "message": "✅ 자동 일정 생성 완료",
  "schedule": {
    "id": "20047e29-4626-4aed-98d1-c4e469c8e198",
    "user_id": "f49687dd-3a03-4516-a798-3faab06abefc",
    "place_id": null,
    "recommendation_id": null,
    "title": "왕십리 힙덱",
    "address": "서울특별시 성동구 마조로 33, 04760",
    "opening_hours": null,
    "description": null,
    "latitude": 37.561472,
    "longitude": 127.038721,
    "start_time": "2025-05-21T20:33:00.000Z",
    "end_time": "2025-05-21T21:33:00.000Z",
    "move_type": "driving",
    "move_duration": 33,
    "walk_duration": 71,
    "transit_duration": 33,
    "drive_duration": 33,
    "source": "from_place",
    "is_recurring": false,
    "color": "#d1ebb6",
    "created_at": "2025-06-18T12:39:36.237Z",
    "satisfied": null
  }
}
```
![실제Response](./dayfull테스트/포스트맨1답.png)


### 2. 장소 추천 기능

- **Method**: `POST`
- **URL**: `https://dayfull.onrender.com/api/recommendation/auto`
- **Body (JSON) 예시**

```json
{
  "user_id": "f49687dd-3a03-4516-a798-3faab06abefc",
  "time": "2025-05-21T21:00:00"
}
```

![실제Request](./dayfull테스트/포스트맨2.png)


- **Response (JSON) 예시**

```json
{
  "message": "추천 + 이동시간 + 일정 자동 생성 완료",
  "schedule": {
    "id": "95c15f36-72e2-4ea3-a176-33a1c9183e2a",
    "user_id": "f49687dd-3a03-4516-a798-3faab06abefc",
    "place_id": "44749e2c-f5fc-4f7b-96c1-2dfad986daa4",
    "recommendation_id": null,
    "title": "카페 꼼마 연남",
    "address": "서울특별시 마포구 동교로 247",
    "opening_hours": "월 09:00~23:00, 화~일 08:00~23:00",
    "description": "지하 1층부터 4층까지 넓은 공간과 높은 층고를 자랑하는 노트북 작업과 공부, 독서에 적합한 홍대 대표 카공 카페입니다.",
    "latitude": 37.562837,
    "longitude": 126.925139,
    "start_time": "2025-05-21T21:00:00.000Z",
    "end_time": "2025-05-21T22:00:00.000Z",
    "move_type": "transit",
    "move_duration": 12,
    "walk_duration": 25,
    "transit_duration": 12,
    "drive_duration": 16,
    "source": "recommendation",
    "is_recurring": false,
    "color": "#d1ebb6",
    "created_at": "2025-06-18T12:42:26.137Z",
    "satisfied": null
  },
  "place": {
    "name": "카페 꼼마 연남",
    "address": "서울특별시 마포구 동교로 247",
    "description": "지하 1층부터 4층까지 넓은 공간과 높은 층고를 자랑하는 노트북 작업과 공부, 독서에 적합한 홍대 대표 카공 카페입니다.",
    "category": "카페/스터디카페",
    "why": "대학생",
    "latitude": 37.562837,
    "longitude": 126.925139,
    "hours": "월 09:00~23:00, 화~일 08:00~23:00",
    "placeId": "44749e2c-f5fc-4f7b-96c1-2dfad986daa4"
  },
  "recommendationId": "c5975918-6a1e-45e9-bff4-c2252bd21070",
  "placeId": "44749e2c-f5fc-4f7b-96c1-2dfad986daa4"
}
```
![실제Response](./dayfull테스트/포스트맨2답.png)


### 3.  피드백 후 한 줄 소개에서 키워드 추출 기능

### 3-(1) 사용자 피드백 저장

- **Method**: `POST`
- **URL**: `https://dayfull.onrender.com/api/feedback`
- **Body (JSON) 예시**

```json
{
  "userId": "f49687dd-3a03-4516-a798-3faab06abefc",
  "scheduleId": "95c15f36-72e2-4ea3-a176-33a1c9183e2a",
  "satisfied": true
}
```

- **Response (JSON) 예시**

```json
{
  "message": "피드백 저장 완료"
}
```

![테스트결과](./dayfull테스트/포스트맨3-1.png)



### 3-(2) 저장된 사용자 키워드 조회

- **Method**: `GET`
- **URL**: `https://dayfull.onrender.com/api/preferences/:userId`
- **Response (JSON) 예시**

```json
{
  "userId": "f49687dd-3a03-4516-a798-3faab06abefc",
  "preferences": [
    "대학생",
    "공간",
    "층고",
    "독서"
  ]
}
```

- "대학생"은 초기 사용자 키워드
- 사용된 한줄 소개 `지하 1층부터 4층까지 넓은 공간과 높은 층고를 자랑하는 노트북 작업과 공부, 독서에 적합한 홍대 대표 카공 카페입니다.`
    - 추출된 키워드:  `공간` , `층고`, `독서`

![테스트결과](./dayfull테스트/포스트맨3-2.png)



### 4. 시간표 이미지 OCR 처리 후 강의 데이터 획득

시간표샘플2으로 사용자 강의 데이터를 생성합니다.

- **Method**: `POST`
- **URL**: `https://dayfull.onrender.com/api/class-schedule/upload`
- **Body 예시**: form-data → Key: image(file), Value: 에브리타임 시간표 이미지
- **Response(JSON) 예시**:
```
{
    "lectures": [
        {
            "id": "85845d3b-c859-4b3e-9bfd-03e87ac1835b",
            "name": "정보통신공학(01)",
            "day": 1,
            "start_time": "11:00:00",
            "end_time": "12:15:00",
            "class_time": 33,
            "abb_address": "공학B153",
            "address": "서울특별시 서대문구 이화여대길 52 이화여자대학교 신공학관 153호"
        },
...
        { 
            "id": "e2ac4d64-3ee5-44bc-9106-655ca48d8c6e",
            "name": "데이터베이스(01)",
            "day": 5,
            "start_time": "14:00:00",
            "end_time": "15:15:00",
            "class_time": 55,
            "abb_address": "공학A107",
            "address": "서울특별시 서대문구 이화여대길 52 이화여자대학교 아산공학관 107호"
        }
    ]
}
```

![테스트결과](./dayfull테스트/포스트맨4.png)


### 5. 사용자 강의 데이터 기반 일정 반복 생성

위에서 생성된 강의 데이터를 기반으로 반복 일정을 생성합니다.

- **Method**: `POST`
- **URL**: `https://dayfull.onrender.com/api/lecture-schedules/generate`
- **Body 예시**: raw (JSON)
```
{
  "userId": "f49687dd-3a03-4516-a798-3faab06abefc",
  "semesterStart": "2025-03-02",
  "semesterEnd": "2025-06-23"
}
```

![실제Request](./dayfull테스트/포스트맨5.png)


- **Response(JSON) 예시**
```
{
    "schedules": [
        {
            "user_id": "사용자 UUID",
            "title": "컴퓨터알고리즘(01)",
            "address": "서울특별시 서대문구 이화여대길 52 이화여자대학교 신공학관 161호",
            "latitude": 37.5618588,
            "longitude": 126.9468339,
            "start_time": "2025-03-04T03:30:00.000Z",
            "end_time": "2025-03-04T04:45:00.000Z",
            "move_type": null,
            "move_duration": null,
            "walk_duration": null,
            "transit_duration": null,
            "drive_duration": null,
            "source": "timetable",
            "color": "#d1ebb6",
            "is_recurring": false
        },
...
        {
            "user_id": "사용자 UUID",
            "title": "네트워크보안",
            "address": "서울특별시 서대문구 이화여대길 52 이화여자대학교 아산공학관 101호",
            "latitude": 37.5618588,
            "longitude": 126.9468339,
            "start_time": "2025-03-13T00:30:00.000Z",
            "end_time": "2025-03-13T01:45:00.000Z",
            "move_type": null,
            "move_duration": null,
            "walk_duration": null,
            "transit_duration": null,
            "drive_duration": null,
            "source": "timetable",
            "color": "#d1ebb6",
            "is_recurring": false
        }
    ]
}
```

![실제Response](./dayfull테스트/포스트맨5답.png)



### 6. 이동 수단별 이동 시간 구하기

- **Method**: `POST`
- **URL**: `https://dayfull.onrender.com/api/distance/detail`
- **Body 예시**: raw (JSON)
```
{
  "from": "서울특별시 강남구 테헤란로 212",
  "to": "서울특별시 종로구 세종대로 209"
}
```

![실제Request](./dayfull테스트/포스트맨6.png)


- **Response(JSON) 예시**
```
{
    "straightDistance": "9.96 km",
    "travelTimes": {
        "walking": "210분",
        "driving": "35분",
        "transit": "46분",
        "transit_details": [
            {
                "line": "4211",
                "vehicle": "버스",
                "departure_stop": "역삼역.GS타워",
                "arrival_stop": "압구정역3번출구"
            },
            {
                "line": "3호선",
                "vehicle": "지하철",
                "departure_stop": "압구정",
                "arrival_stop": "경복궁"
            }
        ]
    }
}
```

![실제Response](./dayfull테스트/포스트맨6답.png)



---

<br>

## 샘플 데이터

Render의 무료 요금 플랜을 사용 중이므로 서버 접속 시 1~2분 가량의 활성화 시간이 소요될 수 있습니다.

### 1. 테스트 계정
문서 상단에서도 확인 가능하다.
**id**:
**password**: 

### 2. 테스트 시간표 이미지

이화여자대학교 컴퓨터공학 전공 과목으로 구성된 3개의 샘플 시간표는 아래와 같다.

<p float="left">
  <img src="./dayfull테스트/테스트시간표1.jpg" width="230"/>
  <img src="./dayfull테스트/테스트시간표2.jpg" width="230"/>
  <img src="./dayfull테스트/테스트시간표3.jpg" width="230"/>
</p>

---

<br>

## 사용한 오픈소스

| 라이브러리 | 설명 | 사용 목적 |
|------------|------|-----------|
| [Express](https://expressjs.com/ko/)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| Node.js 기반 백엔드 API 서버 프레임워크&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| REST API 서버 구성 및 라우팅 처리 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
| [React Native](https://reactnative.dev/) | 모바일 앱 UI 프레임워크 | 프론트엔드 화면 구성 및 타임라인 UI 구현 |
| [PostgreSQL](https://www.postgresql.org/) | 오픈소스 관계형 데이터베이스 | 사용자, 일정, 장소, 추천 결과 등의 데이터 저장 |
| [Redis](https://redis.io/) | In-memory 데이터 저장소 | 사용자 선호 키워드 캐싱 및 빠른 데이터 접근 |
| [Axios](https://axios-http.com/) | HTTP 요청 처리 라이브러리 | GPT, Perplexity 등 외부 API 호출 |
| [Dotenv](https://github.com/motdotla/dotenv) | `.env` 파일의 환경변수 로더 | API 키 및 DB 비밀번호 등의 민감 정보 관리 |
| [Docker](https://www.docker.com/) | 컨테이너 기반 실행 환경 도구 | PostgreSQL, Redis, 백엔드, 프론트 통합 실행 구성 |
| [Docker Compose](https://docs.docker.com/compose/) | 멀티 컨테이너 환경 자동화 툴 | 모든 서비스 컨테이너화, 자동 빌드 및 실행 |
| [@google-cloud/vision](https://github.com/googleapis/nodejs-vision) | Google Cloud Vision API 클라이언트 | 이미지 텍스트 인식(OCR) |
| [Jimp](https://github.com/jimp-dev/jimp) | Node.js 이미지 처리 라이브러리 | 이미지 전처리 (크기 조정, 자르기 등) |
| [Multer](https://github.com/expressjs/multer) | Node.js 파일 업로드 미들웨어 | 이미지 업로드 처리 |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | JWT 생성 및 검증 라이브러리 | 사용자 인증 및 토큰 관리 |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 비밀번호 해시 처리 라이브러리 | 안전한 비밀번호 저장 |
| [node-cron](https://github.com/node-cron/node-cron) | Node.js 스케줄링 라이브러리 | 월간 반복 일정 자동 등록 |
| [uuid](https://github.com/uuidjs/uuid) | UUID 고유 ID 생성기 | 사용자/일정 고유 ID 생성 |
| [react-router-dom](https://github.com/remix-run/react-router) | React 라우팅 라이브러리 | 화면 간 페이지 전환 처리 |
| [React Big Calendar](https://github.com/jquense/react-big-calendar) | 일정 관리용 캘린더 UI 컴포넌트 | 시간표 및 일정 시각화 |
| [React Datepicker](https://reactdatepicker.com/) | 날짜 선택 UI 컴포넌트 | 날짜 입력 (예: 개강일/종강일 선택) |
| [React Draggable](https://github.com/react-grid-layout/react-draggable) | 드래그 가능한 UI 요소 구현 | UI 사용자 경험 향상 |
| [React Swipeable](https://www.npmjs.com/package/react-swipeable) | 터치 기반 스와이프 기능 제공 | 모바일 UX 향상 |
| [React Icons](https://react-icons.github.io/react-icons/) | 다양한 아이콘 라이브러리 통합 제공 | UI 꾸밈 및 시각적 가독성 향상 |
| [Moment.js](https://momentjs.com/) | 날짜/시간 처리 라이브러리 | 일정 생성 및 시간 계산 |
| [Vite](https://vitejs.dev/) | 빠른 프론트엔드 개발 빌드 도구 | 개발 서버 및 번들링 |



