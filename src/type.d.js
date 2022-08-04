/**
 * @typedef {object} replacerConfig Replacer 생성자 옵션
 * @property {string} filePath file full path (d:/temp/conts/js/*.vue)
 * @property {boolean} [isEucKr = true] iconv 로 최종 내보낼 파일 인코딩 형식
 * @property {string} [fileSep = sep] window vs linux file 구분자에 따른 값
 * @property {string} [isIeMode = false] IE 모드일 경우 output file에 eslint 를 적용하여 저장. 속도가 느린 단점이 있음
 * @property {string} adminFolder admin 폴더명. IE 모드 동작시 해당 폴더 아래에 존재하는 js만 유효한 걸로 판단
 */

/**
 * @typedef {object} replaceTargetFileInfo
 * @property {string} filePath 파일 경로
 * @property {boolean} [isTemplate=false] wrapping 여부
 * @property {boolean} [isSync=false] 덮어쓰기 여부
 * @property {string|object} contents 파일 내용 여부
 * @property {string} positionId 교체 대상 Id
 * @property {number} indentDepth 들여쓰기 Tab 수
 * @property {Function} task 덮어쓸 로직을 가지고 있는 비동기 함수 명
 */

/**
 * @typedef {object} manageInfo
 * @property {number} isReplaceFlag 0: 대기, -1: 디코딩, 1: 인코딩
 * @property {string} [tplPath] template path
 * @property {string} [srcPath] source path
 * @property {string} [cssPath] style path
 */
