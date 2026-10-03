---
name: dtc-gene-in-admin
description: dtc-gene-in-admin - 지니인사이트 DTC 유전자 분석 관리자 시스템. 회원, 거래처, 검사종류, 검사자, 결과, 유전자, UltraSEEK, PGx 관리. Vue 2 + Vuetify 2.
---

# dtc-gene-in-admin (지니인사이트 관리자 시스템)

지니인사이트 DTC 유전자 분석 관리자용 백오피스 웹 플랫폼.

## 기술스택
- **Frontend**: Vue 2.6 + Vuetify 2.6
- **상태관리**: Vuex 3
- **라우터**: Vue Router 3 (hash mode)
- **HTTP**: Axios
- **스타일**: SASS/SCSS, 커스텀 디자인 시스템 (`custom.scss`)
- **다국어**: vue-i18n (한국어 'ko' 고정)
- **빌드**: Vue CLI 5
- **배포**: Apache 2.4 SFTP Smart Sync (`client/deploy.sh`)

## 프로젝트 경로
`~/git/dtc-gene-in-admin/client/`

## 주요 디렉토리 구조
```
client/src/
├── components/
│   ├── Common/          # 공통 (DataTable, Calendar, Holiday 등)
│   ├── Company/         # 거래처 관리 (Company, DetailCompany)
│   ├── Type/            # 검사종류 관리 (Type, DetailType)
│   ├── Member/          # 회원 관리 (Member, DetailMember)
│   ├── Manage/          # 검사자(환자) 관리 (Manage, DetailManage)
│   ├── Gene/            # 유전자 관리 (Gene, DetailGene)
│   ├── Result/          # 검사결과 관리 (Result, DetailResult)
│   ├── UltraSeek/       # UltraSEEK 검사 관리 (UltraSeek)
│   ├── Pgx/             # PGx 검사 관리 (Pgx)
│   └── Login.vue        # 관리자 로그인
├── router/index.js      # 라우터
├── mixin/
│   ├── http.js          # API 호출 mixin
│   ├── validation.js    # 유효성 검증 mixin
│   └── authority.js     # 메뉴 권한 체크 mixin
├── i18n/index.js        # 다국어 리소스 (한국어 고정)
├── plugins/vuetify.js   # Vuetify 테마 팔레트 (Primary: #1554a2, Accent: #21b4e9)
├── styles/              # custom.scss, variable.scss, design-system.css
└── store.js             # Vuex 스토어
```

## 라우트 및 메뉴 권한 체계 (DB `lims_code` 일치화)
| 권한 코드 | 라우트 경로 | 컴포넌트 | 설명 |
| :---: | :--- | :--- | :--- |
| **`M001`** | /member | Member | 회원(사용자) 목록 |
| **`M001`** | /member/detail | DetailMember | 회원(사용자) 상세 |
| **`M002`** | /company | Company | 거래처 목록 |
| **`M002`** | /company/detail | DetailCompany | 거래처 상세 |
| **`M003`** | /type | Type | 검사종류 목록 |
| **`M003`** | /type/detail | DetailType | 검사종류 상세 |
| **`M004`** | /manage | Manage | 검사자(환자) 목록 |
| **`M004`** | /manage/detail | DetailManage | 검사자(환자) 상세 |
| **`M005`** | /gene | Gene | 유전자 목록 |
| **`M005`** | /gene/detail | DetailGene | 유전자 상세 |
| **`M006`** | /result | Result | 검사결과 목록 |
| **`M006`** | /result/detail | DetailResult | 검사결과 상세 |
| **`M007`** | /ultraseek | UltraSeek | UltraSEEK 검사 관리 (준비 중) |
| **`M008`** | /pgx | Pgx | PGx 약물유전체 검사 관리 (준비 중) |

## 핵심 컨벤션 및 주의사항
- **목록/상세 패턴**: `<도메인>.vue` (목록) + `Detail<도메인>.vue` (상세)
- **상세 뷰 카드 상단 패딩**: `#content > .v-card > .v-card__text`에 `32px 28px` 패딩 보장
- **UI 콤팩트 스타일**: 체크박스 및 라디오버튼은 `.compact-checkbox`, `.compact-radio`를 적용하여 폰트(`13px`) 대비 아이콘 크기를 `16px`로 유지
- **브랜드 컬러**: Primary `#1554a2`, Accent `#21b4e9`
- **언어 정책**: 한국어 고정 (`ko`)
- **패키지 매니저**: pnpm (`npm` 사용 절대 금지)
- **결과지 뷰어 연동**: 배포 서버 기본 도메인, 개발 `http://localhost:8081`
- **배포 규칙**: 사용자의 명시적 지시 전 배포 절대 금지
