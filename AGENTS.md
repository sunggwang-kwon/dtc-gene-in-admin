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
- **백엔드 서버 소스코드 참조 정보 (로컬 스냅샷 동기화 방식)**:
  - 서버 소스코드 원격 경로: `/var/www/html/server`
  - **로컬 스냅샷 참조 경로**: `/home/sgkwon/git/.server/dtc-gene`
  - 동기화 스크립트: `/home/sgkwon/git/.server/sync-dtc-gene.sh` (필요 시 수동 실행)

---

## 2. 작업 절대 원칙 (Strict Rules)

### 2.1. 배포 및 원격 서버 접속 규칙
1. **Deploy 절대 금지 원칙**: 사용자의 명시적인 지시(`"배포해줘"`, `"배포 진행"` 등)가 있기 전까지 배포 스크립트(`bash deploy.sh`, `pnpm run deploy`)를 절대 임의로 실행하지 않습니다.
2. **원격 서버 소스코드 참조 원칙**:
   - **서버 최신 코드 동기화**: 백엔드 소스코드 확인 및 수정사항 여부 점검 시 `/home/sgkwon/git/.server/sync-dtc-gene.sh`를 1회 실행하여 원격 서버의 최신 코드를 즉시 로컬로 동기화한 후 조회합니다.
   - **서버 수정 절대 금지**: 로컬 스냅샷 파일 수정은 서버에 영향을 주지 않으며, 원격 서버에 대한 직접 수정(생성/변경/삭제)은 절대 금지합니다.


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
  - **우측**: 사용자 명(`$session.get('Username')`, 다크 `#333333`) 및 솔리드 다크 로그아웃 버튼(`.header-logout-btn`, `#333333` 배경, 흰색 텍스트).
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

### 4.5. 버튼 및 폼 컨트롤 규격 표준화 (전역 Dense 최적화)
- **버튼 (`v-btn`)**: 높이 `28px`, 폰트 `13px` (`font-weight: 700`, 패딩 `0 12px`) 전역 dense 스타일이 적용되어 컴팩트하고 정돈된 룩을 제공합니다 (단, 아이콘/FAB 및 large 버튼 제외).
- **입력 필드 (`v-text-field`, `v-select`)**: 슬롯 최소 높이 `32px`, 폰트 `13px`, 흰색 배경 및 최적화된 라벨 포지셔닝이 적용됩니다.
- **체크박스 및 라디오버튼**: 아이콘 `20px`, 라벨 `13px` 기준으로 전역 최적화되어 있습니다.
- **검색 영역 필드 및 라벨 정책**:
  - 각 목록 페이지 상단의 검색 영역 필드는 별도의 상단 `<div>` 라벨을 분리하지 않고 컴포넌트 내장 `label` 속성으로 일원화합니다.
  - 검색 헤더 영역(`#header > div`)에는 `#f9fafb` 연회색 배경이 적용되어 본문 테이블과 자연스럽게 구분됩니다.
- **검색 영역 상/하 2단 분리 표준화**:
  - 모든 목록 조회 화면(`Manage`, `Result`, `UltraSeek`, `Company`, `Member`, `Gene`)은 검색 입력 필드(날짜 피커, 셀렉트, 텍스트필드 등)를 상단 1열에 두고, 액션 버튼 그룹(`검사자업로드`, `다운로드`, `추가`, `삭제`, `조회` 등)은 하단 2열에 우측 정렬(`v-row class="mx-1 pt-2" align="center" justify="end"`)로 분리 배치하여 입력창 너비 확보와 시각적 안정성을 일원화합니다.
