# dtc-gene-in-admin (클라이언트)

지니인사이트(dtc-gene-in) 유전자 검사 관리자 웹 애플리케이션.
`dtc-hl-admin`을 레퍼런스로 하여 Vue 3 + Vuetify 3 기반으로 구현된 프로젝트입니다.

---

## 📌 주요 링크 및 아키텍처 문서

- **전체 구현 계획 및 진행 현황**: [`/home/sgkwon/git/architecture/dtc-gene/admin-plan.md`](file:///home/sgkwon/git/architecture/dtc-gene/admin-plan.md)
- **회원 관리 기능 명세**: [`/home/sgkwon/git/architecture/dtc-gene/member-spec.md`](file:///home/sgkwon/git/architecture/dtc-gene/member-spec.md)
- **공통 개발 규칙**: [`/home/sgkwon/git/AGENTS.md`](file:///home/sgkwon/git/AGENTS.md)

---

## 🚦 현재 진행 상태

- [x] **프로젝트 기반 셋업**: Vite + Vue 3 + Vuetify 3 + Pinia + pnpm
- [x] **공통 모듈**: 라우터, 인증 스토어 (`stores/auth.js`), HTTP 컴포저블 (`useHttp.js`), 다국어
- [x] **로그인 화면 (`Login.vue`)**: 토스트 알림, 쿠키 아이디 기억, API 연동 완료
- [x] **공통 레이아웃 (`AppLayout.vue`)**:
  - `dtc-hl-admin` 스타일 48px 블랙 앱바 + 좌측 흰색 로고
  - 화이트 사이드바 (상단 프로필 카드: 아바타, 이름, 이메일, 정보수정, 로그아웃)
  - 20분 주기 토큰 재발급 + 60분 무입력 자동 로그아웃
- [x] **회원 관리 (`Member.vue`, `DetailMember.vue`)**:
  - `dtc-hl-admin` 스타일 접이식 검색창 (`is_show_search`), `#e0205c`(`search_btn`) 조회 버튼
  - 1px 그리드 테두리 테이블, sticky 헤더, 파란색 링크
  - 화면 하단 고정 푸터 바 + 번호 페이지네이션 (`components/common/Pagination.vue`)
  - 상세/수정/추가 3가지 모드, 아이디 중복확인, 메뉴 접근 권한 체크박스
- [ ] **다음 작업 대상**: **업체 관리 (`/company`)**

---

## ⚠️ 필수 개발/작업 규칙

1. **빌드 금지**:
   - 코드 수정 후 **`pnpm run build`를 임의로 실행하지 말 것** (Vite HMR로 브라우저에 즉시 반영됨).
2. **배포 승인 필수**:
   - 사용자의 명시적 지시 전까지 `bash deploy.sh` 실행 절대 금지.
3. **패키지 매니저**:
   - 무조건 **`pnpm`** 사용 (`npm` 명령어 사용 엄격히 금지).
4. **UI/UX 가이드**:
   - `dtc-hl-admin`의 원본 디자인과 레이아웃(블랙 상단바, 화이트 사이드바, `#f5f9fa` 배경, 1px 보더 테이블, `#e0205c` 조회버튼 등)을 일관되게 유지.
5. **권한 값 주의**:
   - 메뉴 권한(`Auth`)은 `'A'`(쓰기/관리) / `'N'`(읽기) 형식으로 처리 (최고관리자는 `Level === 'A'`).
