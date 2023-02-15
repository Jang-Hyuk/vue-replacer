/**
 * @typedef {object} tempStorageOption 프로시저 별 파싱 결과를 임시로 저장할 저장소
 * @property {number} level 프로시저를 파싱하는 단계
 * @property {string} db db명. ex) c_payment
 * @property {string} procedure 프로시저명. ex) p_adm_payment_day_stats_list
 * @property {string} procedureName 프로시저명 풀 네임 ex) c_payment.p_adm_payment_day_stats_list
 * @property {string[]} comments 프로시저 설명
 * @property {string[]} nextComments 다음 프로시저 설명. 현 프로시저와 다음 프로시저 CALL 이 수행되기 전까지의 설명을 임시로 담고 있음
 * @property {string[]} volatilityComments 휘발성 코멘트
 * @property {string[][][]} rowChunkDesciptions Row Data Packet[] 청크 단위 설명.
 * @property {procedureOption[]} params 프로시저 파라메터 절
 * @property {number} [rowChunkIndex] (default 0)프로시저 결과 row 대분류 index. 한 프로시저로 각기 다른 결과를 주는 프로시저를 담을 인덱스
 * @property {number} rowDataPacketIndex (default 0) 프로시저 결과 row 중분류 index. 기본적인 프로시저 결과를 담을 인덱스
 * @property {procedureOption[][][]} rows 프로시저 결과 Rows
 */

/**
 * @typedef {object} procedureChunk 프로시저 저장 단위
 * @property {number[]} workNumbers 일감 번호 ex) #5687, #8657 -> number
 * @property {string} db db명. ex) c_payment
 * @property {string} procedure 프로시저명. ex) p_adm_payment_day_stats_list
 * @property {string} procedureName 프로시저명 풀 네임 ex) c_payment.p_adm_payment_day_stats_list
 * @property {string[]} comments 프로시저 설명
 * @property {string[][][]} rowChunkDesciptions Row Data Packet[] 청크 단위 설명.
 * @property {procedureOption[]} params 프로시저 파라메터 절
 * @property {procedureOption[][][]} rows 프로시저 결과 Rows
 */

/**
 * @typedef {object} procedureOption
 * @property {string | any} type param 절일 경우 (ENUM, number, string), row 절일 경우 (ENUM, string)
 * @property {string} key column or row key
 * @property {string} comment 설명
 * @property {string} dataType DB 데이터 타입
 */
