# matchapizza — 티켓팅 리허설

티켓링크의 화면 구성을 참고한 디자인씽킹 팀 프로젝트입니다. 첫 예매 사용자가 사전 준비와 예매 순서를 익힐 수 있도록 공연별 모의예매, 같은 화면의 시계, 대기 상태 안내를 제공합니다.

## 체험 흐름

공연 선택 → 회차 선택 → 안내형/실전형 연습 → 오픈 대기 → 새로고침으로 입장 → 접속 대기 → 좌석 선택 → 예매 정보 확인 → 모의결제 → 결과 확인

- YES24 LIVE HALL 콘서트, 고척스카이돔 야구, 서울월드컵경기장 축구를 체험합니다.
- 안내형과 실전형 모두 실제 예매나 결제를 진행하지 않습니다.
- 표시 시각은 기기 시간 기반 체험용 시각이며, 실제 티켓링크 서버와 연결하지 않습니다.
- 공연·금액·대기순번·예상 대기시간은 시연용 데이터입니다.
- 오픈 시간이 되면 화면의 **새로고침** 버튼이나 브라우저 새로고침으로 대기열에 입장합니다.
- 오픈 전에 새로고침해도 예정 시각은 바뀌지 않습니다.
- 같은 탭에서 새로고침할 때 공연·회차·좌석 및 연습 진행 내용을 유지합니다.
- 진행 내용은 해당 브라우저 탭의 sessionStorage에 저장되며, 결제정보는 수집하지 않습니다. 커뮤니티에 작성한 닉네임과 글은 공개됩니다.

## 좌석도와 3D 시야

- 공식 자료에서 확인한 층·방향·대표 구역을 선택합니다. 고척과 상암은 공식 전체 좌석도도 펼쳐 볼 수 있습니다.
- 선택 좌석의 3D 모의 시야를 열고 드래그, 방향키, 확대·축소 또는 전체 배치 전환을 이용합니다.
- 열·번호·가격·잔여석은 연습용입니다. 3D는 정밀 실측이나 실제 촬영 시야가 아니며 공연별 무대, 난간과 사람에 의한 가림을 재현하지 않습니다.
- YES24는 공식 층 구분을 참고한 개념도이며, 1층 스탠딩/지정석 구성은 공연마다 다릅니다.

## 실시간 커뮤니티

공연장별 공개 대화방에 서버에 저장되는 글을 남길 수 있습니다. 화면은 3초마다 새 글을 확인하며, 서버 연결 실패도 표시합니다. 가상 메시지나 접속자 수는 만들지 않습니다.

- 공개 서버: https://matchapizza-community.syc123400.chatgpt.site
- GET/POST/DELETE `/api/community` · Cloudflare D1 저장
- 최근 50개 표시, 300자 글, 닉네임 12자, 기기별 3초 전송 간격
- 작성 기기에만 저장한 삭제 토큰으로 본인 글을 삭제할 수 있습니다.
- 닉네임·기기 식별자·본인 글 삭제 토큰은 localStorage에, 예매 연습은 sessionStorage에 저장됩니다.
- 계정 인증이 없는 과제용 공개 프로토타입입니다. 닉네임은 검증된 실명이 아닙니다.

## 공식 자료