- **하단 툴바 (`v-toolbar--bottom`)**: 페이지네이션 및 액션 버튼이 위치하는 하단 바는 `#f9fafb` 배경과 상단 경계선(`1px solid rgb(223, 223, 223)`)을 적용하여 화면 하단에 안정감 있게 고정됩니다.
- **데이터 테이블 헤더 & RowsSelect**:
  - 테이블 헤더는 `#f1f3f4` 배경을 적용하여 시각적 피로도를 낮췄습니다.
  - 건수 선택 셀렉트박스(`.rows-select-box`)는 흰색 배경(`#ffffff`)으로 지정되어 회색 바 위에서도 또렷하게 구분됩니다.

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
        │   ├── Manage/               # 검사자(환자) 관리 (Manage.vue, DetailManage.vue, ExcelUploadPatient.vue)
        │   ├── Gene/                 # 유전자 관리 (Gene.vue, DetailGene.vue)
        │   ├── Result/               # 검사결과 관리 (Result.vue, DetailResult.vue, ExcelUploadResult.vue)
        │   ├── UltraSeek/            # UltraSEEK 검사 관리 (UltraSeek.vue, ExcelUploadPatient.vue, UploadResult.vue, AddPatientModal.vue)
        │   ├── Pgx/                  # PGx 검사 관리 (Pgx.vue)
        │   └── Common/
        │       ├── DataTable.vue     # 공통 반응형 테이블 컴포넌트
        │       └── Calendar.vue      # 달력 컴포넌트
        ├── store.js                  # Vuex 전역 상태 관리 (로딩, rows per page, 8개 메뉴별 캐시 등)
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
| **`M007`** | UltraSEEK 검사 | `/ultraseek` | `UltraSeek.vue` | UltraSEEK 검사 수검자 목록 조회 및 관리 |
| **`M008`** | PGx 검사 | `/pgx` | `Pgx.vue` | PGx 약물유전체 검사 관리 (준비 중 안내 화면) |

### 8.1. 폼 컨트롤 및 타이포그래피 표준 규격
- **체크박스 & 라디오버튼 & 폼 컨트롤**: 과거 인위적인 레거시 개별 오버라이드를 지양하고, `custom.scss`의 전역 dense 표준(체크박스/라디오 아이콘 20px, 텍스트 필드 슬롯 높이 32px 및 폰트 13px, 기본 레이블 및 패딩 최적화)을 일관되게 적용합니다.
- **타이포그래피 및 루트 폰트**: `$font-size-root: 16px` 및 Vuetify 기본 폰트 스케일(Pretendard 폰트 기반 Body-1: 16px, Body-2: 14px, Input: 13px)을 표준으로 적용합니다.

### 8.2. 라우터 네비게이션 가드 및 세션 리다이렉트 정책
- **인증 가드 (`router.beforeEach`)**:
  - **로그인 상태 (`$session.has('jwt')`)**: 루트(`'/'`), `/login`, 와일드카드(`'*'`)로 접근 시 사용자의 권한 목록(`Auth`)을 조회하여 접근 가능한 첫 번째 메뉴(`M001`~`M008` 순서 판별: `Member`, `Type`, `Gene`, `Company`, `Manage`, `Result`, `UltraSeek`, `Pgx`)로 자동 리다이렉트합니다. 관리자 프레임 내 로그인 화면이 중복 렌더링되는 문제를 원천 차단합니다.
  - **미로그인 상태**: `Login` 경로 이외의 모든 비인가 경로 및 미정의 경로 접근 시 `/login`으로 안전하게 리다이렉트합니다.
  - **상세 뷰 스토어 초기화**: `DETAIL_MAP`에 정의된 화면 간 전환 시 대상 도메인의 store 상태를 안전하게 초기화합니다.
- **로그인 컴포넌트 생명주기 안정성**:
  - 세션 기반 권한 분기 및 리다이렉트 로직은 컴포넌트 메서드가 완전히 초기화되는 `created` 훅 및 공통 `redirect_to_authorized_menu` 메서드에서 일원화하여 실행합니다.

### 8.3. 세션 자동 로그아웃 및 목록 선택 상태 관리 규격
- **세션 자동 로그아웃 (60분 무조작 감시)**:
  - `App.vue`에서 윈도우 클릭 이벤트 핸들러(`on_window_click`)를 바인딩하여 사용자의 마지막 조작 시간을 추적합니다.
  - 20분 주기의 토큰 갱신 타이머 동작 시 마지막 클릭 시점으로부터 60분(`3600000ms`) 초과 시 세션을 파기하고 로그인 화면으로 안전하게 리다이렉트합니다.
