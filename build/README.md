# club5678 global Utils API(cu, au, global, ...)

## Club5678, TongTong, VC, Fuego 사용 가능

- TongTong, VC, Fuego의 경우 git GLOBAL을 바라보고 있으므로 push가 되어야만 사용 가능

## Change Log

- 2023-07-12
  - `cu.storage`
    - `cu.storage.setSchedule`, `cu.storage.getSchedule`
      - isPerDay 옵션 삭제.
      - [cu.storage.setSchedule](http://help.club5678.com:8000/cu.storage.html#.setSchedule) 참고
      - [cu.storage.getSchedule](http://help.club5678.com:8000/cu.storage.html#.getSchedule) 참고
      - end 옵션을 지정하지 않을 경우 스토리지 생성 시점으로부터 1개월 후 자동 지정(스토리지 자동 삭제를 위함)

- 2023-07-11
  - `cu.storage`
    - `cu.storage.setSchedule`
      - isOnlyLatest 옵션(default: false) 추가. 해당 값이 true일 경우 가장 최근 실행 시각만 체크(max가 2 이상으로 제어할 경우에 사용됨)

- 2023-07-10
  - `cu.base`
    - `toNumber`
      - null일 경우 null 반환.
      - nested Array를 만났을 경우 재귀 호출을 통해 전부 number로 변환
  - `cu.storage`
    - 스케쥴 공통
      - 접두사 'SCHE_' 붙여서 가져옴
      - `cu.storage.init` 에서 만료시각이 지난 스케쥴 자동 삭제
    - `getSchedule`
      - 스케쥴이 설정 안되어있을 경우(EMPTY) 리턴값을 isEnabled true 반환
    - `setSchedule`
      - 4번째 파라메터값으로 isImmediatelyUpdate 값을 받음. true로 설정할 경우 즉시 업데이트 처리
    - `removeSchedule` -- new
      - 스케쥴 명시적 or 만료시각에 따른 삭제 지원
  - `cu.device`
    - 공통
      - CLUBRADIO, CLUBLIVE 관련된 내용 삭제
      - 푸에고 파서 추가로 `isClubApp` 값 사용 가능
      - `cu.device.appInfo`에 기기명인 deviceName property 추가