- [YES24 2026 회사소개서](https://company.yes24.com/pdf/2026_YES24_%ED%9A%8C%EC%82%AC%EC%86%8C%EA%B0%9C%EC%84%9C.pdf)
- [서울시설공단 상암 좌석안내](https://www.sisul.or.kr/open_content/worldcup/guidance/mainst_seat.jsp)
- [서울시설공단 고척 2026 좌석배치도](https://www.sisul.or.kr/open_content/skydome/introduce/seat.jsp) · 공공누리 출처표시
- 상세 근거와 모델링 범위: `venue-sources.json`

## 파일

- `index.html`: 페이지 구조
- `styles.css`: 반응형 디자인
- `app.js`: 모의예매 상태 및 인터랙션
- `venues.js` / `venues.css`: 공식 자료 기반 구역 안내
- `seat-view.js` / `seat-view.css`: 의존성 없는 Canvas 3D 모형
- `community.js` / `community.css`: 실제 서버 연결 커뮤니티

외부 패키지와 빌드 과정이 없는 정적 웹사이트입니다. GitHub Pages에서 `main` 브랜치의 루트 폴더를 배포합니다.

## 디자인 참고

- [티켓링크](https://www.ticketlink.co.kr/)
- [티켓링크 공식 구매 가이드](https://ticketlink.dn.toastoven.net/web/event/popup_guide_en/popup_guide_en/popup_guide_en.html)

이 프로젝트는 티켓링크의 공식 서비스가 아닙니다.

## 사진 기반 좌석 탐색 (2026-11-06)

홈의 공연장 카드와 상세 페이지에서 실제 내부 사진을 먼저 둘러보고, 같은 창의 구역 선택과 3D 시야로 이동합니다. 좌석 탐색은 예매 연습에서 선택한 좌석을 변경하지 않습니다.

- **실제 사진:** 원본 평면 사진을 확대하고 이동합니다. 구면 360도 사진처럼 감싸지 않습니다. 촬영 위치가 알려지지 않은 사진을 임의의 선택 좌석에 연결하지 않습니다.
- **3D 시야:** 공개 사진에서 확인되는 벽·무대·지붕·철골·관람석의 특징을 참고한 공간 모형입니다. 구역과 앞/중간/뒤쪽 시점 등을 변경하며 비교합니다.
- **전체 배치:** 선택 위치와 공연장 구조를 함께 확인하는 모형입니다.
- 좌석별 실측 시야, 최신 시설 상태, 공연별 무대 구성, 난간·앞사람의 가림을 보증하지 않습니다. 사진의 촬영연도와 출처는 화면과 메타데이터에 표시합니다.
- UX 참고: [세종문화회관 공식 좌석배치도와 무대 시각선](https://www.sejongpac.or.kr/portal/main/contents.do?menuNo=200368)의 층·구역·대표 좌석 탐색 방식. 해당 기관의 사진이나 VR 자산은 복제하지 않았습니다.

### 사진 출처

| 파일 | 출처 / 저작자 | 촬영 및 이용 정보 |
| --- | --- | --- |
| `photo-gocheok-1.jpg` | [서울시설공단](https://sisul.or.kr/open_content/skydome/guidance/dome.jsp) | 2015년 · [공공누리 제1유형](https://www.kogl.or.kr/info/licenseType1.do) · 변경 없음 |
| `photo-worldcup-1.jpg` | [JukoFF / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Seoul_World_Cup_Stadium_(2018)_07.jpg) | 2018-12-07 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) · 변경 없음 |
| `photo-worldcup-thumb.jpg` | 같은 Commons 사진의 제공 축소본 | 1280px · CC BY-SA 4.0 유지 · 내용 변경 없음 |
| `photo-yes24-stage.jpg` | [YES24 STAGE 공식 소개](https://yes24stage.com/ko/about/yes24artone.php) | 촬영일 미공개 · 사진 © 예스24 · 출처와 함께 구조 참고용으로 표시 |
| `photo-yes24-hall.jpg`, `photo-yes24-audience.jpg` | [채널예스 현장 기사](https://m.ch.yes24.com/article/details/38845) · 사진 예스24 | 2019-05-15 북토크 · 사진 © 예스24 · 원본 워터마크 유지 |

사진의 라이선스는 해당 사진에만 적용되며 다른 코드와 자료의 이용허락을 뜻하지 않습니다. 사진·좌석 배치도의 저작권과 상표는 각 원권리자에게 있습니다. 상암 사진은 겨울 잔디 보호덮개가 있는 전경이며, 선택 좌석에서 찍은 사진이 아닙니다.

새 파일: `venue-photos.js`(화면용 출처 데이터), `photo-stadia.json` / `photo-yes24.json`(검증 기록), `seat-scene.js`(사진 참고 공간 모형).