- **목록 다중 선택 상태(`selected_item`) 초기화 및 실패 대상 추적 표준**:
  - 모든 목록 화면(`Member`, `Company`, `Type`, `Gene`, `Manage`, `Result`, `UltraSeek`)은 데이터 삭제 처리 완료 시점 및 목록 조회(`get_*_list`) 진입 시점에 `this.selected_item = []`을 명시적으로 초기화하여, 데이터 갱신 후 이전 선택 인덱스가 잔존하거나 오동작하는 문제를 차단합니다.
  - 다중 일괄 삭제 처리 중 서버 오류가 발생한 경우, 단순히 건수만 집계하지 않고 실패한 대상의 ID/이름을 수집하여 다이얼로그(`에러가 n건 발생했습니다. (실패 대상: ...)`)에 명확히 표출합니다.
- **HTTP 통신 예외 방어 및 응답 정제 (`http.js`)**:
  - 네트워크 장애 또는 서버 응답 에러로 `axios` 호출이 실패했을 때 `res`가 `null`인 상태에서 `res.status`를 참조하여 발생하는 런타임 크래시를 방지하기 위해, 모든 공통 요청 메서드(`get`, `post`, `download`, `postDownload`)는 `if (!res) return null;` 방어 검사를 거칩니다.
  - 백엔드 PHP 오류나 웹서버 에러로 정형 객체가 아닌 HTML 에러 페이지 및 스택 트레이스 문자열이 반환될 경우, `isHtml()` 함수로 감지하여 원문 HTML 태그가 네이티브 `alert()`에 노출되는 것을 차단하고 `common.networkError` 다국어 메시지로 일원화하여 표출합니다.

### 8.4. 미구현 기능 및 고스트 필드 UI 제어 정책
- **미구현 메뉴/액션 버튼 제어 (`UltraSeek`, `Pgx`)**:
  - 백엔드 API 엔드포인트가 미구현된 상태인 `UltraSeek.vue`의 4대 액션 버튼(`검사자업로드`, `검사자다운로드`, `결과지 업로드`, `추가`)은 데스크톱 화면에서 `:disabled` 속성을 부여하고 `"준비 중인 기능입니다"` 안내 툴팁을 제공하며, 모바일 뷰에서도 비활성화 스타일 및 `(준비중)` 텍스트를 고정합니다.
  - 준비 중 상태인 PGx 검사 메뉴는 사이드바(`App.vue`) 항목 텍스트 우측에 `[준비중]` 칩(`v-chip`)을 부착하여 사전 인지성을 확보합니다.
- **검사자 상세 고스트 필드 제어 (`DetailManage.vue`)**:
  - 백엔드 미지원 필드인 `암발생`, `암종류`, 테이블 내 `입고일자`는 사용자에게 입력 가능한 상태로 방치하지 않고 `disabled` 처리 및 `"준비 중"` 표기를 적용하여 데이터 유실 착각을 방지합니다.
  - 생년월일 입력에 따른 나이 자동 계산은 대한민국 법적 기준인 만 나이(`calc_age()`)로 일원화 계산합니다.

### 8.5. 클라이언트 런타임 예외 추적 체계 (`main.js`)
- Vue 컴포넌트 렌더링 중 발생하는 예외는 `Vue.config.errorHandler`를 통해 콘솔에 추적 로그(`[Vue Runtime Error]:`)를 출력합니다.
- 브라우저 전역 레벨의 비동기 오류 및 미처리 Promise 거부는 `window.addEventListener('error')` 및 `window.addEventListener('unhandledrejection')`를 통해 안정적으로 포착하여 클라이언트 런타임 무응답 상태를 진단할 수 있도록 지원합니다.

---

## 9. 스토리보드 요구사항 명세 및 구현 현황 (`required/gene_insight_storyboard_v1.0.pptx`)

요구사항 정의서(`required/gene_insight_storyboard_v1.0.pptx`, 총 13페이지) 기준 도메인별 핵심 명세와 현재 프론트엔드/백엔드 구현 상태입니다.

### 9.1. 슬라이드별 요구사항 및 구현 상태 요약

