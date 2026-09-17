# 서울대학교 건축학과 학사·교과 안내

건축학·건축공학 전공, 교양, 다전공, ABEEK 안내의 학생용 사이트와 기존 Sites 서버 소스입니다.

## 바로 실행하기

Node.js 22 이상에서 다음 명령을 실행합니다. 학생용 정적 빌드는 외부 패키지 설치가 필요 없습니다.

```bash
npm run build:static
npm run preview
```

브라우저에서 http://localhost:4173 을 엽니다. 수정 후 build:static을 다시 실행하고 새로고침합니다.

## 수정할 파일

| 작업 | 파일 |
|---|---|
| 메뉴·화면 구조·제목·로고 배치 | public/guide.html |
| 색상·글꼴·간격·반응형 화면 | public/guide.css |
| 언어·전공·연도 선택과 안내 로직 | public/guide.js |
| 이수표·검색·상세 졸업요건 | public/details.js |
| 연도별 교과목·학점·필수 구분·졸업요건 | public/curricula.json |
| 게시 기준일·분류 | public/guide-data.json |
| 확인된 개정 이력 R01–R10 | public/revisions.json |
| 학과 로고·파비콘 원본 | public/department-logo.jpg |

기존 Sites의 학생 화면과 학사 자료를 옮겼습니다. 정적 출력은 관리자 화면과 API를 포함하지 않으며, 하위 경로에서도 작동하도록 상대 주소를 사용합니다. 자료 범위는 제공 원본 기준이며 2027 사전 작성 교양 개편안은 현재 적용하지 않습니다. 영어 자료의 연도 범위는 분야별로 다릅니다.

## 게시와 도메인

`npm run build:static`의 출력 폴더는 `site-dist/`입니다. 이를 정적 호스팅에 배포할 수 있습니다. GitHub Pages를 사용할 경우 GitHub Actions에서 이 폴더를 게시하도록 설정해야 합니다. 현재 저장소에는 자동 배포가 설정되어 있지 않습니다.

- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- 사용자 도메인 연결: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

도메인은 소유한 주소 또는 학교가 배정한 하위 도메인이 필요합니다. 실제 호스팅과 주소가 정해진 후 DNS를 연결합니다. GitHub 업로드만으로 기존 Sites나 도메인이 바뀌지 않습니다.

## Notion과 운영 자료

Notion은 관리자 자료 관리와 담당자 인계용입니다. Notion 수정 사항은 이 저장소나 학생 화면에 자동 반영되지 않습니다. 확인된 개정을 Notion에 기록한 후 관련 JSON과 안내 로직을 수정·검증하고 게시합니다. 기존 관리자 편집 화면의 저장 자료 역시 학생용 정적 JSON과 별개입니다.

## 기존 Sites 서버 소스

`server/worker.js`, `db/`, `drizzle/`, `build.mjs`, `.openai/hosting.json`은 기존 Sites 구조를 보존합니다. `npm ci && npm run build`는 Sites용 Worker 출력을 만듭니다. `.openai/hosting.json`은 기존 프로젝트 식별자와 논리 DB 연결을 포함하며 다른 호스팅의 배포 설정이 아닙니다.

외부 호스팅에서 요청의 `oai-authenticated-user-*` 헤더를 신뢰하면 인증을 우회할 수 있습니다. 이를 막기 위해 내보낸 서버는 관리자 경로를 기본 차단합니다. Sites의 신뢰할 수 있는 인증 게이트웨이 뒤에서만 `TRUST_SITES_AUTH_HEADERS=true`와 관리자 이메일 `ADMIN_EMAIL`을 설정합니다. 외부 Worker로 이전할 때는 실제 토큰 검증을 구현하기 전 이 설정을 켜지 마세요.

데이터베이스 스키마는 포함되지만 운영 DB 내용은 포함되지 않습니다. 원본 PDF와 Notion 내부 문서, 비밀키도 포함되지 않습니다. PDF 추출 스크립트 `extract-curricula.py`는 기존 작업환경의 파일 매핑을 요구하는 참고 도구이며 일반 빌드에는 사용하지 않습니다.

## 내보내기 기준

기존 Sites 소스 커밋: `9e1fee59d6996ada4396732887f7a4b5f31d65a8`.
GitHub용으로 정적 빌드·로컬 미리보기·이 문서를 추가하고, 개인 관리자 이메일을 환경변수로 바꾸며 서버 관리자 경로를 기본 차단했습니다. 기존 Sites 운영본은 변경하지 않았습니다. 기존 Git 커밋 이력이 아닌 현재 소스 스냅샷입니다.
