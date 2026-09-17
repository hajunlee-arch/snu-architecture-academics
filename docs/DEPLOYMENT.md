# 자동 배포와 도메인 운영

## 자동 배포

`main`의 `public/`, `scripts/build-static.mjs`, `package.json` 또는 배포 워크플로가 변경되면 학생용 정적 사이트를 빌드하고 GitHub Pages에 배포합니다. README만 수정하면 이 워크플로는 실행되지 않습니다.

1. [Pages 설정](https://github.com/hajunlee-arch/snu-architecture-academics/settings/pages)에서 **Build and deployment → Source → GitHub Actions**를 선택합니다. 기존 **Deploy from a branch**는 소스 루트를 그대로 게시하므로 사용하지 않습니다.
2. [배포 워크플로](https://github.com/hajunlee-arch/snu-architecture-academics/actions/workflows/deploy-pages.yml)에서 필요하면 **Run workflow → main**으로 실행합니다.
3. build와 deploy의 성공 및 Pages의 실제 표시 주소를 확인합니다.

기본 예상 주소: https://hajunlee-arch.github.io/snu-architecture-academics/
실제 주소는 성공한 배포 결과와 Pages 설정을 기준으로 합니다.

기존 ChatGPT Sites는 별도 운영본이며 GitHub 변경이 자동 반영되지 않습니다. Notion도 자동 동기화하지 않습니다. 게시 대상은 `site-dist/`뿐이며 관리자 코드와 데이터베이스는 배포하지 않습니다.

## 도메인 연결

현재 사용자 지정 도메인은 미정입니다. 구매나 DNS 변경은 아직 하지 않았습니다. 학교 하위 도메인을 사용할 경우 학교가 배정한 실제 주소와 DNS 변경 권한이 필요합니다.

1. 보유 도메인을 GitHub 계정의 Pages에서 인증합니다. GitHub가 제시하는 TXT 이름과 값을 사용합니다.
2. 저장소 Pages 설정의 **Custom domain**에 실제 호스트명만 입력하고 저장합니다(https:// 및 경로 제외).
3. DNS 관리 화면에서 아래와 같이 연결합니다.
4. DNS 확인과 인증서 발급 후 **Enforce HTTPS**를 활성화합니다. DNS 전파는 최대 24시간 걸릴 수 있습니다.

| 주소 형태 | DNS 종류 | 이름 | 값 |
|---|---|---|---|
| 하위 도메인(예: academics.example.org) | CNAME | academics 또는 관리 화면이 요구하는 전체 호스트명 | hajunlee-arch.github.io |
| 루트 도메인(예: example.org) | A | @ | 185.199.108.153 |
| 루트 도메인 | A | @ | 185.199.109.153 |
| 루트 도메인 | A | @ | 185.199.110.153 |
| 루트 도메인 | A | @ | 185.199.111.153 |

예시 주소는 실제 소유 또는 사용 가능 여부를 확인한 주소가 아닙니다. CNAME 값에는 https://나 저장소 경로를 붙이지 않습니다. 기존 학과 홈페이지 주소의 DNS를 덮어쓰지 않고 배정된 하위 도메인을 사용합니다. 현재 Actions 배포에서는 CNAME 파일이 필요하지 않으며 저장소 Pages 설정에서 도메인을 관리합니다.

도메인을 실제로 연결하려면 정확한 도메인과 DNS 관리 업체(또는 학교 관리 여부)를 확인해야 합니다. 인계 시 저장소 관리자, 도메인 소유자, 갱신일, DNS 관리 주체를 함께 기록합니다.

## 근거

- [GitHub Pages 워크플로](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [게시 소스 선택](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [사용자 지정 도메인과 DNS](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