| 슬라이드 | 대상 화면 | 프론트엔드 컴포넌트 | 구현 상태 및 주요 명세 |
| :---: | :--- | :--- | :--- |
| **Slide 1** | 관리자 로그인 | `Login.vue` | **[완료]** ID/비밀번호 로그인, 아이디 저장(쿠키), 권한 보유 첫 메뉴 자동 리다이렉트 |
| **Slide 2** | 사용자 관리 | `Member.vue`, `DetailMember.vue` | **[완료]** ID/사용자명 검색, 읽기/쓰기(`A`) 권한자만 추가/삭제 가능, 일반 사용자는 본인 정보만 수정 가능, 거래처 목록 연동, 언어 항목 제외 |
| **Slide 3** | 검사종류 | `Type.vue`, `DetailType.vue` | **[완료]** 페이징/검색 없이 전체 목록 단일 페이지 출력, 유전자 마스터 팝업(`Common/Gene.vue`) 연동, 상세 SNP 테이블 내 `평균값` 컬럼 제외, 메인 목록 `번호(no)`, `평균값(risk_avg)` 컬럼 복원 및 `DataTable.vue` 가상 번호 정렬 클릭 방어 완료 |
| **Slide 4** | 유전자 관리 | `Gene.vue`, `DetailGene.vue` | **[완료]** 검사명/유전자 검색, 목록 및 상세에서 `인종(breed)` 컬럼 제외, 정상/위험 타입 및 빈도율 관리, 목록 `고유번호` 컬럼 전사 일관성 위해 가운데 정렬(`align: 'center'`) 통일 |
| **Slide 5** | 거래처 관리 | `Company.vue`, `DetailCompany.vue` | **[완료]** 거래처명/담당자 검색, 목록에서 `언어` 항목 삭제, 상세 화면 거래처명/담당자/이메일/연락처/주소/메모 관리 |
| **Slide 6** | 검사자 관리 | `Manage.vue`, `DetailManage.vue`, `ManageHistory.vue` | **[부분 완료]** 목록 테이블 `번호(no)` 컬럼 추가, 검색 연계를 위한 `연락처` 컬럼 유지, TAT/영업일 관리 제외, 수정 시 변경사유 필수 입력, 수정일 클릭 시 변경내역 팝업 표시 완료. `입고일자`, `암발생`, `암종류`는 백엔드 DB/API 미지원으로 클라이언트에서 준비중(비활성화) 처리 |
| **Slide 7~8** | 검사 결과 | `Result.vue`, `DetailResult.vue`, `ResultTermList.vue`, `ResultExistPopup.vue` | **[완료]** 초기 디폴트 조회 없음, 다건 존재 시 선택 팝업 표시, 결과 존재 시 결과지 출력 활성, 기간별 결과지 출력 정렬 키 버그(`'date'`) 수정, 모바일 조회 버튼 테마 색상(`search_btn`) 적용, 라벨 결과등록일 통일 및 테이블 헤더에 의뢰일자 컬럼 추가 완료 |
| **Slide 9~10** | UltraSEEK 검사 | `UltraSeek.vue`, `AddPatientModal.vue`, `UploadResult.vue`, `ExcelUploadPatient.vue` | **[클라이언트 완료]** 테이블 12개 컬럼 체계 매핑, 미구현 액션 버튼 툴팁/비활성화 통일, 추가/수정 모달(거래처 셀렉트, 파일명 정규식 검증, 취소 버튼), 다중 파일 업로드 및 `http.js` 배열 전송 지원 완료 (백엔드 API 배포 전까지 안전 가드 적용) |
| **Slide 11** | PGx 검사 | `Pgx.vue` | **[클라이언트 완료]** 스토리보드 규격의 UltraSEEK 동일 레이아웃, `엑셀 업로드` 등 전용 명칭 분기, `title-prefix="PGx"` 모달 연동 및 안전 가드 구축 완료 (백엔드 API 배포 시 즉시 연동 가능) |
| **Slide 12~13** | 고객용 조회 | `dtc-gene-in` (`Login.vue`, `Progress.vue`) | **[완료]** ID(바코드)/성명 로그인, 의뢰일자 콤보박스 변경 시 재조회, 진행사항 및 완료일 표시, 결과 유무별 하단 안내 문구 분기 |

### 9.2. 클라이언트(프론트엔드) 조치 완료 및 연동 대기 현황

