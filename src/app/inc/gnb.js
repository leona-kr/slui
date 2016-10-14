//# sourceURL=gnb.js
'use strict';


_SL.nmspc("inc").gnb = function(){

	var
	// Config 정의
	mCfg = {
		layers : '#section-header-layers',
		
		urlLogout	: gCONTEXT_PATH + "login/logout.do",
		urlUserInfo	: gCONTEXT_PATH + "main/main_simpleUserInfo.html"
	},

	// JQuery 객체 변수
	m$ = { layers		: null},
	
	// 현재 상태 변수
	mState = {},
	
	init = function(menuData, curGrpKey, curTitle){
		$(function() {
			m$.layers = $(mCfg.layers);
			
			// DOM 설정
			if($.fn.gnbMenu && menuData){
				$('header').gnbMenu(menuData.child, curGrpKey, curTitle);
			}
			
			// 이벤트 Binding
			m$.layers.find('.btn-logout').on('click', onClickLogout);
			m$.layers.find('.btn-userInfo').on('click', onClickUserInfo);
		});
	},
	
	onClickLogout = function(){
		location.href = mCfg.urlLogout;
	},

	onClickUserInfo = function() {
		new ModalPopup(mCfg.urlUserInfo,{
			height: 580
		});
	},
	
	DUMMY;
	
	return {
		init : init
	};
}();

_SL.nmspc("inc").mymenu = function(){
	var
	mCfg = {
		urlRead : gCONTEXT_PATH +'main/mymenu_list.json',
		//urlSave : gCONTEXT_PATH + 'main/mymenu_insert.do',
		urlPage : gCONTEXT_PATH + 'main/mymenu_form.html'
	},
	init = function(){
		$(function() {
			//set mymenu
			refresh();

			//event listen
			$('header .btn-setting').on('click',onloadPage);
		});
	},
	refresh = function(){
		$('body').requestData(mCfg.urlRead,{},{callback:function(data){
			drawMymenu(data);
		}});
	},
	drawMymenu = function(data){
		if($('header .group-mymenu').size()<1) return false;

		var _nav = '.nav-global',
		$target = $('header .group-mymenu').empty();

		for(var i=0,len=data.length;i<len;i++){
			var $item = $(_nav+' a[data-id='+data[i]+']');
			if( $item.size()>0 ){
				var _href = $item.attr('href'),
				_text = $item.text(),
				$span = $('<span />')
					.addClass('item-menu')
					.appendTo($target),
				$link = $('<a />')
					.attr({
						'href': $item.attr('href'),
						'data-id' : data[i]
					})
					.text($item.text())
					.appendTo($span);

				//3D 대시보드
				if(data[i] == 271){
					$link.attr('target','_blank');
				}
			}
		}
	},
	onloadPage = function(){
		new ModalPopup(mCfg.urlPage,{
			width: 900,
			height: 450,
			onClose : function(){
				refresh();
			}
		});
	}

	return {
		init : init
	};
}();



$(function(){
	// 헤더 서브 레이어
	slui.headerlayer.init();
	
	// 게시판
	$('.header-layer-board .btn-link').on('click',function(){
		window.open($(this).attr('href'), "boardPopup", 'toolbar=no,location=no,directory=no,status=no,menubar=no,height=800,width=1200,scrollbars=no,resizable=yes');
		return false;
	});
	
	// 버전 히스토리
	$('#btnHistory').on('click',function(){
		var url = $(this).attr('href'),
		historyModal = new ModalPopup(url,{
			width:700,
			height:640
		});
		return false;
	});

	// 라이선스등록
	$('#dialLicence').on('click',function(){
		var url = $(this).attr('href'),
		licenceModal = new ModalPopup(url,{
			width:400,
			height:130
		});
		return false;
	});

	// 실시간 경고알림
	slui.notices.pushalram();

	//공지사항
	slui.notices.notice()
});