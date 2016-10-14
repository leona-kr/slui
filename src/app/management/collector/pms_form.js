//# sourceURL=pms_form.js
'use strict';

_SL.nmspc("pms").form = function(){

	var
	// Config 정의
	mCfg = {
		formId    : '#formPms',
		urlSelect : gCONTEXT_PATH + "management/pms_list.json",
		urlAdd    : gCONTEXT_PATH + "management/pms_insert.do"
	},
	
	// JQuery 객체 변수
	m$ = {
		form       : $(mCfg.formId),
		evtType    : $(mCfg.formId + ' [name=evt_type]'),
		appCode    : $(mCfg.formId + ' [name=app_code]'),
		serverSeqs : $(mCfg.formId + ' [name=server_seqs]'),
		patchFile  : $(mCfg.formId + ' [name=patch_file]')
	},
	
	init = function(){
		//이벤트 Binding
		bindEvent();
	},
	
	bindEvent = function() {
		m$.form.find('[name=evt_type]').click(function(){
			switch($(this).val()){
				case '1':
					$("#p_tab1").hide();
					$("#p_tab2").show();
					$("#app_code").val("");
					break;
				case '2':
					$("#p_tab1").show();
					$("#p_tab2").hide();
					$("#app_code").val("");
					$("#patch_file").val("");
					slui.attach.setTransformSelect('#p_tab1');
					break;
				case '3':
					$("#p_tab1").hide();
					$("#p_tab2").show();
					$("#app_code").val("");
					break;
			}
		});

		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	onSave = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		if (!_SL.validate(m$.form)) return;
		
		m$.form.attr({
			enctype : "multipart/form-data",
			encoding : "multipart/form-data",
			action : mCfg.urlAdd
		});
		
		if (isPatch(1) || isPatch(3)){
			m$.appCode.val("");
			if (m$.patchFile.val().trim() == ""){
				_alert("패치파일을 선택하세요.");
				return;
			}
			
			var filePath = m$.patchFile.val();
			if (!/.*\.(zip)$/.test(filePath.toLowerCase())) {
				_alert("zip 파일만 업로드 할수 있습니다.");
				return;
			}
		}
		
		if (isPatch(2)){
			if (m$.appCode.val().trim() == ""){
				_alert("프로세스를 선택하세요.");
				m$.appCode.focus();
				return;
			}
		}
		
		var datas = [];
		if ($(".ms-elem-selection").filter('.ms-selected').length > 0) {
			$.each($(".ms-elem-selection").filter('.ms-selected'), function() {
				datas.push($(this).data("ms-value"));
			});
		} else {
			_alert("패치서버를 선택하세요.");
			return;
		}
		m$.serverSeqs.val(datas.join(","));
		
		if (m$.serverSeqs.length > 0){
			_confirm("저장하시겠습니까?",{
				onAgree : function(){
					m$.form.ajaxSubmit({
						dataType:"text",
						success:function(rsMsg, statusText, xhr, $form) {
							if(rsMsg == "SUC_COM_0001") {
//								_alert("입력 되었습니다.");
								onClose(afterClose);
							}
							else {
								_alert(rsMsg);
							}
						}
					});
				}
			});
		}
	},
	
	isPatch = function (val) {
		var num = m$.evtType.length;
		for (i = 0; i < num; i++)  {
			if(m$.evtType[i].checked) {
				if (m$.evtType[i].value == val) {
					return true;
				} else {
					return false;
				}
			}
		}
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	};

	return {
		init: init
	};
}();

$(function(){
	slapp.pms.form.init();
	
	var multi = $("#src_server_list")
		.multiSelect({
			selectableHeader : "<div class='custom-header'><input type='text' id='selectableSearch' autocomplete='off' placeholder='검색' class='form-input form-block'>&nbsp;<button type='button' class='btn-basic btn-mini' id='select-all'>전체선택</button></div>",
			selectionHeader : "<div class='custom-header'><input type='text' id='selectionSearch' autocomplete='off' placeholder='검색' class='form-input form-block'>&nbsp;<button type='button' class='btn-basic btn-mini' id='deselect-all'>전체선택</button></div>",
			selectableFooter: "<div class='custom-footer'>Count : <span id='selectableCnt'>0</span></div>",
			selectionFooter: "<div class='custom-footer'>Count : <span id='selectionCnt'>0</span></div>",
	
			afterInit: function(ms){
				var that = this,
				$selectableSearch = $("#selectableSearch"),
				$selectionSearch = $("#selectionSearch"),
				selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
				selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';
				
				that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
				.on('keydown', function(e){
					if (e.which === 40){
						that.$selectableUl.focus();
						return false;
					}
				});
				
				that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
				.on('keydown', function(e){
					if (e.which == 40){
						that.$selectionUl.focus();
						return false;
					}
				});
			},
			afterSelect: function(){
				this.qs1.cache();
				this.qs2.cache();
			},
			afterDeselect: function(){
				this.qs1.cache();
				this.qs2.cache();
			}
		});
	
	$("#select-all").click(function() {
		var ms_datas = [];
		if ($(".ms-elem-selectable").filter(':visible').length > 0) {
			$.each($(".ms-elem-selectable").filter(':visible'), function() {
				ms_datas.push($(this).data("ms-value"));
			});
		}
		$("#src_server_list").multiSelect("select", ms_datas);
		return false;
	});
	
	$("#deselect-all").click(function() {
		var ms_datas = [];
		if ($(".ms-elem-selection").filter(':visible').length > 0) {
			$.each($(".ms-elem-selection").filter(':visible'), function() {
				ms_datas.push($(this).data("ms-value"));
			});
		}
		$("#src_server_list").multiSelect("deselect", ms_datas);
		return false;
	});
});
