'use strict';
_SL.nmspc("contents").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formContents',
		urlNetworkChk : gCONTEXT_PATH + "system/ping_check.json",
		urlIntelAction : gCONTEXT_PATH + "system/intelligence_action.json",
		urlUpdateContents : gCONTEXT_PATH + "system/update_contents.json",
		urlSelectContents : gCONTEXT_PATH + "system/select_contents.do",
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		actionCode : $(mCfg.formId + ' [name=action_code]')
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		
		// Network Check.
		networkCheck();
	},

	bindEvent = function() {
		$("#contents").find("button").on('click', function(){
			intelAction(2, this.value);
		});
	},
	
	select = function() {
		var callback = function(data){
			_SL.setDataToForm(data, m$.form, {});
		};
		$('body').requestData(mCfg.urlSelect, {}, {callback : callback});
	},
	
	networkCheck = function() {
		$('body').requestData(mCfg.urlNetworkChk, {}, {
			callback : function(rsData){
				//console.log('ping=' + rsData);
				if(rsData < 0) {
					$('#network_status').html('<div class="text-attention">업데이트서버에<br>접속할수없습니다.</div>');
				} else {
					$('#network_status').text("업데이트가 가능합니다.");
					$("#contents").find("button").prop('disabled',false);

					intelAction(1,0);
				}
			}
		});	
	},
	
	intelAction = function(action, cid) {
		var action_code = action;
		var contents_id = cid;
		if (action_code == '2' && $("#upd_btn_"+cid).prop('disabled'))
			return;
		
		$('#status_'+contents_id).text("요청");
		$('body').requestData(mCfg.urlIntelAction, {action_code: action_code, contents_id: contents_id}, {
			callback : function(rsData){
				
				// Network Check.
				if (action_code == '1'){
					var elements = $.parseJSON( rsData );
					for (var i = 0; i < elements.length; i++) {
						$("#tot_cnt_"+elements[i].content_id).text(elements[i].cnt);
						if (elements[i].cnt == 0) {
							$("#upd_btn_"+elements[i].content_id).prop('disabled',true);
							$("#upd_btn_"+elements[i].content_id).attr('onclick',null).off('click');
						}
					}
					
				// Contents Update.
				} else if (action_code == '2'){
					var elements = $.parseJSON( '[' + rsData + ']' );
					if (elements[0].fname != '') {
						$('#status_' + cid).text("업데이트중...");
						$('#loading_' + cid).show();
						setTimeout(function() { updateContents(elements[0].content_id, elements[0].fname); }, 1000);
					} else {
						$('#status_'+contents_id).text("오류");
					}
				}
				
			}
		});	
	},
	
	updateContents = function(cid, fname) {
		$('body').requestData(mCfg.urlUpdateContents, {contents_id : cid, fname : fname}, {
			callback : function(rsData) {
				$('#loading_' + cid).hide();
				if (parseInt(rsData) > 0) {
					$('#status_' + cid).text("완료");
					selectContents(cid);
				} else {
					$('#status_' + cid).text("오류");
				}
			}
		});
	},
	
	selectContents = function(cid) {
		$('body').requestData(mCfg.urlSelectContents, {contents_id : cid}, {
			callback : function(rsData) {
				var elements = $.parseJSON( rsData );
				$("#down_cnt_"+cid).text(elements.download_cnt);
				$("#update_dt_"+cid).text(elements.update_dt_format);
			}
		});
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.contents.form.init();
	
	$.fn.rowspan = function(colIdx, isStats) {
		return this.each(function(){
			var that;
			$('tr', this).each(function(row) {
				$('.list-head:eq('+colIdx+')', this).filter(':visible').each(function(col) {
					
					if ($(this).html() == $(that).html() && (!isStats || isStats && $(this).prev().html() == $(that).prev().html())) {
						var rowspan = $(that).attr("rowspan") || 1;
						rowspan = Number(rowspan)+1;
						$(that).attr("rowspan",rowspan);
						
						$(this).hide();
					} else {
						that = this;
					}
					that = (that == null) ? this : that;
				});
			});
		});
	};
	$('#contents').rowspan(0);
});