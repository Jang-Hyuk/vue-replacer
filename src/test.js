/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import _ from 'lodash';

const foldersTree = {
	desc: '클럽5678',
	hreference: '',
	id: 92,
	navObj: {},
	iconImg: {},
	nodeImg: {},
	isLastNode: 0,
	menuNo: '501',
	isOpen: false,
	iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
	children: [
		{
			desc: '접속 현황',
			hreference: '',
			id: 93,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '599',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '로그인 현황',
					link: '\'/mng_club/session/login/time_stats.html?mode=time&_MENU_ID_=600\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 94,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '현재 접속자',
					link: '\'/mng_club/session/conn/con_stats_v1.html?mode=cur1&_MENU_ID_=606\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 95,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 2
		},
		{
			desc: '가입/결제 현황',
			hreference: '',
			id: 96,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '607',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '가입 현황',
					link: '\'/mng_club/join/time_stats.html?mode=time&_MENU_ID_=663\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 97,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '결제 현황',
					link: '\'/mng_club/payment/day_stats.html?mode=day&_MENU_ID_=610\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 98,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '캐쉬/포인트 현황',
					link: '\'/mng_club/payment/cash/index.html?_MENU_ID_=694\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 99,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '휴면/탈퇴 현황',
					link: '\'/mng_club/secede/day_stats.html?mode=day&_MENU_ID_=1239\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 100,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '인앱 결제취소 현황',
					link: '\'/mng_club/payment/inapp_cancel/inapp_cancel_list.html?_MENU_ID_=1884\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 101,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 5
		},
		{
			desc: '광고 관리',
			hreference: '',
			id: 102,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '783',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '광고 가입 현황',
					link: '\'/mng_club/adv/statistics/index.html?_MENU_ID_=661\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 103,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '광고 주소 관리',
					link: '\'/mng_club/adv/adurl/index.php?_MENU_ID_=822\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 104,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: 'AdlKey이벤트관리',
					link: '\'/mng_club/adv/adurl/adkey_event_list.html?_MENU_ID_=1226\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 105,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 3
		},
		{
			desc: '컨텐츠 현황',
			hreference: '',
			id: 106,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '616',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '쪽지/찜현황',
					link: '\'/mng_club/paper/mng_paper_stat_new.html?flag=paper&_MENU_ID_=1490\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 107,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '음성/영상/사진',
					link: '\'/mng_club/vvp_stat/vvp_day_stat.html?_MENU_ID_=1918\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 108,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: 'SMS/MMS현황',
					link: '\'/mng_club/sms/sms_time_stats.html?flag=sms&_MENU_ID_=687\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 109,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '홍보쪽지현황',
					link: '\'/mng_club/arlimMng/stati/list.html?_MENU_ID_=1292\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 110,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '채팅현황',
					link: '\'/mng_club/chat/video/index.html?mode=o1&_MENU_ID_=753\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 111,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '친구현황',
					link: '\'/mng_club/content/friend_stat/friend_time_stat.html?_MENU_ID_=1917\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 112,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '푸시설정현황',
					link: '\'/mng_club/content/push_alim/push_alim_month.html?_MENU_ID_=1853\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 113,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '푸시발송현황',
					link: '\'/mng_club/content/push/mng_push_stat_summary.html?_MENU_ID_=1868\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 114,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '지인차단현황',
					link: '\'/mng_club/content/mem_myphone_contacts/mem_myphone_contacts_stat.html?_MENU_ID_=1966\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 115,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 9
		},
		{
			desc: '컨텐츠 관리',
			hreference: '',
			id: 116,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '625',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '사진&동영상',
					link: '\'/mng_club/photo/album/adm_newalbum_newlist.html?tMenu=newalbum&_MENU_ID_=1491\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 117,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '동영상SHOW',
					link: '\'/mng_club/movie/movie_stat.html?_MENU_ID_=1901\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 118,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '결혼재혼(신)',
					link: '\'/mng_club/marryV2/?ie=edge&_MENU_ID_=2133\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 119,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '결혼재혼(구)',
					link: '\'/mng_club/marry?_MENU_ID_=1147\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 120,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '미팅신청',
					link: '\'/mng_club/meeting_new/mng_open_list.html?tMenu=open&_MENU_ID_=1314\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 121,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '아이템',
					link: '\'/mng_club/feedclub/group/group_list.html?tMenu=grp&_MENU_ID_=1087\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 122,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '보석관리',
					link: '\'/mng_club/jewel/jewel_cash.html?code=1&_MENU_ID_=1736\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 123,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '좋아요',
					link: '\'/mng_club/like/dashboard.html?tMenu=1&_MENU_ID_=2072\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 124,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '빠른대화',
					link: '\'/mng_club/content/pmchat/?_MENU_ID_=1722\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 125,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '빠른통화 플러스',
					link: '\'/mng_club/content/pluscall/?_MENU_ID_=1739\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 126,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '빠른만남',
					link: '\'/mng_club/content/fastmeet/?_MENU_ID_=1660\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 127,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '다중채팅',
					link: '\'/mng_club/starshot?_MENU_ID_=2118\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 128,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '빠른사진관리',
					link: '\'/mng_club/content/fast_photo/fast_photo_cert.html?_MENU_ID_=1733\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 129,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '목소리 프로필',
					link: '\'/mng_club/content/fast_voice/fast_voice_cert.html?_MENU_ID_=1845\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 130,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '상황일지관리',
					link: '\'mng_club/content/stateLog/index.html?_MENU_ID_=1747\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 131,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 15
		},
		{
			desc: '사이트 관리',
			hreference: '',
			id: 132,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '631',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '공지사항',
					link: '\'/mng_club/site/notice/app/index.html?tMenu=app&_MENU_ID_=665\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 133,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '서비스 이용약관',
					link: '\'/mng_club/site/yak/index.html?_MENU_ID_=998\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 134,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '컨텐츠 운영정책',
					link: '\'/mng_club/site/policy/?_MENU_ID_=1534\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 135,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '크론관리',
					link: '\'/mng_club/content/cron_mng/index.html?_MENU_ID_=1312\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 136,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '메일관리',
					link: '\'/mng_club/mail/statistics/?tMenu=01&_MENU_ID_=1150\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 137,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '메인컨텐츠',
					link: '\'/mng_club/site/main/mng_menu.html?_MENU_ID_=629\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 138,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 6
		},
		{
			desc: '서비스관리(CS)',
			hreference: '',
			id: 139,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '1449',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '관리자 답변',
					link: '\'/mng_club/member/manager/manager_ans_list.php?_MENU_ID_=1471\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 140,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '도움말',
					link: '\'/mng_club/site/helpMenu/index.php?_MENU_ID_=1473\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 141,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: 'ⓟ플러그',
					link: '\'/mng_club/site/plugVisit/stats.html?tMenu=stats&slct=plug&_MENU_ID_=1475\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 142,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 3
		},
		{
			desc: '회원관리(CS)',
			hreference: '',
			id: 143,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '639',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '회원 검색',
					link: '\'/mng_club/member/info/member_info_total.php?_MENU_ID_=640\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 144,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '외국회원승인',
					link: '\'/mng_club/member/foreign/foreign_member_list.php?_MENU_ID_=1122\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 145,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '장애 신고센터(클럽)',
					link: '\'/mng_club/answer/doumi/indexClub.html?_MENU_ID_=646\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 146,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '사이버 신고센터',
					link: '\'/mng_club/answer/cyber/index2.php?_MENU_ID_=647\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 147,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '불법촬영물신고센터',
					link: '\'/mng_club/answer/illegal/?_MENU_ID_=2121\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 148,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '쪽지신고센터',
					link: '\'/mng_club/answer/cyber_msg/cyber_msg_list.html?_MENU_ID_=729\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 149,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '빠른만남 신고센터',
					link: '\'/mng_club/answer/cyber_qmeet/cyber_qmeet_list.html?_MENU_ID_=2129\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 150,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '다중채팅 신고센터',
					link: '\'/mng_club/starshot/?route=report-visitor&_MENU_ID_=2120\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 151,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '프로필신고센터',
					link: '\'/mng_club/member/report/profile/?tMenu=1&_MENU_ID_=2090\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 152,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '결혼재혼신고센터',
					link: '\'/mng_club/answer/cyber_marryV2/index.html?ie=edge&_MENU_ID_=2134\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 153,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '메일문의',
					link: '\'/mng_club/member/sendmsg/sendmail_list2.html?_MENU_ID_=1899\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 154,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '강퇴시키기',
					link: '\'/mng_club/member/force_logout/?_MENU_ID_=641\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 155,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '아이디 정지',
					link: '\'/mng_club/member/idstop/?_MENU_ID_=642\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 156,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '메일 보내기',
					link: '\'/mng_club/member/sendmsg/sendmail.html?_MENU_ID_=692\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 157,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '환불내역관리',
					link: '\'/mng_club/payment/statistics/cancelStat.html?_MENU_ID_=1266\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 158,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '상담가이드',
					link: '\'/mng_club/member/customer_guide/customer_guide.php?_MENU_ID_=1376\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 159,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '광고자관리',
					link: '\'/mng_club/answer/cyber_adm/cyber_adm_list1.php?_MENU_ID_=1379\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 160,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '테스트 아이디관리',
					link: '\'/mng_common/staff/mng_id/add.html?_MENU_ID_=947\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 161,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 18
		},
		{
			desc: '결제업체',
			hreference: '',
			id: 162,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '648',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: '와우코인',
					link: '\'http://cp.wowcoin.com/?_MENU_ID_=649\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 163,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '뱅크타운',
					link: '\'http://ebiz.banktown.com/index.cs?_MENU_ID_=650\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 164,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '데이콤 ADSL',
					link: '\'http://cp.billgate.net/?_MENU_ID_=883\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 165,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '모빌 환불/취소',
					link: '\'https://mcash.mobilians.co.kr/club5678/login.php3?_MENU_ID_=1010\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 166,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '해외카드(dccard)',
					link: '\'http://www.c-check.co.jp/ip/shoplog2.html?_MENU_ID_=1124\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 167,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '무통장 입금(CVS)',
					link: '\'http://www.cybercvs.com/mall_account?_MENU_ID_=1224\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 168,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '해외무통장입금',
					link: '\'/mng_club/payment/clubacc/accList.html?_MENU_ID_=1286\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 169,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: '무통 결제내역',
					link: '\'http://admin.inforex.co.kr/mng_club/payment/cyber_cvs_money.html?_MENU_ID_=1537\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 170,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 8
		},
		{
			desc: '제휴업체',
			hreference: '',
			id: 171,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 0,
			menuNo: '655',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: 'CP업체메뉴',
					link: '\'/mng_club/cp/index.html?_MENU_ID_=1237\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 172,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: 'CP업체제공URL',
					link: '\'/mng_club/payment/cp/cpa_list.html?_MENU_ID_=1535\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 173,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 2
		},
		{
			desc: '기타메뉴',
			hreference: '',
			id: 174,
			navObj: {},
			iconImg: {},
			nodeImg: {},
			isLastNode: 1,
			menuNo: '1497',
			isOpen: 0,
			iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2folderopen.gif',
			children: [
				{
					desc: 'badWord',
					link: '\'/mng_club/site/badWord/clubAppLog.php?_MENU_ID_=1499\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 175,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				},
				{
					desc: 'badProgram',
					link: '\'/mng_club/site/badProgram/loginLog.php?_MENU_ID_=1500\' target="main" onMouseOver="window.status=\'\';return true"',
					id: 176,
					navObj: {},
					iconImg: {},
					iconSrc: 'http://image.club5678.com/imgs/admin/tree/ftv2doc.gif'
				}
			],
			nChildren: 2
		}
	],
	nChildren: 11
};

class Component {
	constructor() {}

	operation() {}

	add(Component) {}

	remove(Component) {}

	getChild(key) {}

	getTreeName(id) {}
}

class File extends Component {
	constructor(name) {
		super();
		this.name = name;
		console.log('Leaf created');
	}

	operation() {
		console.log(this.name);
	}
}

class Composite extends Component {
	constructor(name) {
		super();
		this.name = name;
		this.children = [];
		console.log('Composite created');
	}

	operation() {
		oonsole.log(`Composite Operation for: ${this.name}`);
		for (const i in this.children) {
			ohis.children[i].Operation();
		}
	}

	add(Component) {
		this.children.push(Component);
	}

	remove(Component) {
		for (const i in this.children) {
			if (this.children[i] === Component) {
				this.children.splice(i, 1);
			}
		}
	}

	/**
	 *
	 * @param {number} key
	 * @return {Composite}
	 */
	getChild(key) {
		return this.children[key];
	}
}

/**
 *
 */
function setFolderTreeManager() {}

const folderTreeManager = new Composite(foldersTree);