1. **검사종류 목록 컬럼 복원 (`Type.vue`)**:
   - `Type.vue`에 `번호(no)` 및 `평균값(risk_avg)` 컬럼을 복원하였으며, 공통 컴포넌트인 `DataTable.vue`에 가상 번호 및 `sortable: false` 컬럼 클릭 시 서버 정렬 요청을 차단하는 가드를 적용하여 백엔드 SQL 오류를 원천 차단했습니다.
2. **기간별 결과지 출력 팝업 정비 (`ResultTermList.vue`)**:
   - 백엔드 명세(`$sort == "date"`)에 맞춰 정렬 키값을 `'date'`로 수정하고, 모바일 조회 버튼을 테마 컬러(`search_btn`)로 표준화했습니다. 또한 백엔드 쿼리 기준(`c.create_time`)에 맞춰 라벨을 `결과등록일`로 일원화하고 테이블 헤더에 `의뢰일자`를 추가했습니다.
3. **UltraSEEK 검사 화면 및 모달 규격화 (`UltraSeek.vue`, `AddPatientModal.vue`, `UploadResult.vue`, `http.js`)**:
   - 테이블 헤더를 스토리보드 12개 컬럼 체계로 개편하고 미구현 액션 버튼에 대한 비활성화/툴팁 가드를 일원화했습니다.
   - `AddPatientModal.vue`에 `titlePrefix` prop(기본값: 'UltraSEEK'), 수정 모드, 거래처 셀렉트, 접수일, 결과지 첨부(ID_파일명.확장자 정규식 검증) 및 취소 버튼을 반영했습니다.
   - `http.js`의 `post` 메서드에 `Array.isArray` `FormData` 배열(`key + '[]'`) 지원을 추가하고, `UploadResult.vue`를 다중 파일(`multiple`) 선택 및 파일명 규칙 검증으로 개편했습니다.
4. **PGx 검사 화면 구축 (`Pgx.vue`)**:
   - 스토리보드 Slide 11 명세에 맞춰 UltraSEEK와 동일한 테이블/검색/모달 연동 레이아웃을 구축하고, 상단 버튼을 `엑셀 업로드`, `엑셀다운로드` 등 PGx 전용 명칭으로 분기했으며 `title-prefix="PGx"`를 주입했습니다. 백엔드 API 배포 전까지 안전 가드가 동작합니다.

### 9.3. 백엔드(서버) 선행 및 보완 필요 명세 (`/home/sgkwon/git/.server/dtc-gene`)

1. **권한 코드(`$auth_`) 매핑 불일치**:
   - `base/get_check_list.php`, `base/get_check.php`, `base/set_check.php`: 검사종류 권한 코드인 `M003` 대신 `$auth_["M002"]`를 참조함.
   - `company/get_company_list.php`, `company/get_company.php`, `company/set_company.php`: 거래처관리 권한 코드인 `M002` 대신 `$auth_["M007"]`를 참조함.
   - `patient/get_patient.php`: 검사자관리 권한 코드인 `M004` 대신 `$auth_["M003"]`를 참조함.
2. **백엔드 SQL 및 로직 버그**:
   - `patient/get_patient_list.php` (123라인): TAT 제거 시 `CASE WHEN ...` 절만 주석 처리되고 `END as tat_day`가 주석 해제된 채 남아 있어 조회 건수가 1건 이상일 때 SQL 구문 오류가 발생함.
   - `company/set_company.php` (67라인): `insert` 분기 내 미완성 조건문 `if( !isset($birth_date) || $birth_date == "" )`이 남아 있어 바로 다음 줄인 `$hlDB->TransactionBegin();` 구문이 조건부로 묶여 있음.
3. **미구현 DB 컬럼 및 API 엔드포인트**:
   - 검사자 관리(`patient/`): `입고일자`, `암발생`, `암종류` DB 컬럼 및 조회/저장 로직 미구현.
   - UltraSEEK 검사(`ultraseek/`): `get_ultraseek_list.php` 내 `완료일(finish_date)`, `상태(status)`, `다운로드여부` 실제 값 반환 미구현 및 검사자 추가/수정/삭제, 검사자 엑셀 업로드/다운로드, 결과지 단일/다중 업로드 및 압축 다운로드 API 미구현.
   - PGx 검사(`pgx/`): 관련 테이블 및 백엔드 API 전체 미구현.
