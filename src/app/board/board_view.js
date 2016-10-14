//# sourceURL=board_view.js

'use strict';

_SL.nmspc("board").view = function() {

	// Config 정의	
	var
	selectedBoardIndex = "",
	
//	mCfg = {
//	},
//	
//	// JQuery 객체 변수	
//	m$ = {
//	},

	init = function() {
		bindEvent();
		TreeManager.init();
		GroupManager.init();

		self.focus();

		$("#board_name").keypress(function(event){
			if( event.which == '13' ){event.preventDefault();}//submit방지
		});
	},
	bindEvent = function() {
	
		$(".defined-list > li").click(function(){
			$(".defined-list > li").removeClass("selected");
			$(this).addClass("selected");

			var ariaValue= $(this).attr("aria-value").split(",");
			boardIndex(ariaValue[0] ,ariaValue[1]);

			slapp.board.view.selectedBoardIndex = ariaValue[0];
		})
		
	},

	boardIndex = function(type,str){
		$("#board_index").val(type);
		$("#sapnText").text(str);
		$(".defined-list span").removeClass("selected");

		var index = $("#board_index").val();
		var ariaValue;
		$(".defined-list li").each(function (){
			ariaValue= $(this).attr("aria-value").split(",");
			if(ariaValue[0] == index){
				$(this).find("span").addClass("selected");
				return false;
			}
		});
		window.open("/board/board_view.html?bbs_typ_cd="+type, "mylogs_frame");
		$(window).scrollTop(0);
	},

	TreeManager = function() {
		var
		init = function() {
			$(".defined-list > li:first-child").addClass("selected");
			var ariaValue = $(".defined-list > li:first-child").attr("aria-value");
			if( ariaValue != null ){
				var Isinit = typeof(ariaValue[0]) == "undefined" ? false : true;
				if(Isinit) {
					$("#board_index").val(ariaValue[0]);
					window.open("/board/board_view.html?bbs_typ_cd="+ariaValue[0], "mylogs_frame");
					$(window).scrollTop(0);
				}
			}
		};
		
		return {
			init: init,
		};
	}(),

	GroupManager =  function () {
		
		var $dlg = $("#board_dlg"),
		
		init = function() {
			var classCancel		= ".btn-cancel";
			$dlg.jqxWindow({
				height: 170, width: 440, autoOpen: false,
				resizable: false, isModal: true, modalOpacity: 0.5,
				cancelButton : $("#board_dlg .btn-cancel"),
				initContent : function(){
					slui.attach.setTransformSelect('#board_dlg');
					$('#board_dlg .jqx-window-content').css('overflow','visible');
				}
			});

			$("#board_dlg .btn-save").click(onDlgSave);
		
			onResize();
			//$(window).resize(onResize);
			
			// 버튼 Event 초기화
			$(".btn-add").click(onClickBtAdd);
			$(".btn-delete").click(onClickBtDel);
			$(".btn-modify").click(onClickBtUpd);
		},
		
		onResize = function() {
			var sectionHeight = $("body").outerHeight(true) - $(".section-title").outerHeight(true);
			$(".ifrm").css("height", sectionHeight + "px");
		},

		onClickBtAdd  = function() {
			dlgSetting('추가','add','' ,1);
		},
		
		onClickBtDel = function() {
			var confirmMsg = $(".selected span").text();
			if(confirmMsg==""){
				_alert("삭제할 수 있는 게시판이 없습니다.");
				return;
			} 
			
			_confirm(confirmMsg+" 를(을) 삭제 하시면<br>관련 내용들이 모두 삭제 됩니다.<br>삭제 하시겠습니까?",{
				onAgree : function(){
					$("#dlg_mode").val("delete");
					onDlgSave();
					onClose(afterClose);
				}
			});	
		},
		
		onClickBtUpd = function() {
			
			var ariaValue = $(".selected").attr("aria-value");
			if(ariaValue == null){
				_alert("수정할 수 있는 게시판이 없습니다.");
				return;
			}
			
			var type = ariaValue.split(",")[1];
			var text = $(".selected").text();

			dlgSetting('수정','update',$(".selected span").text() , $.trim(type));
		},
		
		dlgSetting = function(title ,mode , boardName , type){
			$("#board_dlg_name").text(title);
			
			$("#dlg_mode").val(mode);
			$("#board_name").val(boardName);
			$("#board_type").val(type)
			$dlg.jqxWindow('open');
		},
		
		onDlgSave = function() {
			
			var self = this;
			var url ="";
			var param = {};
			var mode  = $("#dlg_mode").val();
			var boardName   = $("#board_name").val();
			var boardIndex  = $("#board_index").val();
			var boardType   = $("#board_type option:selected").val();

			if(boardName =="" && mode !="delete") {
				_alert("제목을 입력하세요.",{
					onAgree : function(){
						$("#board_name").focus();
					}
				});
				return false;
			}

			switch(mode) {
				case "add" :
						url = "/board/board_menu_add.json";
						param.bbs_nm   = boardName;
						param.bbs_type = boardType;
					break;
				case "update":
						url = "/board/board_menu_update.json";
						param.bbs_nm   = boardName;
						param.bbs_id   = boardIndex;
						param.bbs_type = boardType;
					break;
				case "delete":
						url = "/board/board_menu_delete.json";
						param.bbs_id = boardIndex;
					break;
			}

			$('body').requestData(url, param, {
				callback : function(rsData, rsCd, rsMsg){
					if(rsCd=="SUC_COM_0000"){
						//if(mode !="delete") $dlg.jqxWindow('close');

						location.reload();
					}else{
						_alert("저장 처리중 에러가 발생했습니다.<br>다시 실행하세요.");
					}
				}
			});
		};
		
		return {
			init: init
		};
	}(),
		
		
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			onClose : function(){
				refresh();
			}
		});
	};

	return {
		init : init,
		selectedBoardIndex :  selectedBoardIndex
	};
}();

$(function(){
	slapp.board.view.init();
});