
# Config

## 파일 작성 규칙

- \{fileName\}.temp.\{ext\} => 확장자 이전 'temp'가 들어가지 말 것

## .env 파일 생성 (예시)

  ```bash
  ROOT_FOLDER = ..
  GLOBAL_FOLDER = club5678_global
  ADMIN_FOLDER = club5678_admin
  IGNORE_FOLDER = info-workspace, nuxtExercise, test-nuxt, tongtong
  ```
  
### vsCode Setting

## setting.json 추가

- "vetur.experimental.templateInterpolationService": true,
- "vetur.validation.templateProps": true,

## snippets extensions 수정

- global.code-snippets

``` json
 "Vue Replacer Section Start": {
    "scope": "javascript,vue,php,html",
    "prefix": ["vds", "ㅍㅇㄴ"],
    "body": ["$1### Vue $2"],
    "description": "Vue Delimiter Start"
  },
  "Vue Replacer Section End": {
    "scope": "javascript,vue,php,html",
    "prefix": ["vde", "ㅍㅇㄷ"],
    "body": ["$1### !Vue $2"],
    "description": "Vue Delimiter End"
  }
```

- vue.json

``` json
 "VueReplacerTemplate": {
   "prefix": ["vrt", "ㅍㄳ"],
   "body": ["id=\"$1\" isSync=\"$2\" isTemplate=\"$3\" fileSrc=\"$4\" depth=\"$5\""],
   "description": "Vue Replacer를 활성화하기 위한 *.vue template attribute"
 },
 "VueReplacerScriptStyle": {
   "prefix": ["vrs", "ㅍㄱㄴ"],
   "body": ["id=\"$1\" isSync=\"$2\" isTemplate=\"$3\" fileSrc=\"$4\""],
   "description": "Vue Replacer를 활성화하기 위한 script or style attribute"
 }
```

## global \@types 폴더 생성

- index.d.ts 생성

  ``` ts
  import Vue from 'vue';

  declare module 'vue/types/vue' {
    interface Vue {
      $: typeof $;
      cu: {
        base: typeof cu.base;
        date: typeof cu.date;
        storage: typeof cu.storage;
        dom: typeof cu.dom;
        php: typeof cu.php;
        qs: typeof cu.qs;
        device: typeof cu.device;
        str: typeof cu.str;
        hardware: typeof cu.hardware;
      }
    }
  }
  ```

- jsconfig.json 수정

  ``` json
  {
    "extends": "../jsconfig.json",
    "include": [
      "**/*.js",
      "@types"
    ]
  }
  ```

# Workspace .eslintrc 수정

``` json
  // "vue/no-multi-spaces": [
  //   "error",
  //   {
  //     ignoreProperties: false,
  //   },
  // ],
  // "vue/multi-word-component-names": "error",
  // FIXME
  "vue/multi-word-component-names": "off",
```

# Commands

| Command | Description |
|---------|-------------|
| yarn dev | 즉시 파일 교체 후 eslint fix 결과물 대체 |
| yarn dev:ie | IE 실시간 체크용. eslint fix 결과물 생성 후 대체 |

# Roadmap

- [ O ] (Replace) Script - outer replace
- [ O ] (Encoding) IE 일 경우 ESLint 전처리 후 저장
- [ O ] (Replace) Js Script Outer 영역 Replace
- [ O ] (Replace) Js import 영역 제거 후 replace
- [ O ] (Replace) Style - replace
- [ O ] (Init) Watcher
- [ O ] (Restore) Js
- [ O ] (Resotre) Html & Php & Css
- [ O ] (Restore) data 객체 존재 시 eslint fix 에러

# Auto Watch 조건

*** Vue Watcher 동작

1. Vue File이 변경될 경우 template 와 script 어트리뷰트 값을 기반으로 Replace 진행

*** PHP, Html, Js Watcher 동작

1. Vue File Watch Maps 생성 \{vue: path, js: path, html: path, ~isRunningReplace: olean\}
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
