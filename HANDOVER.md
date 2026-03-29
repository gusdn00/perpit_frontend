# 🎵 Perpit — Frontend Handover Document

> **Last Updated:** 2026-03-29
> **Repository:** https://github.com/gusdn00/perpit_frontend
> **Description:** 2025-2 캡스톤 프로젝트 — 음원 업로드 → AI 악보 자동 생성 웹 서비스
> **Design Direction:** iOS-inspired · Simple · Clean

---

## 1. 프로젝트 개요 (Project Overview)

음원 파일을 업로드하면 AI가 분석하고, 난이도/스타일을 선택해 자동으로 악보를 생성해주는 웹 서비스입니다.  
생성된 악보는 재생 및 PDF 등 다양한 형식으로 다운로드할 수 있으며, 토큰 기반 결제 시스템이 구현되어 있습니다.

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Perpit (`ai_musicsheet_front`) |
| **유형** | 2025-2 캡스톤 디자인 |
| **핵심 기능** | 음원 업로드 → 난이도 선택 → AI 악보 생성 → 악보 재생 / 다운로드 |
| **인증 방식** | 자체 회원가입 + 카카오 소셜 로그인 |
| **결제 방식** | 토큰 구매 (카카오페이 기반) |
| **Backend API** | `http://3.27.76.139:8000` |

---

## 2. 기술 스택 (Tech Stack)

| 영역 | 기술 | 버전 |
|------|------|------|
| **Framework** | React | 18.2.0 |
| **번들러** | Vite | 7.0.0 |
| **라우팅** | React Router DOM | 7.6.3 |
| **상태 관리** | Recoil | 0.7.7 |
| **HTTP 클라이언트** | Axios | 1.10.0 |
| **악보 렌더링** | OpenSheetMusicDisplay (OSMD) | 1.9.3 |
| **악보 오디오 재생** | osmd-audio-player | 0.7.0 |
| **PDF 다운로드** | jsPDF + html2canvas + svg2pdf.js | — |
| **아이콘** | react-icons | 5.5.0 |
| **소셜 로그인** | 카카오 SDK (`VITE_KAKAO_JS_KEY`) | — |

---

## 3. 프로젝트 구조 (Project Structure)

```
perpit_frontend/
├── src/
│   ├── pages/                       # 페이지 및 주요 컴포넌트
│   │   ├── Mainscreen.jsx               # 메인 홈 화면
│   │   ├── FileUpload.jsx               # 음원 파일 업로드
│   │   ├── ConvertingPage.jsx           # 악보 변환 중 로딩 화면
│   │   ├── SheetCompletePage.jsx        # 악보 생성 완료 화면
│   │   ├── SheetViewerPage.jsx          # 악보 재생 뷰어
│   │   ├── MySheetsPage.jsx             # 내 악보 목록
│   │   ├── DifficultySelectModal.jsx    # 난이도 선택 모달
│   │   ├── DownloadFormatModal.jsx      # 다운로드 형식 선택 모달
│   │   ├── Header.jsx                   # 공통 헤더 (로고, 유저명 표시)
│   │   ├── Sidebar.jsx                  # 공통 사이드바
│   │   ├── Login.jsx                    # 로그인
│   │   ├── Signup.jsx                   # 회원가입
│   │   ├── Mypage.jsx                   # 마이페이지
│   │   ├── DinoGame.jsx                 # 마이페이지 내 미니게임
│   │   ├── KakaoCallback.jsx            # 카카오 소셜 로그인 콜백
│   │   ├── PaymentPage.jsx              # 토큰 구매 결제 페이지
│   │   ├── PaymentSuccess.jsx           # 결제 성공
│   │   ├── PaymentCancel.jsx            # 결제 취소
│   │   └── PaymentFail.jsx              # 결제 실패
│   ├── styles/                      # 컴포넌트별 CSS
│   ├── assets/                      # 이미지, 로고 등 정적 리소스
│   ├── App.jsx                      # 라우터 설정
│   ├── axiosInstance.js             # Axios 공통 인스턴스 (인터셉터 포함)
│   ├── authState.js                 # Recoil 인증 상태
│   └── main.jsx                     # 앱 진입점
├── .env.example                     # 환경 변수 템플릿
├── PLANS.txt                        # 구현 예정 기능 설계 문서
├── CLAUDE.md                        # Claude 작업 가이드
├── vite.config.js
└── package.json
```

---

## 4. 라우팅 구조 (Routing)

`App.jsx` 기준 라우트 목록. `Header`와 `Sidebar`는 라우트 외부에서 공통 렌더링됩니다.

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `Mainscreen` | 메인 홈 |
| `/login` | `Login` | 로그인 |
| `/signup` | `Signup` | 회원가입 |
| `/mypage` | `Mypage` | 마이페이지 |
| `/file-upload` | `FileUpload` | 음원 업로드 |
| `/converting` | `ConvertingPage` | 변환 중 로딩 |
| `/sheet-complete` | `SheetCompletePage` | 생성 완료 |
| `/mysheets` | `MySheetsPage` | 내 악보 목록 |
| `/sheet-viewer` | `SheetViewerPage` | 악보 뷰어 |
| `/payment` | `PaymentPage` | 토큰 결제 |
| `/payment/success` | `PaymentSuccess` | 결제 성공 |
| `/payment/cancel` | `PaymentCancel` | 결제 취소 |
| `/payment/fail` | `PaymentFail` | 결제 실패 |
| `/auth/kakao/callback` | `KakaoCallback` | 카카오 로그인 콜백 |

