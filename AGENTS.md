# DTC-GENE-IN-ADMIN 프로젝트 에이전트 가이드 (AGENTS.md)

이 문서는 `dtc-gene-in-admin` (지니인사이트 관리자 웹 플랫폼) 프로젝트를 유지보수하고 개발할 때 반드시 기억하고 준수해야 하는 핵심 기술 정보, 아키텍처, 작업 규칙 및 설계 히스토리를 정리한 지침서입니다.

---

## 1. 프로젝트 개요 및 기술 스택

- **프로젝트명**: dtc-gene-in-admin (지니인사이트 DTC 유전자 분석 관리자 시스템)
- **프로젝트 목적 및 배경**:
  - 기존 `dtc-hl-admin` 시스템을 기반으로 이식되었으며, **보안 취약점 제거**, **UI/UX 개선**, 그리고 **일부 비즈니스 기능 추가/변경/고도화**를 주요 목적으로 합니다.
- **프론트엔드 프레임워크**:
  - **Vue 2** (`vue@^2.6.14`) + Options API 기반
  - **Vuetify 2** (`vuetify@^2.6.0`, `vue-cli-plugin-vuetify@~2.5.8`)
  - **상태 관리**: Vuex 3 (`vuex@^3.6.2`)
  - **라우터**: Vue Router 3 (`vue-router@^3.5.3`)
  - **다국어**: Vue I18n 8 (`vue-i18n@^8.28.2`)
  - **HTTP 클라이언트**: Axios (`axios@^1.3.4`)
  - **스타일 전처리기**: SASS/SCSS (`sass@~1.32.0`, `sass-loader@^10.0.0`)
- **패키지 매니저**: **`pnpm` 전용** (`npm` 사용 절대 금지, `~/.bashrc`에 `alias npm='pnpm'` 설정됨)
- **실제 배포 서버 환경**:
  - Apache 2.4 (Ubuntu) 웹 서버
  - 접속 호스트, SFTP 포트 및 계정 정보는 `client/.deploy.env` 참조
  - 업로드 대상 경로: `/var/www/html`
- **백엔드 서버 소스코드 참조 정보**:
  - 서버 접속 정보(호스트, 포트, 계정, PW): `client/.deploy.env` 참조
  - 서버 소스코드 경로: `/var/www/html/server`

---

## 2. 작업 절대 원칙 (Strict Rules)

### 2.1. 배포 및 원격 서버 접속 규칙
1. **Deploy 절대 금지 원칙**: 사용자의 명시적인 지시(`"배포해줘"`, `"배포 진행"` 등)가 있기 전까지 배포 스크립트(`bash deploy.sh`, `pnpm run deploy`)를 절대 임의로 실행하지 않습니다.
2. **원격 서버 소스코드 참조 및 SSH 접속 규칙 (READ ONLY)**:
   - **조회 목적 SSH 접속 허용**: 백엔드 로직 분석 및 API 스펙 확인이 필요한 경우, 사용자의 승인을 얻어 SSH로 접속하여 **읽기 전용(READ ONLY)으로 확인 및 조회**할 수 있습니다.
   - **서버 수정 절대 금지 (READ ONLY)**: 서버 측 소스코드, 데이터베이스, 환경설정에 대한 **어떠한 수정(생성/변경/삭제)도 절대 금지**합니다.
   - **SSH 접속 보안 준수**: 외부 서버 SSH 접속 시에도 사용자 사전 승인 원칙을 준수하며, 작업 시 실수로 파일이 변경되지 않도록 읽기 전용(조회용) 명령어 위주로 신중히 확인합니다.

### 2.2. 터미널 명령어 실행 규칙
1. **단일 명령어 규칙**: `&&`, `||`, `2>/dev/null` 같은 쉘 연산자를 쓰지 말고, 순수 단일 명령어로만 실행합니다. 에러가 나면 에러 출력 그대로 확인합니다.
2. **find 명령어 제한**: 보안 제한으로 인해 `find`에 `-exec` 옵션을 사용하지 않습니다. 경로를 먼저 조회한 뒤 별도 단일 명령어로 처리합니다.

