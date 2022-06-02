# Roadmap

- [ O ] (Replace) Script - outer replace
- [ O ] (Encoding) IE 일 경우 ESLint 전처리 후 저장
- [ O ] (Replace) Js Script Outer 영역 Replace
- [ O ] (Replace) Js import 영역 제거 후 replace
- [ O ] (Replace) Style - replace
- [ ] (Init) Watcher
- [ ] (Restore) Js
- [ ] (Resotre) Html & Php

Auto Watch 조건
*** Vue Watcher 동작

1. Vue File이 변경될 경우 template 와 script 어트리뷰트 값을 기반으로 Replace 진행

*** PHP, Html, Js Watcher 동작

1. Vue File Watch Maps 생성 {vue: path, js: path, html: path, ~isRunningReplace: olean}
2. 파일이 변경되었을 경우 Watch List에 포함되는지 체크.
3. Js 기준 Vue Delimiter, PHP, Html 기준 Vue Delimiter + IDs
4. 조건이 충족되었을 경우 해당 isRunningReplace 값 true로 교체

Vue File (Js)

1. Vue 파일을 기반으로 Script 영역을 추출
2. import 가 사용된 부분은 걷어냄
3. Script Outer와 Inner 영역으로 분리
4. js 파일에 Delimiter 구분(Vue.component or new Vue)을 찾아 Inner 영역과 Outer 영역을 찾음
5. Script Outer와 Inner 영역 교체

Js File

1. Js 파일 기준 Script 영역 추출
2. Script Outer와 Inner 영역 분리
3. Vue 파일에 export default 기준으로 Inner 영역과 Outer 영역 찾음
4. Script Outer와 Inner 영역 교체
