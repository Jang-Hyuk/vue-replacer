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
 * @property {boolean} isChangeChild vue 파일과 관련된 파일이 외부에 의해 변경될 경우
 * @property {string} [tplPath] template path
 * @property {string} [srcPath] source path
 * @property {string} [cssPath] style path
 */