### 2.3. 에러 핸들링 및 코드 수정 전 승인 규칙 (중요)
코드, 설정, 데이터 등에서 문제나 비정상 동작을 발견했을 때 **즉시 수정하지 않습니다.**
반드시 아래 5단계를 준수합니다:
1. **문제 보고** (Report the issue)
2. **증거 및 분석 제시** (Explain the evidence)
3. **의심되는 근본 원인 설명** (Explain suspected root cause)
4. **수정 방안 제안** (Describe proposed fix)
5. **사용자 승인 대기** (Wait for approval)
   - 승인 키워드: `"진행"`, `"수정 진행"`, `"수정해"`, `"수정 적용"`, `"fix it"`, `"apply fix"` 등 명시적 승인이 있을 때만 코드 수정을 착수합니다.

### 2.4. 수정 후 사후 검증 필수
- 참조하는 파일, API, 클래스, 메서드 존재 여부 확인
- 빌드(`pnpm run build`) 또는 단위 검증 수행
- 실제 검증 완료 전에는 임의로 성공이나 완료를 단정하지 않음

---

## 3. 브랜드 아이덴티티 및 디자인 시스템

### 3.1. 지니인사이트 공식 로고 기반 컬러 팔레트
공식 로고 파일([`client/src/assets/geni-in-logo.svg`](file:///home/sgkwon/git/dtc-gene-in-admin/client/src/assets/geni-in-logo.svg), [`symbol-logo.svg`](file:///home/sgkwon/git/dtc-gene-in-admin/client/src/assets/symbol-logo.svg))의 그라데이션 및 규격을 기반으로 전역 색상이 통일되어 있습니다.

| 색상 토큰 | Hex 코드 | 설명 / 용도 |
| :--- | :--- | :--- |
| `--color-primary` | `#0C67DF` | **지니인사이트 메인 블루** (타이틀바, 주요 액션 버튼, 액티브 탭 등) |
| `--color-primary-hover` | `#0a56bc` | 버튼 및 링크 호버 색상 |
| `--color-primary-dark` | `#08479b` | 다크 강조 색상 |
| `--color-accent` | `#21b4e9` | 로고 심볼 상단 포인트 시안 블루 |
| `--color-primary-light` | `#dbe8f8` | 연한 배지 및 칩 배경 |
| `--color-primary-lighter`| `#eef4fc` | 테이블 행 호버 및 활성 배경 |
| `--color-text-primary` | `#222222` | 본문 기본 텍스트 |
| `--color-text-secondary`| `#555555` | 보조 텍스트, 라벨 |
| `--color-text-tertiary` | `#888888` | 플레이스홀더, 비활성 텍스트 |
| `--color-border` | `#e0e0e0` | 카드, 인풋, 테이블 기본 테두리 |
| `--color-border-dark` | `#cccccc` | 포커스 및 호버 테두리 |

### 3.2. Vuetify 2와 스타일 오버라이드 구조
이 프로젝트는 과거 `dtc-hl-admin`에서 이식되면서 Vuetify 2 기본 스타일과 구 `layout.css`의 강제 오버라이드가 혼재되어 있었습니다. 현재는 다음과 같이 깔끔하게 통합 정리되었습니다.

1. **`client/src/styles/custom.scss`**:
   - `main.js`에서 최우선으로 전역 import (`import '@/styles/custom.scss'`).
   - Vuetify 컴포넌트(`v-card`, `v-btn`, `v-text-field`, `v-dialog`, `v-data-table`, `v-navigation-drawer`)의 현대적 스타일 오버라이드.
   - 구 `layout.css`에 있던 필수 레거시 스타일(커스텀 `<table>`, A4 인쇄 미디어쿼리, `.resizable-box` 등)을 완벽히 흡수 통합.
2. **`client/src/styles/variable.scss` & `variables.scss`**:
   - Vuetify 2 SASS 변수 오버라이드 (Pretendard 폰트 패밀리, 둥근 모서리 `6px`, `$spacer: 4px` 등).
3. **`client/src/styles/design-system.css`**:
   - 멀티모달 데이터 플랫폼 디자인 시스템 v1.0 원본 순수 CSS 규격서 (3,220라인).
   - 향후 다른 프로젝트로 컴포넌트를 이식하거나 기준 CSS 토큰을 참조할 때 사용하는 레퍼런스 원본.
4. **`client/src/plugins/vuetify.js`**:
   - Vuetify 테마 팔레트 설정 (`customProperties: true`).
   - `primary: '#0C67DF'`, `accent: '#21b4e9'`, `search_btn: '#0C67DF'`, `anchor: '#0C67DF'`.

---

## 4. UI/UX 레이아웃 핵심 주의사항

### 4.1. 상단 타이틀바 (`v-app-bar`)
- **레이아웃**:
  - **좌측**: 햄버거 메뉴 토글 버튼(`v-app-bar-nav-icon`, `color="#222222"`) 및 영문 브랜드 정적 타이틀 **`GeneInsight`** (딥 블랙 `#222222`, 클릭 링크/커서 없음).
  - **우측**: 사용자 명(`$session.get('Username')`, 다크 `#333333`) 및 단정한 소프트 블랙 아웃라인 로그아웃 버튼(`.header-logout-btn`).
- **배경색 및 테두리**: **`#F0F5FE` 소프트 파스텔 블루** 라이트 테마 적용 (`dark` 속성 제거, 하단 실선 테두리 제거 `border-bottom: none`, 글씨 및 아이콘을 차분한 블랙 톤으로 통일).

### 4.2. 사이드바 (`v-navigation-drawer`)
- **배경색 및 테두리**: 타이틀바와 동일한 **`#F0F5FE` 소프트 파스텔 블루**가 적용되어 상단 헤더와 좌측 네비바가 일체감 있는 라이트 룩을 형성하며, 우측 경계 실선(`border-right: none`)이 제거되어 콘텐츠 영역과 매끄럽게 연결됩니다.
- **글씨 및 아이콘**: 비활성 메뉴 아이콘(`color="#444444"`)과 메뉴 텍스트(`#333333`)를 차분한 블랙 톤으로 정돈하여 가독성을 높였습니다.
- **상단 사용자 정보 블록 제거**: 기존의 중복 사용자명, 이메일, 최근 접속시간, 개인정보수정, 투박한 로그아웃 버튼이 차지하던 상단 카드 영역은 모두 제거되었으며, 네비게이션 메뉴 리스트(`<v-list nav dense>`)가 최상단부터 깔끔하게 노출됩니다.
- **선택된(활성) 메뉴 스타일**: 산뜻한 강조 배경색(**`#DBEDFC`**)과 **또렷한 딥 블랙 볼드 텍스트/아이콘 (`#111111`)**이 적용되어 현재 페이지 위치를 직관적으로 파악할 수 있습니다.
- **화면 최하단 푸터 로고**: 사이드바 최하단 절대 고정(`position: absolute; bottom: 0; left: 0; right: 0;`) 설정을 통해 `<template v-slot:append>` 슬롯이 화면(뷰포트) 맨 마지막 가장 아랫부분 바닥에 완벽히 밀착 배치(`style="padding: 8px 16px 12px 16px;"`)되며, 순수 투명 배경 위에 공식 오리지널 컬러 로고([`client/src/assets/images/geni-in-logo.svg`](file:///home/sgkwon/git/dtc-gene-in-admin/client/src/assets/images/geni-in-logo.svg))가 자연스럽게 노출됩니다. 콘텐츠 영역(`.v-navigation-drawer__content`)에는 하단 60px 안전 패딩을 두어 스크롤 시에도 로고와 메뉴가 겹치지 않습니다.

### 4.3. 상세(Detail) 페이지 카드 상단 패딩 이슈 및 해결책
- **현상**: `DetailMember`, `DetailCompany`, `DetailType`, `DetailGene`, `DetailManage`, `DetailResult` 등 모든 상세 페이지는 `<v-card flat>` 내부에 `<v-card-title>` 영역이 없고 곧바로 폼(`<v-form>`)과 첫 번째 입력 필드가 시작됩니다.
- **해결책**:
  `client/src/styles/custom.scss`에 아래 전용 셀렉터가 지정되어 있습니다:
  ```scss
  #content > .v-card {
    > .v-card__text {
      padding: 32px 28px !important; // 첫 입력 요소가 상단 테두리에 바짝 붙지 않도록 32px 확보

      @media (max-width: 600px) {
        padding: 20px 16px !important;
      }
    }
  }
  ```
  새로운 상세 뷰나 폼 카드를 만들 때도 이 패딩이 유지되도록 `#content > .v-card` 구조를 준수해야 합니다.

### 4.4. 버튼 다크 테마 오버라이드
- 레거시 코드베이스의 수많은 버튼들이 `color` 속성 없이 `<v-btn dark :elevation="0">저장</v-btn>` 형태로 선언되어 있습니다.
- Vuetify 2 기본 동작으로는 이것이 `#272727`(블랙)으로 렌더링되므로, `custom.scss`에서 `.v-btn.theme--dark:not(.v-btn--outlined):not(.v-btn--text):not(.v-btn--icon)`를 `var(--color-primary)`(`#0C67DF`)로 강제 매핑해 두었습니다.
- 단, 취소용 `.grey` 버튼이나 위험용 `.error` 버튼은 고유 색상을 유지합니다.

### 4.5. 버튼 규격 표준화 (Vuetify 기본 36px 복원 및 small 속성 전역 제거)
- 레거시 화면 전반에 산재해 있던 `<v-btn small>`(높이 28px) 및 아이콘/컨트롤의 `small` 속성을 전면 제거하여 Vuetify 2 순수 기본 규격(높이 `36px`, 폰트 `14px`)으로 일원화하였습니다.
- 이를 통해 검색창의 `v-text-field`(dense 기준 40px) 및 기타 입력 폼 요소들과의 시각적 크기 불균형이 해결되었습니다.

---

## 5. 다국어 및 언어 정책

- 본 `dtc-gene-in-admin` 시스템은 **한국어 고정** 정책입니다.
- 사용자 등록, 정보 수정, 사용자 조회 뷰 등에서 사용 언어를 선택하거나 변경하는 UI는 기획상 모두 제거되었습니다.
- 다국어 번역 리소스는 `client/src/i18n/` 디렉토리에 위치해 있으며, 기본 로케일은 `'ko'`로 고정 동작합니다.

---

## 6. 빌드 및 원격 서버 배포 절차

### 6.1. 빌드 실행
```bash
# client 디렉토리로 이동하여 빌드
pnpm --prefix client run build
# 또는
cd client && pnpm run build
```
- 결과물은 `client/dist/` 디렉토리에 번들링됩니다.

### 6.2. 원격 서버 배포 (사용자 명시적 지시 시에만 실행)
```bash
# client 디렉토리에서 대화형 확인을 생략하고 자동 배포
cd client && bash deploy.sh -y
```
- **배포 설정 파일**: `client/.deploy.env` (Git 추적 제외, 실제 접속 호스트 및 계정 정보는 해당 파일 참조)
- **배포 메커니즘**:
  - `lftp`를 사용하여 변경되거나 새로 생성된 파일만 원격 서버로 스마트 동기화(Smart Sync)합니다.
  - 배포 완료 후 Apache 웹 서버에서 즉시 갱신 반영됩니다.
  - 배포 후 브라우저 캐시로 인해 구버전이 보일 수 있으므로 `Ctrl + F5` (강력 새로고침) 안내가 필요합니다.

### 6.3. 결과지 뷰어 및 외부 에셋 연동 규격
- **결과지 출력 뷰어 기본 도메인**: 배포 서버 기본 도메인 (개발 환경: `http://localhost:8081`)
- **결과지 출력 연동 컴포넌트**:
  - `Result.vue`: 템플릿 버전(seq)에 따라 `/viewer`, `/v4`, `/v5`, `/v6`, `/eng/v1` 경로로 새 창 열기
  - `ResultTermList.vue`: 기간별 결과지 출력 시 KST 기준 최신 템플릿 자동 판별 후 뷰어 열기

---

## 7. 주요 파일 및 디렉토리 구조 맵

```
dtc-gene-in-admin/
├── AGENTS.md                         # 본 에이전트 지침서
├── README.md
└── client/
    ├── .deploy.env                   # 원격 SFTP 배포 접속 환경설정 (비공개)
    ├── .deploy.env.default           # 배포 환경설정 템플릿
    ├── deploy.sh                     # lftp 기반 원격 배포 자동화 스크립트
    ├── package.json                  # 의존성 및 스크립트 (pnpm 사용)
    ├── vue.config.js                 # Vue CLI 빌드 및 Webpack 프록시 설정
    ├── public/
    │   ├── favicon.svg               # 지니인사이트 공식 파비콘
    │   └── index.html                # SPA 메인 템플릿
    └── src/
        ├── App.vue                   # 최상위 앱 레이아웃 (헤더, 사이드바, 세션/토큰 연장)
        ├── main.js                   # 앱 엔트리 포인트 (custom.scss, plugins 등록)
        ├── assets/
        │   ├── layout.css            # (마이그레이션 완료 안내 주석 파일)
        │   ├── content.css           # 컨텐츠 레거시 스타일
        │   ├── symbol-logo.svg       # 지니인사이트 공식 심볼 로고 (사이드바 아바타용)
        │   ├── geni-in-logo.svg      # 지니인사이트 공식 전체 로고
        │   └── images/
        │       ├── geni-in-logo.svg
        │       └── geni-in-logo-white.svg
        ├── styles/
        │   ├── custom.scss           # 전역 스타일 및 Vuetify 컴포넌트 커스텀 오버라이드
        │   ├── variable.scss         # SASS 변수 및 Vuetify 토큰
        │   ├── variables.scss        # Vuetify SASS 변수 연동 파일
        │   └── design-system.css     # 멀티모달 데이터 플랫폼 디자인 시스템 원본 규격서
        ├── plugins/
        │   └── vuetify.js            # Vuetify 2 플러그인 및 테마 색상 설정
        ├── i18n/                     # 다국어 설정 (한국어 고정)
        ├── components/
        │   ├── Login.vue             # 관리자 로그인 페이지
        │   ├── Member/               # 회원/사용자 관리 (Member.vue, DetailMember.vue)
        │   ├── Company/              # 거래처 관리 (Company.vue, DetailCompany.vue)
        │   ├── Type/                 # 검사항목 관리 (Type.vue, DetailType.vue)
        │   ├── Manage/               # 검사자(환자) 관리 (Manage.vue, DetailManage.vue)
        │   ├── Gene/                 # 유전자 관리 (Gene.vue, DetailGene.vue)
        │   ├── Result/               # 검사결과 관리 (Result.vue, DetailResult.vue)
        │   ├── UltraSeek/            # UltraSEEK 검사 관리 (UltraSeek.vue)
        │   ├── Pgx/                  # PGx 검사 관리 (Pgx.vue)
        │   └── Common/
        │       ├── DataTable.vue     # 공통 반응형 테이블 컴포넌트
        │       └── Calendar.vue      # 달력 컴포넌트
        └── mixin/
            └── authority.js          # 메뉴 권한 체크 믹스인
```

---

## 8. 메뉴 권한 및 라우트 체계 명세 (DB `lims_code` 일치화)

시스템의 메뉴는 DB 공통 코드(`lims_code`, `group_code = 'G0001'`)와 100% 동일한 권한 코드(`M001`~`M008`)로 매핑되어 있습니다. 로그인 시 백엔드 세션(`Auth`)에 따라 좌측 네비게이션 드로어(`App.vue`) 및 각 컴포넌트의 접근 권한(`get_menu_authority`)이 제어됩니다.

| 메뉴 코드 | DB 명칭 | 라우트 경로 | 컴포넌트 | 설명 |
| :---: | :--- | :--- | :--- | :--- |
| **`M001`** | 사용자관리 | `/member` | `Member.vue` / `DetailMember.vue` | 시스템 관리자 및 회원 계정 관리 |
| **`M003`** | 검사종류 | `/type` | `Type.vue` / `DetailType.vue` | 유전자 검사 종류 및 SNP 기준치 관리 |
| **`M005`** | 유전자관리 | `/gene` | `Gene.vue` / `DetailGene.vue` | 유전자 코드 및 카테고리 정보 관리 |
| **`M002`** | 거래처관리 | `/company` | `Company.vue` / `DetailCompany.vue` | 분석 의뢰 거래처 및 담당자 관리 |
| **`M004`** | 검사자관리 | `/manage` | `Manage.vue` / `DetailManage.vue` | 검사 대상자(환자) 접수 및 검체 관리 |
| **`M006`** | 검사결과 | `/result` | `Result.vue` / `DetailResult.vue` | 분석 결과 등록, 엑셀 업로드, 결과지 출력 |
| **`M007`** | UltraSEEK 검사 | `/ultraseek` | `UltraSeek.vue` | UltraSEEK 분석 관리 (준비 중 안내 화면) |
| **`M008`** | PGx 검사 | `/pgx` | `Pgx.vue` | PGx 약물유전체 검사 관리 (준비 중 안내 화면) |

### 8.1. Vuetify 2 Default 규격 복원 규칙
- **체크박스 & 라디오버튼 & 폼 컨트롤**: 과거 레거시의 인위적 축소 스타일(`.compact-checkbox`, `.compact-radio`, `.radio-class`, 강제 `16px`/`13px` 등)을 전면 제거하고 Vuetify 2 표준 규격(체크박스/라디오 아이콘 24px, 텍스트 필드 폰트 16px/1rem, 기본 레이블 및 간격)을 준수합니다.
- **타이포그래피 및 루트 폰트**: `$font-size-root: 16px` 및 Vuetify 기본 폰트 스케일(Body-1: 16px, Body-2: 14px, Input: 16px)을 표준으로 적용합니다.

