/**
 * 하드웨어 관련 함수
 * @memberof cu
 * @namespace hardware
 */
cu.hardware = {
	/**
	 * 장치사용가능유무 체크
	 * @param {{video: boolean, audio: boolean}} constraints
	 * returns boolean video/audio 둘중하나라도 사용불가시 false
	 */
	isUseMedia(constraints) {
		const that = this;
		constraints = constraints || { audio: true, video: true };

		/// ///////////////////////////////////////////////////////////////
		// 메인 체크로직 출발...
		/// ///////////////////////////////////////////////////////////////

		// 어플이면 성공프로미스 리턴.
		if (cu.device.isClubApp()) {
			return Promise.resolve(true);
		}

		// 웹이면 체크 프로미스 리턴.
		return new Promise(async (resolve, reject) => {
			const hasAudioDevice = await that.isAudioDeviceExists(constraints);
			const hasVideoDevice = await that.isVideoDeviceExists(constraints);
			const audioPerm = await that.checkAudioPermission(constraints);
			const videoPerm = await that.checkVideoPermission(constraints);

			// 장치가 하나라도 없으면 reject();
			if (hasAudioDevice == false || hasVideoDevice == false) return resolve(false);

			// 장치는 있는데 퍼미션이 하나라도 denied 이면 reject();
			if (audioPerm == 'denied' || videoPerm == 'denied') return resolve(false);

			// 장치는 있는데 denied 도 없는데 하나라도 prompt 이면 권한체크(constraints 에 있는거 동시에)
			if (audioPerm == 'prompt' || videoPerm == 'prompt') {
				return navigator.mediaDevices
					.getUserMedia(constraints)
					.then(stream => {
						// 장치들 다 끄고
						stream.getTracks().forEach(track => track.stop());
						resolve(true);
					})
					.catch(() => resolve(false));
			}

			// 걸리는게 하나도 없다. resolve() 다.
			resolve(true);
		});
	},
	/**
	 * 장치보유 유무 체크
	 * @param {{video: boolean, audio: boolean}} constraints
	 * returns {{video: boolean, audio: boolean}}
	 */
	hasMedia(constraints) {
		const that = this;
		constraints = constraints || { audio: true, video: true };
		const result = { audio: true, video: true };

		/// ///////////////////////////////////////////////////////////////
		// 메인 체크로직 출발...
		/// ///////////////////////////////////////////////////////////////

		// 어플이면 성공프로미스 리턴.
		if (cu.device.isClubApp()) {
			return Promise.resolve(result);
		}

		// 웹이면 체크 프로미스 리턴.
		return new Promise(async (resolve, reject) => {
			const hasAudioDevice = await that.isAudioDeviceExists(constraints);
			const hasVideoDevice = await that.isVideoDeviceExists(constraints);
			result.video = hasVideoDevice;
			result.audio = hasAudioDevice;
			return resolve(result);
		});
	},
	/**
	 * 권한체크
	 * @param {{video: boolean, audio: boolean}} constraints
	 * returns {{video: boolean, audio: boolean}}
	 * - 장치의 권한 => denied|prompt(재설정상태) 인 경우 false
	 */
	isPermitMedia(constraints) {
		const that = this;
		constraints = constraints || { audio: true, video: true };
		const result = { audio: true, video: true };

		/// ///////////////////////////////////////////////////////////////
		// 메인 체크로직 출발...
		/// ///////////////////////////////////////////////////////////////

		// 어플이면 성공프로미스 리턴.
		if (cu.device.isClubApp()) {
			return Promise.resolve(result);
		}

		// 웹이면 체크 프로미스 리턴.
		return new Promise(async (resolve, reject) => {
			const audioPerm = await that.checkAudioPermission(constraints);
			const videoPerm = await that.checkVideoPermission(constraints);

			// 장치는 있는데 퍼미션이 하나라도 denied 이면 reject();
			result.video = videoPerm == 'denied' ? false : result.video;
			result.audio = audioPerm == 'denied' ? false : result.audio;

			// 장치는 있는데 denied 도 없는데 하나라도 prompt 이면 권한체크(constraints 에 있는거 동시에)
			if (audioPerm == 'prompt' || videoPerm == 'prompt') {
				return navigator.mediaDevices
					.getUserMedia(constraints)
					.then(stream => {
						// 장치들 다 끄고
						stream.getTracks().forEach(track => track.stop());
						resolve(result);
					})
					.catch(async function (err) {
						const audioPerm2 = await that.checkAudioPermission(constraints);
						const videoPerm2 = await that.checkVideoPermission(constraints);
						result.audio = audioPerm2 === 'granted';
						result.video = videoPerm2 === 'granted';
						resolve(result);
					});
			}

			// 걸리는게 하나도 없다. resolve() 다.
			resolve(result);
		});
	},
	/**
	 * 팝업창 띄울 위치계산(브라우저 기준)
	 * @param popupWidth 팝업창 가로 크기
	 * @param popupHeight 팝업창 세로 크기
	 * @returns {{x: number, y: number}}
	 */
	getWinPosition(popupWidth, popupHeight) {
		const popupX = Math.round(window.screenX + window.outerWidth / 2 - popupWidth / 2);
		const popupY = Math.round(window.screenY + window.outerHeight / 2 - popupHeight / 2);

		return { x: popupX, y: popupY };
	},

	// webview/window visible 여부
	isVisibleWin() {
		if (cu.device.isClubApp()) {
			let { appChildWins } = localStorage;
			appChildWins = cu.base.isJsonParse(appChildWins)
				? JSON.parse(localStorage.appChildWins)
				: [];
			const len = appChildWins.length;
			if (len <= 0) {
				return true;
			}
			return appChildWins[len - 1] === window.name;
		}
		return document.visibilityState === 'visible';
	},

	// 네이티브 내에 해당 브릿지 커맨드 존재여부
	isBridgeCmd(cmd) {
		let { bridgeCmdList } = localStorage;
		if (!cu.device.isClubApp() || !cmd || !cu.base.isJsonParse(bridgeCmdList)) {
			return false;
		}
		bridgeCmdList = JSON.parse(localStorage.bridgeCmdList);
		return _.indexOf(bridgeCmdList, cmd) >= 0;
	},

	// 오디오장치가 존재하냐? (체크할일 없으면 true)
	async isAudioDeviceExists(constraints) {
		constraints = constraints || { audio: true };
		// 체크할일 없으면 true
		if (!constraints.audio) return Promise.resolve(true);

		// 체크해야되면 진짜체크.
		return navigator.mediaDevices.enumerateDevices().then(devices => {
			const audioDevices = devices.filter(device => device.kind === 'audioinput');
			return audioDevices.length > 0;
		});
	},
	// 비디오장치가 존재하냐? (체크할일 없으면 true)
	async isVideoDeviceExists(constraints) {
		constraints = constraints || { video: true };
		// 체크할일 없으면 true
		if (!constraints.video) return Promise.resolve(true);

		// 체크해야되면 진짜체크.
		return await navigator.mediaDevices.enumerateDevices().then(devices => {
			const videoDevices = devices.filter(device => device.kind === 'videoinput');
			return videoDevices.length > 0;
		});
	},
	// 오디오 퍼미션체크(체크할일 없으면 granted)
	async checkAudioPermission(constraints) {
		constraints = constraints || { audio: true };
		// 체크할일 없으면 granted
		if (!constraints.audio) return Promise.resolve('granted');
		return navigator.permissions.query({ name: 'microphone' }).then(perm => {
			if (perm.state == 'denied') {
				navigator.mediaDevices
					.getUserMedia({ audio: true })
					.then(() => {})
					.catch(() => {});
			}
			return perm.state;
		});
	},
	// 비디오 퍼미션체크(체크할일 없으면 granted)
	async checkVideoPermission(constraints) {
		constraints = constraints || { video: true };
		if (!constraints.video) return Promise.resolve('granted');
		return navigator.permissions.query({ name: 'camera' }).then(perm => {
			// perm.state
			if (perm.state == 'denied') {
				navigator.mediaDevices
					.getUserMedia({ video: true })
					.then(() => {})
					.catch(() => {});
			}
			return perm.state;
		});
	}
};
