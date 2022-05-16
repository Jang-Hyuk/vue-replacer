<!-- 태수투 ss -->
<template
	id="photoPopup"
	isTemplate="0"
	isSync="1"
	depth="3"
	fileSrc="../html/cTest.html"
>
	<div v-if="isShow" id="photoPopup" class="qmeet_pop_wrap qMeet_pop_wrap">
		<div class="qmeet_banner">
			<!-- 배너영역 슬라이드-->
			<div class="qMeet_pop_evnt_bg" onclick="history.back()"></div>
			<div class="qmeet_banner__wrap">
				<button class="qMeet_pop_cls" onclick="history.back()">닫기</button>
				<div class="qmeet_banner__pagination"></div>
				<!-- 페이지네이션영역 -->
			</div>
			<template slot="hi">
				<div>슬롯이당께</div>
			</template>
		</div>
	</div>
</template>

<script>
export default {
	props: ['ra!sss'],
	data() {
		var vm = this;
		return {
			isShow: true,
			isShow2: true,
			v: vm.row.v,
			i: vm.row.i,
			isAdmin: __vars.isAdmin || false,
			loadAni: null,
			locInfo: __vars.loc,
			spinner: '/_global/inc/ui/loading-spin2.svg',
			swiperOption: {
				lazy: true,
				preloadImages: false,
				spaceBetween: 34,
				containerModifierClass: 'talk__content_box',
				pagination: {
					el: '.talk__photo_pagination',
					type: 'fraction'
				},
				virtual: {
					slides: []
				}
			}
		};
	},
	computed: {
		/** 회원번호 */
		memNo() {
			return $.cookie('gCCV:NO');
		},

		/** 회원번호 */
		memSex() {
			return $.cookie('gCCV:SEX');
		},

		/** 디바이스 정보(return false 이면 앱이 아님) */
		device() {
			return func.deviceCode();
		},

		/** 내용 개행문자 처리 */
		titleConts() {
			return this.row.v.title_conts.replace(/\n/g, '<br />');
		},

		/** swiper 객체 */
		swiper() {
			return this.$refs.talkSwiper ? this.$refs.talkSwiper.swiper : null;
		},

		/** 쿼리스트링 리턴 */
		queryString() {
			return $.qStringToJson(location.search.replace('?', ''));
		}
	},
	watch: {
		/** 게시글 수정으로 swiper 갱신이 될때 */
		undefined() {
			if (this.swiper) this.on.virtualData();

			/** 내용 더보기 버튼 활성화(list dom 렌더링 후 엘리먼트 높이 비교) */
			this.titleContsArea();
		}
	},
	created() {
		var vm = this;
		vm.on();
		vm.job();
	},
	methods: {
		/**
		 * 게시글 또는 댓글 작성자 확인 여부
		 * @param {string} talkMemNo 게시글 작성자 번호
		 * @param {string} tailMemNo 댓글 작성자 번호
		 * @returns
		 */
		isWriterCheck(talkMemNo, tailMemNo) {
			if (this.isAdmin) {
				return true;
			}
			return (tailMemNo === this.memNo || talkMemNo === this.memNo) === true;
		},

		/**
		 * 게시글 또는 댓글 작성자일때 비밀글 여부 판단하여 이미지 및 컨텐츠 처리
		 * @param {object} tailInfo
		 * @returns
		 */
		secretContent(tailInfo) {
			var photoSrc = tailInfo.exit_yn === 'n' ? tailInfo.mem_photo : '';
			var isContent = true;
			if (
				tailInfo.secret_yn === 'y' &&
				this.isWriterCheck(tailInfo.mem_no, tailInfo.tail_mem_no) === false
			) {
				photoSrc =
					'https://image.club5678.com/imgs/mobile/talkandtalk/img/ico_lock_cir.png';
				isContent = false;
			}
			return [{ isContent, img: photoSrc }];
		},

		/**
		 * 지역 값 추출
		 * @param loc1
		 * @param loc2
		 * @param loc3
		 * @returns {string}
		 */
		productLocInfo(loc1, loc2, loc3) {
			if (!loc1) return '#전국';
			var pdLocInfo = '#' + this.locInfo[loc1];
			if (loc2) pdLocInfo += ' #' + this.locInfo[loc2];
			if (loc3) pdLocInfo += ' #' + this.locInfo[loc3];
			return pdLocInfo;
		},

		/**
		 * 3자리수 콤마 노출
		 * @param _number
		 * @returns {string}
		 */
		setComma(_number) {
			return (_number || 0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
		},

		/**
		 * 아바타 이미지 주소
		 * @param sex
		 * @param e
		 * @returns {string}
		 */
		noImg(sex, e) {
			var src =
				'https://image.club5678.com/imgs/mobile/130417/noimg_' + (sex || 'f') + '.png';
			if (e) e.target.src = src;
			else return src;
		},

		/**
		 * 숫자에 k 표시 형식
		 * @param _num
		 * @returns {string|number|number}
		 */
		kFormat(_num) {
			var num = Number(_num) || 0;
			return num > 1000 ? (num / 1000).toFixed(1) + 'k' : num;
		},

		/**
		 * 플러그로 이동
		 * @param plugNo
		 */
		goPlug(plugNo) {
			var url = '/?ctrl=cont/plugV2/index&plug_no=' + plugNo;
			if (!subWin) location.href = url;
			else closeWinAll({ callFunc: 'function(){ location.href="' + url + '"; }' });
		},

		/**
		 * 내용 더보기 버튼 활성화(list dom 렌더링 후 엘리먼트 높이 비교)
		 */
		titleContsArea() {
			this.$nextTick(function () {
				var vm = this;
				var wrap = vm.$el.querySelector('.talk__main_cont_wrap');
				var simple = wrap.querySelector('.talk__main_cont');
				if (!simple.classList.contains('simple')) simple.classList.add('simple');
				setTimeout(function () {
					var simpleH = simple.offsetHeight;
					var contH = simple.querySelector('.talk__main_content').offsetHeight;
					vm.row.v.titleContsMore = contH > simpleH;
				}, 0);
			});
		},

		/**
		 * 구인구직 컨텐츠 컨트롤
		 */
		job() {
			var vm = this;
			var fn = vm.job;
			var clipboard = null;
			/** 급여출력 */
			fn.getPay = function (_slct, _price) {
				var slctVal = _slct || __vars.payInfo[0].value;
				var paySlct = _.find(__vars.payInfo, function (_pay) {
					return _pay.value === slctVal;
				});
				return slctVal === 'n'
					? '￦ 협의후 결정'
					: paySlct.text + ' ￦ ' + vm.setComma(_price);
			};
			/** 구인/구직종류 출력 */
			fn.getJob = function (_talkMclss) {
				var talkMclss = _talkMclss || '4';
				var result = _.find(__vars.jobInfo, function (_job) {
					return _job.value === talkMclss;
				});
				return result.text;
			};
			/** 요일출력 */
			fn.getWeek = function (_weekYn, _weekSlct) {
				if (_weekYn === 'y' || !_weekSlct) {
					return '근무요일 협의';
				}

				var arWeekSlct = _weekSlct.split(',').sort();
				var result = [];
				for (var i = 0; i < arWeekSlct.length; i++) {
					for (var j = 0; j < __vars.weekInfo.length; j++) {
						if (__vars.weekInfo[j].value === arWeekSlct[i]) {
							result.push(__vars.weekInfo[j].text);
						}
					}
				}

				return result.join(',');
			};
			/** 요일출력 */
			fn.getTime = function (_timeYn, _startTime, _endTime) {
				if (_timeYn === 'y' || (!_startTime && !_endTime)) {
					return '근무시간 협의';
				}
				return _startTime + '~' + _endTime;
			};
			/** 지역출력 */
			fn.getLoc = function (_param) {
				var op = _.has(_param, 'op') ? _param.op : '/';
				if (!_param.loc1) return '전국';
				var pdLocInfo = vm.locInfo[_param.loc1];
				if (_param.loc2) pdLocInfo += op + ' ' + vm.locInfo[_param.loc2];
				if (_param.loc3) pdLocInfo += op + ' ' + vm.locInfo[_param.loc3];
				return pdLocInfo;
			};
			/** 전화문의 클릭 */
			fn.onPhoneCall = function (_phoneNumber) {
				if (!_phoneNumber) {
					ui.toast('정상적인 연락처가 아닙니다.');
					return;
				}
				$.gapCall({ cmd: 'phoneCall', data: { phoneNumber: _phoneNumber } });
			};

			(function () {
				/** 전화문의(구버전 대응) */
				window.fail_phoneCall = function () {
					if ($.isApp()) {
						if (clipboard === null) {
							/** 구버전 대응(클립보드에 번호복사) */
							clipboard = new ClipboardJS('.talk__clipboard_phone_call');
							clipboard.on('success', function () {
								ui.toast('전화번호가 복사되었습니다.');
							});
							ui.toast(
								'현재버전에서는 전화걸기가 지원되지 않습니다.<br>다시한번 클릭하시면 클립보드에 번호가 복사됩니다.'
							);
						}
					} else {
						ui.alert(
							'전화문의는 앱에서만 가능합니다.<br>확인 버튼을 터치하시면<br><br>다운로드 화면으로 이동합니다.',
							{
								done() {
									$.goGooglePlay();
								}
							}
						);
					}
				};
			})();
		},

		/**
		 * 게시글 컨텐츠 컨트롤
		 */
		on() {
			var vm = this;
			var fn = vm.on;
			/**
			 * 미디어(image/video) 이벤트 바인딩
			 * @private
			 */
			var _mediaEvent = function () {
				var photoInfo = vm.row.v.photo_info[vm.swiper.activeIndex];
				if (typeof vm.swiper.activeIndex !== 'number' || !photoInfo || photoInfo.active) {
					return;
				}
				photoInfo.active = true;

				var media = vm.swiper.el.querySelectorAll(
					'.swiper-slide-active video.swiper-lazy,.swiper-slide-active img.swiper-lazy'
				)[0];
				var aniWrap = media.parentElement.querySelector('.talk__load_animation_wrap');
				var button = media.parentElement.querySelectorAll('button');
				var playBtn = button[0];
				var muteBtn = button[1];
				if (photoInfo.error) {
					if (playBtn) playBtn.remove();
					if (muteBtn) muteBtn.remove();
					if (aniWrap) aniWrap.remove();
					return;
				}

				/** video 일때 이벤트 바인딩 */
				if (media.tagName === 'VIDEO') {
					/** 50% 보일때(동영상 재생시도) */
					new IntersectionObserver(
						function (entries) {
							entries.forEach(function (entry) {
								if (!entry.isIntersecting) return;

								/** 재생가능한 일시정지된 동영상이 보이면 재생 */
								if (media.readyState > 2 && media.paused) {
									vueBus.$emit('talkProc', 'play', {
										video: media,
										playBtn,
										swiper: vm.swiper,
										row: vm.row.v
									});
								}

								/** 인코딩중 동영상일땐 동영상 다시 로드 */
								var _photoInfo = vm.row.v.photo_info[vm.swiper.activeIndex];
								if (_photoInfo.loadAction && !_photoInfo.error) {
									media.src = _photoInfo.file_nm;
								}
							});
						},
						{ threshold: 0.5 }
					).observe(media);

					/** 100% 안보일때(동영상 일시정지) */
					new IntersectionObserver(function (entries) {
						entries.forEach(function (entry) {
							if (entry.isIntersecting) return;
							if (!media.paused) media.pause();
						});
					}).observe(media);

					/** 에러 일때 */
					media.addEventListener('error', function () {
						var _photoInfo = vm.row.v.photo_info[vm.swiper.activeIndex];
						if (!_photoInfo.active || _photoInfo.error) return;

						/** 인코딩 안된 동영상 주소 가져오기 시도 */
						var src = ui.videoUrl('talk', _photoInfo.file_enc) || '';
						if (src !== '') {
							/** 인코딩 완료 동영상 다시 로드 */
							media.src = src;
							media.poster = _photoInfo.mov_img_name.replace('&parent=tmp', '');
							_photoInfo.loadAction = false;
							aniWrap.remove();
						} else {
							/**
							 * 에러 동영상(file_enc값이 없음) 이거나
							 * 인코딩목록 등록후 10초가 지났으면 에러로 판단(시간조정 필요할 수 있음)
							 */
							if (
								!_photoInfo.file_enc ||
								+new Date() - Number(_photoInfo.file_time) > 10 * 1000
							) {
								_photoInfo.error = true;
								_photoInfo.loadAction = false;
								playBtn.classList.add('hidden');
								muteBtn.classList.add('hidden');
								aniWrap.remove();
								media.poster =
									'https://image.club5678.com/imgs/mobile/main_renewal/img/img_talk_bg_novideo.png';
								return;
							}

							/** 인코딩중 로띠 애니메이션 */
							if (_photoInfo.loadAction) return;
							_photoInfo.loadAction = true;
							aniWrap.classList.remove('hidden');
							var opt = {
								container: aniWrap.querySelector('.talk__load_animation'),
								animationData: vm.row.aniData.load
							};
							if (!vm.row.aniData.load) {
								opt.path =
									'https://image.club5678.com/imgs/club_lottie_interaction/common/loading.json';
							}
							_photoInfo.loadAction = lottie.loadAnimation(opt);
							_photoInfo.loadAction.addEventListener('DOMLoaded', function () {
								if (!vm.row.aniData.load) {
									vueBus.$emit('talkProc', 'setAniData', {
										load: _photoInfo.loadAction.animationData
									});
								}
							});
						}
					});

					/** 재생버튼 클릭 일때 */
					playBtn.addEventListener('click', function () {
						media.click();
					});

					/** 음소거버튼 클릭 일때 */
					muteBtn.addEventListener('click', function () {
						media.muted = !media.muted;
					});

					/** 상태가 재생가능 일때 */
					media.addEventListener('canplay', function () {
						vueBus.$emit('talkProc', 'play', {
							video: media,
							playBtn,
							swiper: vm.swiper,
							row: vm.row.v
						});
					});

					/** 재생시작 일때 */
					media.addEventListener('play', function () {
						playBtn.classList.add('hidden');
						muteBtn.classList.remove('hidden');
					});

					/** 일시정지 일때 */
					media.addEventListener('pause', function () {
						playBtn.classList.remove('hidden');
						muteBtn.classList.add('hidden');
					});

					/** 볼륨조절(음소거) 일때 */
					media.addEventListener('volumechange', function () {
						if (!media.muted) {
							muteBtn.classList.remove('talk_video__btn_unmute');
							muteBtn.classList.add('talk_video__btn_mute');
						} else {
							muteBtn.classList.remove('talk_video__btn_mute');
							muteBtn.classList.add('talk_video__btn_unmute');
						}
					});
				}

				/** video/image 클릭 일때 */
				media.addEventListener('click', function () {
					var _photoInfo = vm.row.v.photo_info[vm.swiper.activeIndex];
					if (_photoInfo.error) return;
					if (vm.row.playing && !vm.row.playing.paused) vm.row.playing.pause();

					var data = {
						type: 'talk',
						plugNo: vm.row.v.mem_no,
						talkNo: vm.row.v.talk_no,
						memNo: vm.memNo,
						moveIndex: vm.swiper.activeIndex,
						currentTime: media.tagName === 'VIDEO' ? parseInt(media.currentTime) : 0
					};
					data = _.map(data, function (value, key) {
						return '' + key + '=' + value;
					}).join('&');
					openWin('/?ctrl=cont/photoViewer/profilePhotoViewer&' + data);
				});
			};

			/**
			 * 게시글 virtual slides 생성
			 */
			fn.virtualData = function () {
				vm.swiper.virtual.removeAllSlides();
				vm.swiper.virtual.slides = _.map(vm.row.v.photo_info, function (v, i) {
					var html = '';
					var autoplay =
						vm.row.v.talk_slct !== 'e' && vm.device && vm.device.code === 'ios'
							? ' autoplay'
							: '';
					if (v.file_slct === 'p') {
						html += '<div class="talk__photo_wrap">\n';
						html +=
							'	<img class="swiper-lazy" src="' +
							vm.spinner +
							'" data-src="' +
							v.file_nm +
							"\" onerror=\"vueBus.$emit('talkProc','talkNoImg',{el:this,i:" +
							vm.row.i +
							',fi:' +
							i +
							'})">\n';
						html += '</div>\n';
					} else {
						html += '<div class="talk__video_wrap">\n';
						html +=
							'	<video preload="metadata"' +
							autoplay +
							' playsinline muted class="swiper-lazy" data-src="' +
							v.file_nm +
							'" poster="' +
							v.mov_img_name +
							'">\n';
						html +=
							'		<source class="swiper-lazy" data-src="' +
							v.file_nm +
							'" type="video/mp4">\n';
						html += '	</video>\n';
						html += '	<div class="talk_video_controls">\n';
						html += '		<button class="talk_video__btn_play">play</button>\n';
						html += '		<button class="talk_video__btn_unmute hidden">mute</button>\n';
						html += '	</div>\n';
						html += '	<div class="talk__load_animation_wrap hidden">\n';
						html += '		<div class="talk__load_animation"></div>\n';
						html += '		<span class="talk__load_animation_txt">인코딩중...</span>\n';
						html += '	</div>\n';
						if (v.bad_yn === 'y') {
							html += '<div class="img_blackout"></div>';
						}
						html += '</div>\n';
					}
					return html;
				});
				vm.swiper.virtual.update();

				/** 첫번째 slide의 이벤트 바인딩 */
				vm.$nextTick(function () {
					_mediaEvent();
				});
			};

			/**
			 * 게시글 더보기 컨트롤 객체
			 */
			fn.talkMore = {
				click(v) {
					v.isShowMore = true;
					backButtonAction.register(function () {
						v.isShowMore = false;
					});
				} /** 더보기 레이어 열기 */,
				modify(v) {
					history.back();
					backButtonAction.callback(function () {
						vueBus.$emit('talkProc', 'write', v);
					});
				} /** 수정 클릭 */,
				delete(v) {
					history.back();
					backButtonAction.callback(function () {
						vueBus.$emit('talkProc', 'delete', v);
					});
				} /** 삭제 클릭 */,
				complete(v) {
					history.back();
					backButtonAction.callback(function () {
						vueBus.$emit('talkProc', 'complete', v);
					});
				} /** 거래완료 클릭 */,
				deleteByAdmin(v) {
					vueBus.$emit('talkProc', 'deleteByAdmin', v);
				} /** (관리자) 삭제하기 */,
				report(v) {
					vueBus.$emit('talkProc', 'report', v);
				} /** 신고하기 클릭 */,
				changeToWaiting(v, isWaiting) {
					ui.confirm((isWaiting ? '예약중으로' : '예약취소로') + ' 변경하시겠습니까?', {
						doneTxt: '확인',
						done() {
							var param = {
								mode: 'talkWaiting',
								memNo: v.mem_no,
								talkNo: v.talk_no,
								talkSlct: isWaiting ? 'b' : 'n'
							};

							/** ajax 처리결과 */
							$.ajax({
								type: 'post',
								dataType: 'json',
								data: param,
								url: '/cont/talkV2/ajax.proc.php',
								timeout: 5000
							})
								.fail(function () {
									history.back();
								})
								.done(function () {
									v.talk_slct = isWaiting ? 'b' : 'n';
									history.back();
									ui.toast(
										(isWaiting ? '예약중으로' : '예약취소로') + ' 변경되었습니다.'
									);
								});
						}
					});
				},
				pullUp(v) {
					var param = {
						mode: 'talkPullUp',
						memNo: v.mem_no,
						talkNo: v.talk_no
					};
					$.ajax({
						type: 'post',
						dataType: 'json',
						data: param,
						url: '/cont/talkV2/ajax.proc.php',
						timeout: 5000
					})
						.fail(function () {
							location.reload();
						})
						.done(function () {
							location.reload();
						});
				}
			};

			/**
			 * 내용 더보기 클릭
			 * @param e
			 */
			fn.titleContsMore = function (e) {
				e.target.parentElement
					.querySelector('.talk__main_cont')
					.classList.remove('simple');
				vm.row.v.titleContsMore = false;
			};

			/**
			 * 댓글 더보기 클릭(댓글 레이어)
			 * @param v
			 */
			fn.tailMore = function (v) {
				if (vm.row.playing && !vm.row.playing.paused) vm.row.playing.pause();
				openWin(
					'/?ctrl=cont/talk/index&mode=talkTail&memNo=' +
						v.mem_no +
						'&talkNo=' +
						v.talk_no
				);
			};

			/**
			 * 추천 애니메이션 효과 실행
			 * @private
			 */
			var _setRcmd = function () {
				if (!vm.row.v.photo_info) return;
				vm.row.v.isShowRcmd = true;
				if (!vm.row.v.rcmdAction || !vm.row.v.rcmdAction.animationData) {
					var opt = {
						container: vm.$el.querySelector('.talk__like_animation'),
						loop: 0,
						animationData: vm.row.aniData.rcmd
					};
					if (!vm.row.aniData.rcmd) {
						opt.path =
							'https://image.club5678.com/imgs/club_lottie_interaction/talk_and_talk/like.json';
					}
					vm.row.v.rcmdAction = lottie.loadAnimation(opt);
					vm.row.v.rcmdAction.addEventListener('complete', function () {
						if (!vm.row.aniData.rcmd) {
							vueBus.$emit('talkProc', 'setAniData', {
								rcmd: vm.row.v.rcmdAction.animationData
							});
						}
						vm.row.v.isShowRcmd = false;
					});
				} else {
					vm.row.v.rcmdAction.playSegments([0, 40], true);
				}
			};

			/**
			 * 추천하기(엄지척) 클릭
			 */
			fn.setRcmd = function () {
				if (vm.row.v.isShowRcmd) return;
				var data = {
					mode: 'rcmd',
					memNo: vm.row.v.mem_no,
					talkNo: vm.row.v.talk_no,
					rcmd: vm.row.v.rcmd_yn === 'y' ? 'n' : 'y'
				};

				/** ajax 처리결과 */
				$.ajax({
					type: 'post',
					dataType: 'json',
					data,
					url: '/cont/talkV2/ajax.proc.php',
					timeout: 5000
				})
					.fail(function (xhr) {
						console.error(xhr);
					})
					.done(function (res) {
						if (!res.retdata) return;
						vm.row.v.rcmd_cnt = res.retdata.rcmd_cnt;
						vm.row.v.rcmd_yn = res.retdata.rcmd_yn;
						if (res.retdata.rcmd_yn === 'y') _setRcmd();
					});
			};

			/**
			 * 목록으로 클릭
			 */
			fn.goTalkList = function () {
				if (vm.queryString.isCateOpen) {
					sessionStorage.sale = JSON.stringify({ cateKey: vm.row.v.cate.k });
				}
				location.href = '/?ctrl=cont/talk/index';
			};

			fn.toService = function () {
				var contName =
					vm.row.adSrc[vm.memSex === 'm' ? (vm.row.i % 4) % 2 : (vm.row.i % 4) % 3]
						.service;
				location.href = '/?ctrl=cont/' + contName + '/index';
			};

			(function () {
				/**
				 * 게시글이 화면에 노출됐을때만
				 * - swiper 이벤트 설정
				 */
				vm.$nextTick(function () {
					new IntersectionObserver(function (entries) {
						entries.forEach(function (entry) {
							if (!entry.isIntersecting) {
								entry.target.style.visibility = 'hidden';
								return;
							}
							entry.target.style.visibility = '';

							if (!vm.row.v.photo_info || !vm.swiper || vm.row.v.swiperActive) return;
							vm.row.v.swiperActive = true; /** swiper 활성화 처리 */

							/** swiper 가상데이터 생성 */
							fn.virtualData();

							/** slide가 처음 노출됐을때 image/video 이벤트 바인딩 */
							vm.swiper.on('transitionEnd', _mediaEvent);
						});
					}).observe(vm.$el);
				});

				/** 내용 더보기 버튼 활성화(list dom 렌더링 후 엘리먼트 높이 비교) */
				vm.titleContsArea();
			})();
		}
	},

	template: '#c-talk-conts'
};
</script>
