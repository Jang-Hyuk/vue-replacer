var talkList = null;
$(function () {
	/**
	 * 톡앤톡 메인리스트 Vue
	 */
	talkList = new Vue({
		el: '#talkWrap',
		name: 'TalkWrap',
		data: {
			cate: __vars.cate || [],
			isAll: true,
			isMine: false,
			publMemNo: '',
			sessTalk: sessionStorage.talk ? JSON.parse(sessionStorage.talk) : null,
			sessSale: sessionStorage.sale ? JSON.parse(sessionStorage.sale) : null,
			paging: false,
			pageInfo: {},
			cateKey: __slctCate || 0,
			sex: '',
			loc: '',
			locTxt: '',
			pageNo: 1,
			rows: [],
			isShow: false,
			playing: null,
			aniData: {
				rcmd: null,
				load: null
			},
			isSelectedPageLoaded: false,
			isShowWriteLayer: false,
			talkHeadMenu: [
				{ key: 0, value: 'talk' },
				{ key: 1, value: 'talk' },
				{ key: 5, value: 'talk' },
				{ key: 4, value: 'market' },
				{ key: 8, value: 'job' }
			],
			showAd: true,
			adInfo: {}
		},
		computed: {
			/** 회원번호 */
			memNo: function () {
				return $.cookie('gCCV:NO');
			},

			/** 회원성별 */
			memSex: function () {
				return $.cookie('gCCV:SEX');
			},

			/** 디바이스 정보(return false 이면 앱이 아님) */
			device: function () {
				return func.deviceCode();
			},

			/** GET 파라미터 정보 */
			urlparam: function () {
				return getUrlVars();
			},

			/** 내 글보기/전체보기 버튼 text */
			myButton: function () {
				return !this.isAll ? '전체보기' : '내 글보기';
			},

			/**
			 * 페이지네이션
			 * @returns {{next: number, prev: number, page: *[]}}
			 */
			pagination: function () {
				var vm = this;
				var p = vm.pageInfo;
				var rtn = { page: [], prev: 0, next: 0 };
				if (p && p.cnt > 0) {
					var total =
						_.floor(p.cnt / p.pagePerCnt) + (p.cnt % p.pagePerCnt === 0 ? 0 : 1);
					var start = _.floor((p.pageNo - 1) / p.pagingCnt) * p.pagingCnt + 1;
					var end = start + p.pagingCnt - 1;
					rtn.prev = start - 1;
					if (total <= end) end = total;
					for (var i = start; i <= end; i++) rtn.page.push(i);
					if (end < total) rtn.next = end + 1;
				}
				return rtn;
			}
		},
		mounted: function () {
			var vm = this;
			vm.on();
			vm.on.setAdInfo();
		},
		beforeUpdate: function () {
			var vm = this;
			vm.on.setAdInfo();
		},
		methods: {
			/**
			 * 톡앤톡 메인 컨트롤
			 */
			on: function () {
				var vm = this;
				var fn = vm.on;
				/**
				 * 동영상/사진 정보 생성
				 * @param photoInfo
				 * @returns {*}
				 * @private
				 */
				var _photoInfo = function (photoInfo) {
					return _.forEach(photoInfo, function (fv) {
						fv.active = false; /** swiper slide 활성화여부 */
						fv.error = false; /** img/video tag error 여부 */
						if (fv.file_slct === 'v') {
							if (!fv.file_enc && !fv.file_nm && !fv.file_time) {
								fv.error = true;
							} /** 에러 동영상 */
							fv.loadAction = null; /** 인코딩중 애니네이션 객체 */
						}
					});
				};

				/**
				 * 게시글목록 가져오기
				 * @returns {*}
				 * @private
				 */
				var _getRows = function () {
					vm.rows = [];
					var data = {
						mode: 'talkList',
						memNo: vm.publMemNo,
						talkLclss: vm.cate[vm.cateKey].talkLclss,
						talkMclss: vm.cate[vm.cateKey].talkMclss,
						sex: vm.sex,
						loc: vm.loc,
						tDate: +new Date(),
						pageNo: vm.pageNo,
						pagePerCnt: 22
					};
					return $.ajax({
						type: 'post',
						dataType: 'json',
						data: data,
						url: '/cont/talkV2/ajax.proc.php',
						timeout: 5000,
						cache: false
					}).fail(function (xhr) {
						console.error(xhr);
					});
				};

				/**
				 * 게시글목록 가져오기 성공 콜백
				 * @param _res
				 * @private
				 */
				var _getRowsDone = function (_res) {
					try {
						vm.rows = [];
						vm.$nextTick(function () {
							_.forEach(_res.retdata.rows, function (v) {
								v.cate = _.find(vm.cate, {
									talkLclss: v.talk_lclss,
									talkMclss: v.talk_mclss
								}) || { k: 1, talkLclss: '1', talkMclss: '0', t: '일상' };
								v.key = v.mem_no + '_' + v.talk_no; /** 유니크 키값 */
								v.tail_data = _.sortBy(
									v.tail_data,
									'auto_no'
								).reverse(); /** 댓글데이터 역순정렬 */
								v.title_conts = _.trimEnd(v.title_conts);
								v.titleContsMore = false; /** 내용더보기 활성화여부 */
								v.rcmdAction = null; /** 추천 애니메이션 객체 */
								v.isShowRcmd = false; /** 추천버튼 상태 */
								v.isShowMore = false; /** 더보기 레이어 노출여부 */
								v.swiperActive = false; /** swiper 활성화여부 */
								v.swiperUpdate = 0;
								v.photo_info = _photoInfo(v.photo_info);
								vm.rows.push(v);
							});

							if (vm.rows.length > 4) {
								vm.addSlotToAdv(vm.rows, 4, 8);
							}

							vm.paging = true;
							vm.pageInfo = _res.retdata.pageInfo;

							/** 스크롤 이동 */
							vm.$nextTick(_scrollToSelectedTalk);
						});
					} catch (e) {
						console.error('get list error');
					}
				};

				/**
				 * 게시글로 스크롤이동
				 * TYPE_NAVIGATE(첫진입),TYPE_RELOAD(새로고침),TYPE_BACK_FORWARD(뒤로가기로 진입)
				 */
				var _scrollToSelectedTalk = function () {
					if (performance.navigation.type) {
						/** TYPE_RELOAD(새로고침),TYPE_BACK_FORWARD(뒤로가기로 진입) 일때 */
						if (vm.sessTalk) {
							window.scrollTo(0, vm.sessTalk.scroll);
						}
					} else {
						/** TYPE_NAVIGATE(첫진입) 일때 */
						if (vm.urlparam.selNo && !vm.isSelectedPageLoaded) {
							setTimeout(function () {
								var selEl = _.find(vm.$children, {
									row: { v: { talk_no: vm.urlparam.selNo } }
								}).$el;
								var fixedEl = vm.$refs.cate.parentElement;
								var selElTop = selEl.offsetTop;
								var fixedElTop = fixedEl.offsetTop + fixedEl.offsetHeight;
								$('html').animate({ scrollTop: selElTop - fixedElTop }, 400);
								vm.isSelectedPageLoaded = true;
							}, 300);
						}
					}

					/** 플러그에서 왔을때 */
					sessionStorage.removeItem('talk');
					vm.sessTalk = null;

					/** 팔아요탭 열기용 */
					sessionStorage.removeItem('sale');
					vm.sessSale = null;
				};

				/**
				 * 페이징 페이지이동
				 * @param pageNo
				 * @param cateKey
				 */
				fn.movePage = function (pageNo, cateKey) {
					vm.pageNo = pageNo || 1;
					vm.cateKey = cateKey || 0;

					/** 팔아요 / 삽니다 통합 */
					var isBuyOrSell = _.some([2, 3], function (key) {
						return key === vm.cateKey;
					});
					if (isBuyOrSell) vm.cateKey = 4;

					/** cate 선택 및 스크롤이동 */
					var cateEl = vm.$refs.cate.querySelectorAll('input.talk__cate_opt')[vm.cateKey];
					vm.$refs.cate.parentElement.scrollTo(cateEl.parentElement.offsetLeft, 0);
					cateEl.checked = true;

					/** 헤더메뉴 설정 */
					vueBus.$emit('setFloatMenu', {
						cmd: 'off',
						key: _.find(vm.talkHeadMenu, { key: parseInt(vm.cateKey) }).value,
						shadow: false
					});

					vm.isShow = false;
					_getRows()
						.done(_getRowsDone)
						.always(function () {
							vm.isShow = true;
						});
				};

				/**
				 * 내 글보기/전체보기 토글
				 */
				fn.toggleList = function () {
					vm.isAll = !vm.isAll;
					if (!vm.isAll) {
						vm.sex = '';
						vm.loc = '';
						vm.locTxt = '';
					}
					vm.isMine = !vm.isMine;
					vm.publMemNo = !vm.isAll ? vm.memNo : '';
					vm.showAd = !vm.showAd;
					fn.movePage();
				};

				/**
				 * 메뉴 플로팅 (기존 모듈에서 jQuery 코드 가져옴)
				 */
				fn.onMoveTalk = function (cate) {
					history.back();
					setTimeout(function () {
						vueBus.$emit('talkProc', 'write', { cate: { k: cate } });
					}, 10);
				};

				/**
				 * 글쓰기 버튼 활성화 / 비활성화
				 */
				fn.onWriteBtn = function () {
					var talkBtnWrap = document.querySelector('.talk_btn__wrap');
					var talkWriteLayer = document.querySelector('.talk_write_layer');
					talkBtnWrap.style.opacity = '1';
					talkWriteLayer.classList.add('layer_animate');
					vm.$refs.writeBtn.classList.add('hidden');
					vm.isShowWriteLayer = true;
					backButtonAction.register(function () {
						talkBtnWrap.style.opacity = '0';
						talkWriteLayer.classList.remove('layer_animate');
						vm.$refs.writeBtn.classList.remove('hidden');
						vm.isShowWriteLayer = false;
					});
				};

				/**
				 * 게시글 컨트롤
				 * @private
				 */
				var _talkProcess = {
					/** 글등록 */
					write: function (v) {
						var cate =
							v && v.cate
								? v.cate.k
								: vm.$refs.cate.querySelector('input.talk__cate_opt:checked').value;
						var talkNo = v && v.talk_no ? v.talk_no : '';
						var url = '/?ctrl=cont/talk/index&mode=talkWrite&cate=';
						cate = cate === '0' ? '1' : cate;

						if (cate === '4') {
							cate = 2;
						}

						if (vm.playing && !vm.playing.paused) vm.playing.pause();
						openWin(url + cate + (talkNo ? '&talkNo=' + talkNo : ''));
					},

					/** 글삭제 */
					delete: function (v, callback) {
						// 삭제 후 콜백이 있다면 관리자가 한 것으로 판단
						var isAdmin = typeof callback === 'function';
						ui.confirm('정말 삭제하시겠습니까?', {
							doneTxt: '삭제',
							done: function () {
								var data = {
									mode: 'talkDelete',
									talkNo: v.talk_no,
									memNo: v.mem_no,
									isAdmin: isAdmin
								};
								$.ajax({
									type: 'post',
									dataType: 'json',
									data: data,
									url: '/cont/talkV2/ajax.proc.php',
									timeout: 5000
								})
									.done(function (_res) {
										if (!_res || _res.retcode !== '1') return ui.toast('삭제 실패');
										if (typeof __rows !== 'undefined') {
											/** 톡앤톡 게시글상세 일때 */
											goBack();
										} else {
											/** 톡앤톡 게시글목록 일때 */
											var idx = _.findIndex(vm.rows, { key: v.mem_no + '_' + v.talk_no });

											vm.rows.splice(idx, 1);

											isAdmin && callback();
										}
									})
									.fail(function (xhr) {
										console.error(xhr);
									});
							}
						});
					},

					/** (관리자 모드) 글삭제 */
					deleteByAdmin: function (item) {
						_talkProcess.delete(item, function () {
							var paramInfo = {
								memNo: item.mem_no,
								actMode: 'talkAdmin'
							};
							adminAct.adminStopWarn(cuBase.toPairs(paramInfo, '&', '='));
						});
					},

					/** 거래완료 */
					complete: function (v) {
						var clssTxt = v.talk_lclss === '4' ? '채용완료' : '거래완료';
						ui.confirm(clssTxt + ' 처리하시겠습니까?', {
							doneTxt: clssTxt,
							done: function () {
								var data = { mode: 'talkComplete', talkNo: v.talk_no };
								$.ajax({
									type: 'post',
									dataType: 'json',
									data: data,
									url: '/cont/talkV2/ajax.proc.php',
									timeout: 5000
								})
									.done(function (_res) {
										if (!_res || _res.retcode !== '1') return ui.toast(clssTxt + ' 실패');
										var idx = _.findIndex(vm.rows, { key: vm.memNo + '_' + v.talk_no });
										vm.rows[idx].talk_slct = 'e';
										ui.toast(clssTxt + ' 처리 되었습니다.');
									})
									.fail(function (xhr) {
										console.error(xhr);
									});
							}
						});
					},

					/** 신고하기 */
					report: function (v) {
						ui.confirm('신고 처리 하시겠습니까?', {
							doneTxt: '신고',
							done: function () {
								var data = {
									mode: 'talkReport',
									memNo: v.mem_no,
									talkNo: v.talk_no,
									rptConts: v.title_conts,
									rptFileData: v.photoInfoEnc,
									rptFileCnt: v.photo_cnt
								};
								$.ajax({
									type: 'post',
									dataType: 'json',
									data: data,
									url: '/cont/talkV2/ajax.proc.php',
									timeout: 5000
								})
									.done(function (_res) {
										if (!_res || _res.retcode !== '1') return ui.toast('신고 실패');
										ui.toast('신고처리 하였습니다.');
									})
									.fail(function (xhr) {
										console.error(xhr);
									});
							}
						});
					},

					/** 동영상 재생 */
					play: function (v) {
						if (v.row.talk_slct === 'e') {
							v.swiper.pagination.destroy();
							v.playBtn.classList.add('hidden');
							return;
						}
						if (vm.playing && vm.playing !== v.video) vm.playing.pause();
						v.video.muted = true;
						if (v.video.paused) v.video.play();
						vm.playing = v.video;
					},

					/** lottie 애니메이션 데이터 설정하기 */
					setAniData: function (v) {
						_.forEach(v, function (fv, fk) {
							vm.aniData[fk] = fv;
						});
					},

					/** 이미지 없음 처리 */
					talkNoImg: function (v) {
						v.el.src =
							'https://image.club5678.com/imgs/mobile/main_renewal/img/img_talk_bg_noimg.png';
						vm.rows[v.i].photo_info[v.fi].error = true;
					}
				};

				/**
				 * 게시글 cmd 별 프로세스
				 * @param cmd
				 * @param data
				 * @private
				 */
				var _talkProc = function (cmd, data) {
					_talkProcess[cmd](data);
				};

				/**
				 * 글 등록/수정 완료 콜백
				 * @private
				 */
				var _talkWriteCallback = function (res) {
					setTimeout(function () {
						if (res.retdata.process === 'regist') {
							/** 등록일때 목록 다시가져오기 */
							vm.cateKey = 0;
							vm.isAll = true;
							vm.isMine = false;
							vm.sex = '';
							vm.loc = '';
							vm.locTxt = '';
							vm.publMemNo = '';
							vm.rows = [];
							fn.movePage(1, vm.cateKey);
						} else {
							/** 수정일때 해당 게시글만 다시가져오기 */
							var data = { mode: 'talkConts', talkNo: res.retdata.talkNo };
							$.ajax({
								type: 'post',
								dataType: 'json',
								data: data,
								url: '/cont/talkV2/ajax.proc.php',
								timeout: 5000
							})
								.done(function (_res) {
									var idx = _.findIndex(vm.rows, { key: vm.memNo + '_' + data.talkNo });
									var row = vm.rows[idx];
									row.swiperActive = false;
									row.photo_cnt = _res.retdata.photo_cnt;
									row.photo_info = _photoInfo(_res.retdata.photo_info);
									row.product_name = _res.retdata.product_name;
									row.product_price = _res.retdata.product_price;
									row.mem_loc_1st = _res.retdata.mem_loc_1st;
									row.mem_loc_2nd = _res.retdata.mem_loc_2nd;
									row.mem_loc_3rd = _res.retdata.mem_loc_3rd;
									row.rcmd_cnt = _res.retdata.rcmd_cnt;
									row.rcmd_yn = _res.retdata.rcmd_yn;
									row.tail_cnt = _res.retdata.tail_cnt;
									row.title_conts = _.trimEnd(_res.retdata.title_conts);
									row.swiperUpdate++;

									if (_res.retdata.talk_lclss === '4') {
										row.pay_slct = _res.retdata.pay_slct;
										row.time_yn = _res.retdata.time_yn;
										row.start_time = _res.retdata.start_time;
										row.end_time = _res.retdata.end_time;
										row.talk_mclss = _res.retdata.talk_mclss;
										row.talk_phone = _res.retdata.talk_phone;
										row.week_slct = _res.retdata.week_slct;
										row.week_yn = _res.retdata.week_yn;
									}
								})
								.fail(function (xhr) {
									console.error(xhr);
								});
						}
					}, 600);
				};

				/**
				 * 댓글 페이지 리턴 후 댓글 갱신
				 * @param _data
				 * @private
				 */
				var _talkTailCallback = function (_data) {
					var data = {
						mode: 'talkTailList',
						memNo: _data.memNo,
						talkNo: _data.talkNo,
						type: '1',
						pageNo: 1
					};
					$.ajax({
						type: 'post',
						dataType: 'json',
						data: data,
						url: '/cont/talkV2/ajax.proc.php',
						timeout: 5000
					})
						.done(function (_res) {
							try {
								if (!_res.retdata.rows) return;
								var _rows = _.find(vm.rows, { key: _data.memNo + '_' + _data.talkNo });
								_rows.tail_data = _res.retdata.rows.splice(0, 2);
								_rows.tail_cnt = _res.retdata.totalCnt;
							} catch (e) {
								console.error('get list error');
							}
						})
						.fail(function (xhr) {
							console.error(xhr);
						});
				};

				/**
				 * 검색필터 열기
				 */
				fn.openFilter = function () {
					if (!vm.isAll) return ui.toast('검색은 전체보기 일때만 가능합니다.');
					var param = {
						data: {
							sex: vm.sex,
							loc: vm.loc
						},
						callback: function (_res) {
							vm.sex = _res.sex;
							vm.loc = _res.loc;
							vm.locTxt = _res.locTxt;
							fn.movePage();
						}
					};
					vueBus.$emit('openFilter', param);
				};

				/**
				 * 돋보기(검색) 버튼 클릭
				 */
				fn.search = function () {
					openWin('/?ctrl=cont/talk/index&mode=talkSearch');
				};

				/**
				 * 네이티브형 광고 이미지 순서 랜덤하게 로딩
				 */
				fn.setAdInfo = function () {
					var adRows = {
						ad_talk_1: {
							imgSrc: vm.memSex === 'm' ? 'bnr_talk_ad_m.png' : 'bnr_talk_ad_f.png',
							btnMsg: '빠른대화 하러가기',
							service: 'pmchat',
							adContent:
								vm.memSex === 'm'
									? [
											'영상과 채팅을 이용한 대화를 통해',
											'단 둘이서 마주보는 재미를 느껴요~!'
									  ]
									: [
											'이성과 대화하면서 시간도 보내고',
											'적립금도 받고 일석이조의 서비스 같아요~!'
									  ]
						},
						ad_talk_2: {
							// 미션 2배
							imgSrc: __missionAdImg,
							btnMsg: '빠른대화 하러가기',
							service: 'pmchat',
							adContent: [
								'대화만 했을뿐인데 적립금까지?',
								'안전하게 대화하고 적립금도 챙기세요!'
							]
						},
						ad_qmeet_1: {
							imgSrc: 'bnr_cm_qmeet_talktype.png',
							btnMsg: '빠른만남 하러가기',
							service: 'qmeet',
							adContent: '나와 가까운 이성회원을 만나는 가장 빠른 방법'
						}
					};

					if (vm.memSex === 'm') {
						adRows = _.omit(adRows, ['ad_talk_2']);
					}

					vm.adInfo = _.shuffle(adRows);
				};

				/** 초기 실행 */
				(function () {
					/** 헤더메뉴 설정 */
					vueBus.$emit(
						'setIoFloatMenu',
						vm.$refs.headerObserver,
						function (entry) {
							vm.$refs.talkCateScroll.classList[entry.isIntersecting ? 'remove' : 'add'](
								'on'
							);
							vueBus.$emit('setFloatMenu', {
								cmd: 'off',
								key: _.find(vm.talkHeadMenu, { key: parseInt(vm.cateKey) }).value,
								shadow: false
							});
						},
						{ rootMargin: '-166px' }
					);

					if (typeof __rows !== 'undefined') {
						/** 톡앤톡 게시글상세 일때 */
						_getRowsDone(__rows);
					} else {
						/** 톡앤톡 게시글목록 일때 */
						/** 초기 분류값 설정 */
						vm.cate.unshift({ k: 0, talkLclss: '0', talkMclss: '0', t: '전체' });

						/** 데이터 조회 관련 처리 */
						vm.$nextTick(function () {
							if (typeof __rows !== 'undefined') return;

							/** 메인에서 파라미터로 호출시 파라미터값으로 셋팅함 */
							if (vm.urlparam.cate) vm.cateKey = parseInt(vm.urlparam.cate); // cate 파라미터가 있을때 파라미터 값으로 셋팅 0:전체, 1:일상, 4:팔아요/삽니다, 5:광고/홍보, 8:구인/구직 code.talkV2에 정의
							if (vm.urlparam.pageNo) vm.pageNo = parseInt(vm.urlparam.pageNo); // pageNo 파라미터가 있을때 파라미터 값으로 셋팅

							/** 플러그에서 왔을때 */
							if (vm.sessTalk) {
								if (performance.navigation.type) {
									vm.cateKey = vm.sessTalk.cateKey;
									vm.pageNo = vm.sessTalk.pageNo;
									vm.sex = vm.sessTalk.sex;
									vm.loc = vm.sessTalk.loc;
									vm.locTxt = vm.sessTalk.locTxt;
								}
								if (performance.navigation.type === 0) {
									vm.publMemNo = vm.sessTalk.memNo || '';
								}
								if (performance.navigation.type >= 1) {
									vm.publMemNo = vm.sessTalk.publMemNo || '';
								}
								vm.isMine = vm.memNo === vm.publMemNo.toString();
								vm.isAll = !vm.publMemNo;
							}

							/** 팔아요탭 열기용 */
							if (vm.sessSale) {
								if (performance.navigation.type === 0) {
									vm.cateKey = vm.sessSale.cateKey;
									vm.pageNo = 1;
								}
							}

							/** 데이터 조회(백버튼 처리때문에 setTimeout 필요 - 분류탭오류) */
							setTimeout(function () {
								fn.movePage(vm.pageNo, vm.cateKey);
							}, 0);
						});

						/** 글쓰기 버튼 애니메이션 */
						new IntersectionObserver(
							function (entries) {
								entries.forEach(function (entry) {
									var cmd = 'add';
									if (!vm.rows.length) return;
									if (!entry.isIntersecting) cmd = 'remove';
									vm.$refs.writeBtn.classList[cmd]('on');
								});
							},
							{ rootMargin: '-96px 0px 0px 0px' }
						).observe(vm.$refs.pageNation);

						/** 끌어서 새로고침 처리 */
						p2refresh.onRefresh = function () {
							fn.movePage(vm.pageNo, vm.cateKey);
						};

						/** 스크롤 유지용 세션스토리지 */
						window.addEventListener('unload', function () {
							sessionStorage.talk = JSON.stringify({
								scroll: window.scrollY,
								sex: vm.sex,
								loc: vm.loc,
								locTxt: vm.locTxt,
								cateKey: vm.cateKey || 0,
								pageNo: vm.pageNo || 1,
								publMemNo: vm.publMemNo
							});
						});
					}

					vueBus.$on('talkProc', _talkProc); /** 게시글 cmd 별 프로세스 */
					vueBus.$on('talkWriteCallback', _talkWriteCallback); /** 글쓰기 완료 콜백 */
					vueBus.$on(
						'talkTailCallback',
						_talkTailCallback
					); /** 댓글 페이지 리턴 후 댓글 갱신 */
				})();
			},

			/**
			 * 리스트 중간에 광고 노출 추가
			 * @param list 기존 array
			 * @param init 첫 광고 노출 index
			 * @param interval 첫 광고 이후 노출되야할 index 간격
			 *
			 * init과 interval을 기준으로 광고가 노출되어야 할 자리에 더미데이터 삽입, 이후 광고로 바꿔주기 위함
			 */
			addSlotToAdv: function (list, init, interval) {
				list.splice(init, 0, list[init - 1]);

				var count = 0;
				var countMax = parseInt((list.length - init) / (interval + 1));

				while (count < countMax) {
					count += 1;
					list.splice(
						init + (interval + 1) * count,
						0,
						list[init + (interval + 1) * count - 1]
					);
				}
			}
		}
	});
});
