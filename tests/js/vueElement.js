var talkList = null;
$(function () {
	/**
	 * ����� ���θ���Ʈ Vue
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
			/** ȸ����ȣ */
			memNo: function () {
				return $.cookie('gCCV:NO');
			},

			/** ȸ������ */
			memSex: function () {
				return $.cookie('gCCV:SEX');
			},

			/** ����̽� ����(return false �̸� ���� �ƴ�) */
			device: function () {
				return func.deviceCode();
			},

			/** GET �Ķ���� ���� */
			urlparam: function () {
				return getUrlVars();
			},

			/** �� �ۺ���/��ü���� ��ư text */
			myButton: function () {
				return !this.isAll ? '��ü����' : '�� �ۺ���';
			},

			/**
			 * ���������̼�
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
			 * ����� ���� ��Ʈ��
			 */
			on: function () {
				var vm = this;
				var fn = vm.on;
				/**
				 * ������/���� ���� ����
				 * @param photoInfo
				 * @returns {*}
				 * @private
				 */
				var _photoInfo = function (photoInfo) {
					return _.forEach(photoInfo, function (fv) {
						fv.active = false; /** swiper slide Ȱ��ȭ���� */
						fv.error = false; /** img/video tag error ���� */
						if (fv.file_slct === 'v') {
							if (!fv.file_enc && !fv.file_nm && !fv.file_time) {
								fv.error = true;
							} /** ���� ������ */
							fv.loadAction = null; /** ���ڵ��� �ִϳ��̼� ��ü */
						}
					});
				};

				/**
				 * �Խñ۸�� ��������
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
				 * �Խñ۸�� �������� ���� �ݹ�
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
								}) || { k: 1, talkLclss: '1', talkMclss: '0', t: '�ϻ�' };
								v.key = v.mem_no + '_' + v.talk_no; /** ����ũ Ű�� */
								v.tail_data = _.sortBy(
									v.tail_data,
									'auto_no'
								).reverse(); /** ��۵����� �������� */
								v.title_conts = _.trimEnd(v.title_conts);
								v.titleContsMore = false; /** ��������� Ȱ��ȭ���� */
								v.rcmdAction = null; /** ��õ �ִϸ��̼� ��ü */
								v.isShowRcmd = false; /** ��õ��ư ���� */
								v.isShowMore = false; /** ������ ���̾� ���⿩�� */
								v.swiperActive = false; /** swiper Ȱ��ȭ���� */
								v.swiperUpdate = 0;
								v.photo_info = _photoInfo(v.photo_info);
								vm.rows.push(v);
							});

							if (vm.rows.length > 4) {
								vm.addSlotToAdv(vm.rows, 4, 8);
							}

							vm.paging = true;
							vm.pageInfo = _res.retdata.pageInfo;

							/** ��ũ�� �̵� */
							vm.$nextTick(_scrollToSelectedTalk);
						});
					} catch (e) {
						console.error('get list error');
					}
				};

				/**
				 * �Խñ۷� ��ũ���̵�
				 * TYPE_NAVIGATE(ù����),TYPE_RELOAD(���ΰ�ħ),TYPE_BACK_FORWARD(�ڷΰ���� ����)
				 */
				var _scrollToSelectedTalk = function () {
					if (performance.navigation.type) {
						/** TYPE_RELOAD(���ΰ�ħ),TYPE_BACK_FORWARD(�ڷΰ���� ����) �϶� */
						if (vm.sessTalk) {
							window.scrollTo(0, vm.sessTalk.scroll);
						}
					} else {
						/** TYPE_NAVIGATE(ù����) �϶� */
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

					/** �÷��׿��� ������ */
					sessionStorage.removeItem('talk');
					vm.sessTalk = null;

					/** �Ⱦƿ��� ����� */
					sessionStorage.removeItem('sale');
					vm.sessSale = null;
				};

				/**
				 * ����¡ �������̵�
				 * @param pageNo
				 * @param cateKey
				 */
				fn.movePage = function (pageNo, cateKey) {
					vm.pageNo = pageNo || 1;
					vm.cateKey = cateKey || 0;

					/** �Ⱦƿ� / ��ϴ� ���� */
					var isBuyOrSell = _.some([2, 3], function (key) {
						return key === vm.cateKey;
					});
					if (isBuyOrSell) vm.cateKey = 4;

					/** cate ���� �� ��ũ���̵� */
					var cateEl = vm.$refs.cate.querySelectorAll('input.talk__cate_opt')[vm.cateKey];
					vm.$refs.cate.parentElement.scrollTo(cateEl.parentElement.offsetLeft, 0);
					cateEl.checked = true;

					/** ����޴� ���� */
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
				 * �� �ۺ���/��ü���� ���
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
				 * �޴� �÷��� (���� ��⿡�� jQuery �ڵ� ������)
				 */
				fn.onMoveTalk = function (cate) {
					history.back();
					setTimeout(function () {
						vueBus.$emit('talkProc', 'write', { cate: { k: cate } });
					}, 10);
				};

				/**
				 * �۾��� ��ư Ȱ��ȭ / ��Ȱ��ȭ
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
				 * �Խñ� ��Ʈ��
				 * @private
				 */
				var _talkProcess = {
					/** �۵�� */
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

					/** �ۻ��� */
					delete: function (v, callback) {
						// ���� �� �ݹ��� �ִٸ� �����ڰ� �� ������ �Ǵ�
						var isAdmin = typeof callback === 'function';
						ui.confirm('���� �����Ͻðڽ��ϱ�?', {
							doneTxt: '����',
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
										if (!_res || _res.retcode !== '1') return ui.toast('���� ����');
										if (typeof __rows !== 'undefined') {
											/** ����� �Խñۻ� �϶� */
											goBack();
										} else {
											/** ����� �Խñ۸�� �϶� */
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

					/** (������ ���) �ۻ��� */
					deleteByAdmin: function (item) {
						_talkProcess.delete(item, function () {
							var paramInfo = {
								memNo: item.mem_no,
								actMode: 'talkAdmin'
							};
							adminAct.adminStopWarn(cuBase.toPairs(paramInfo, '&', '='));
						});
					},

					/** �ŷ��Ϸ� */
					complete: function (v) {
						var clssTxt = v.talk_lclss === '4' ? 'ä��Ϸ�' : '�ŷ��Ϸ�';
						ui.confirm(clssTxt + ' ó���Ͻðڽ��ϱ�?', {
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
										if (!_res || _res.retcode !== '1') return ui.toast(clssTxt + ' ����');
										var idx = _.findIndex(vm.rows, { key: vm.memNo + '_' + v.talk_no });
										vm.rows[idx].talk_slct = 'e';
										ui.toast(clssTxt + ' ó�� �Ǿ����ϴ�.');
									})
									.fail(function (xhr) {
										console.error(xhr);
									});
							}
						});
					},

					/** �Ű��ϱ� */
					report: function (v) {
						ui.confirm('�Ű� ó�� �Ͻðڽ��ϱ�?', {
							doneTxt: '�Ű�',
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
										if (!_res || _res.retcode !== '1') return ui.toast('�Ű� ����');
										ui.toast('�Ű�ó�� �Ͽ����ϴ�.');
									})
									.fail(function (xhr) {
										console.error(xhr);
									});
							}
						});
					},

					/** ������ ��� */
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

					/** lottie �ִϸ��̼� ������ �����ϱ� */
					setAniData: function (v) {
						_.forEach(v, function (fv, fk) {
							vm.aniData[fk] = fv;
						});
					},

					/** �̹��� ���� ó�� */
					talkNoImg: function (v) {
						v.el.src =
							'https://image.club5678.com/imgs/mobile/main_renewal/img/img_talk_bg_noimg.png';
						vm.rows[v.i].photo_info[v.fi].error = true;
					}
				};

				/**
				 * �Խñ� cmd �� ���μ���
				 * @param cmd
				 * @param data
				 * @private
				 */
				var _talkProc = function (cmd, data) {
					_talkProcess[cmd](data);
				};

				/**
				 * �� ���/���� �Ϸ� �ݹ�
				 * @private
				 */
				var _talkWriteCallback = function (res) {
					setTimeout(function () {
						if (res.retdata.process === 'regist') {
							/** ����϶� ��� �ٽð������� */
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
							/** �����϶� �ش� �Խñ۸� �ٽð������� */
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
				 * ��� ������ ���� �� ��� ����
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
				 * �˻����� ����
				 */
				fn.openFilter = function () {
					if (!vm.isAll) return ui.toast('�˻��� ��ü���� �϶��� �����մϴ�.');
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
				 * ������(�˻�) ��ư Ŭ��
				 */
				fn.search = function () {
					openWin('/?ctrl=cont/talk/index&mode=talkSearch');
				};

				/**
				 * ����Ƽ���� ���� �̹��� ���� �����ϰ� �ε�
				 */
				fn.setAdInfo = function () {
					var adRows = {
						ad_talk_1: {
							imgSrc: vm.memSex === 'm' ? 'bnr_talk_ad_m.png' : 'bnr_talk_ad_f.png',
							btnMsg: '������ȭ �Ϸ�����',
							service: 'pmchat',
							adContent:
								vm.memSex === 'm'
									? [
											'����� ä���� �̿��� ��ȭ�� ����',
											'�� ���̼� ���ֺ��� ��̸� ������~!'
									  ]
									: [
											'�̼��� ��ȭ�ϸ鼭 �ð��� ������',
											'�����ݵ� �ް� �ϼ������� ���� ���ƿ�~!'
									  ]
						},
						ad_talk_2: {
							// �̼� 2��
							imgSrc: __missionAdImg,
							btnMsg: '������ȭ �Ϸ�����',
							service: 'pmchat',
							adContent: [
								'��ȭ�� �������ε� �����ݱ���?',
								'�����ϰ� ��ȭ�ϰ� �����ݵ� ì�⼼��!'
							]
						},
						ad_qmeet_1: {
							imgSrc: 'bnr_cm_qmeet_talktype.png',
							btnMsg: '�������� �Ϸ�����',
							service: 'qmeet',
							adContent: '���� ����� �̼�ȸ���� ������ ���� ���� ���'
						}
					};

					if (vm.memSex === 'm') {
						adRows = _.omit(adRows, ['ad_talk_2']);
					}

					vm.adInfo = _.shuffle(adRows);
				};

				/** �ʱ� ���� */
				(function () {
					/** ����޴� ���� */
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
						/** ����� �Խñۻ� �϶� */
						_getRowsDone(__rows);
					} else {
						/** ����� �Խñ۸�� �϶� */
						/** �ʱ� �з��� ���� */
						vm.cate.unshift({ k: 0, talkLclss: '0', talkMclss: '0', t: '��ü' });

						/** ������ ��ȸ ���� ó�� */
						vm.$nextTick(function () {
							if (typeof __rows !== 'undefined') return;

							/** ���ο��� �Ķ���ͷ� ȣ��� �Ķ���Ͱ����� ������ */
							if (vm.urlparam.cate) vm.cateKey = parseInt(vm.urlparam.cate); // cate �Ķ���Ͱ� ������ �Ķ���� ������ ���� 0:��ü, 1:�ϻ�, 4:�Ⱦƿ�/��ϴ�, 5:����/ȫ��, 8:����/���� code.talkV2�� ����
							if (vm.urlparam.pageNo) vm.pageNo = parseInt(vm.urlparam.pageNo); // pageNo �Ķ���Ͱ� ������ �Ķ���� ������ ����

							/** �÷��׿��� ������ */
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

							/** �Ⱦƿ��� ����� */
							if (vm.sessSale) {
								if (performance.navigation.type === 0) {
									vm.cateKey = vm.sessSale.cateKey;
									vm.pageNo = 1;
								}
							}

							/** ������ ��ȸ(���ư ó�������� setTimeout �ʿ� - �з��ǿ���) */
							setTimeout(function () {
								fn.movePage(vm.pageNo, vm.cateKey);
							}, 0);
						});

						/** �۾��� ��ư �ִϸ��̼� */
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

						/** ��� ���ΰ�ħ ó�� */
						p2refresh.onRefresh = function () {
							fn.movePage(vm.pageNo, vm.cateKey);
						};

						/** ��ũ�� ������ ���ǽ��丮�� */
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

					vueBus.$on('talkProc', _talkProc); /** �Խñ� cmd �� ���μ��� */
					vueBus.$on('talkWriteCallback', _talkWriteCallback); /** �۾��� �Ϸ� �ݹ� */
					vueBus.$on(
						'talkTailCallback',
						_talkTailCallback
					); /** ��� ������ ���� �� ��� ���� */
				})();
			},

			/**
			 * ����Ʈ �߰��� ���� ���� �߰�
			 * @param list ���� array
			 * @param init ù ���� ���� index
			 * @param interval ù ���� ���� ����Ǿ��� index ����
			 *
			 * init�� interval�� �������� ���� ����Ǿ�� �� �ڸ��� ���̵����� ����, ���� ����� �ٲ��ֱ� ����
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