---

## 5. 핵심 기능 플로우 (Core Feature Flow)

### 5.1 악보 생성 플로우
```
/file-upload       → 음원 파일 업로드 + 옵션(난이도, 스타일 등) 선택
/converting        → AI 변환 진행 중 (job_id 기반 폴링)
/sheet-complete    → 악보 생성 완료 화면
/sheet-viewer      → OSMD 악보 렌더링 + 오디오 재생
```

### 5.2 난이도 재생성 플로우 (MySheetsPage)
```
/mysheets                       → 내 악보 목록
DifficultySelectModal           → 다른 난이도 선택 모달
POST /create_sheets/mysheets/{sid}/remix
/converting                     → 기존 ConvertingPage 재사용
```

### 5.3 인증 플로우
```
자체 로그인  : /login → JWT 발급 → localStorage('Token') 저장
카카오 로그인: /login → 카카오 SDK → /auth/kakao/callback → 토큰 저장
401 응답 시 : localStorage 토큰 삭제 → /login 자동 리다이렉트
             (axiosInstance.js 응답 인터셉터에서 처리)
```

---

## 6. API 연동 (API Integration)

### 6.1 Axios 설정

파일: `src/axiosInstance.js`

- **Base URL:** `http://3.27.76.139:8000`
- **인증:** 요청마다 `Authorization: Bearer {Token}` 자동 주입 (localStorage 기반)
- **401 처리:** 토큰 삭제 후 `/login` 리다이렉트

### 6.2 주요 API 엔드포인트 (코드에서 확인된 것)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/create_sheets/mysheets` | 내 악보 목록 조회 |
| `POST` | `/create_sheets/mysheets/{sid}/remix` | 다른 난이도로 악보 재생성 |

> 전체 API 명세는 백엔드 팀에 별도 확인 필요.

---

## 7. 환경 변수 (Environment Variables)

`.env.example` 참고:

```env
VITE_KAKAO_JS_KEY=여기에_카카오_JavaScript_키_입력
```

> `.env` 파일을 직접 생성 후 실제 키를 입력해야 합니다. 카카오 JS 키는 팀원에게 별도 전달받으세요.

---

## 8. 로컬 개발 환경 세팅

```bash
# 1. 저장소 클론
git clone https://github.com/gusdn00/perpit_frontend.git
cd perpit_frontend

# 2. 패키지 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에 VITE_KAKAO_JS_KEY 실제 값 입력

# 4. 개발 서버 실행
npm run dev
```

---

## 9. 구현 예정 기능 (PLANS.txt 기준)

### [001] My Sheets — 다른 난이도 악보 재생성
- **상태:** 설계 완료 / 미구현 (2026-03-23 기준)
- **목적:** 기존 악보에서 더 저렴한 비용으로 다른 난이도 재생성 가능
- **관련 파일:** `MySheetsPage.jsx`, `DifficultySelectModal.jsx`
- **신규 API:** `POST /create_sheets/mysheets/{sid}/remix`
  - Body: `{ difficulty: 1 | 2 }` (easy=1, normal=2)
  - Response: `{ job_id: "..." }`
- **미결 전제 조건:**
  - 백엔드 엔드포인트 설계 합의 필요
  - `GET /create_sheets/mysheets` 응답에 `difficulty`, `purpose`, `style` 포함 여부 확인
  - 재생성 토큰 비용 정책 확인 (신규 생성과 동일 여부)

---

## 10. 디자인 가이드라인 (Design Guidelines)

| 항목 | 내용 |
|------|------|
| **방향** | iOS-inspired · 심플 · 클린 · 미니멀 |
| **Primary Color** | `#007AFF` (iOS Blue) |
| **Background** | `#F2F2F7` |
| **Surface (Card)** | `#FFFFFF` |
| **Text Primary** | `#000000` |
| **Text Secondary** | `#8E8E93` |
| **Border Radius** | 버튼 `12px` / 카드 `16px` / 모달 `20px` |
| **폰트** | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |

---

## 11. 인수인계 체크리스트 (Handover Checklist)

- [ ] GitHub 저장소 접근 권한 확인
- [ ] `VITE_KAKAO_JS_KEY` 전달
- [ ] 백엔드 API 문서 / Swagger 링크 전달
- [ ] Backend Base URL 변경 필요 시 `src/axiosInstance.js` 수정
- [ ] PLANS.txt 미구현 기능 현황 브리핑
- [ ] 카카오페이 결제 관련 설정 키 전달

---

## 12. 변경 이력 (Changelog)

| 날짜 | 내용 |
|------|------|
| 2026-03-29 | 실제 코드 기반 Handover 문서 최초 작성 |

---

*이 문서는 `https://github.com/gusdn00/perpit_frontend` (commit `2001ab4`) 기준으로 작성되었습니다.*
