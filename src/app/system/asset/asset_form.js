//# sourceURL=asset_form.js
'use strict';

_SL.nmspc("asset").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formAsset',
		urlEqpJson : gCONTEXT_PATH + "system/eqp_codes.json",
		urlSelect : gCONTEXT_PATH + "system/asset.json",
		urlIpList : gCONTEXT_PATH + 'system/asset_list.json',
		urlLoadForm : gCONTEXT_PATH + 'management/equip_popup_list.html',
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlExistIp : gCONTEXT_PATH + 'system/asset_check_ip.json',
		urlDelete : gCONTEXT_PATH + "system/asset_delete.do",
		
		add : {
			action : gCONTEXT_PATH + "system/asset_add.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "system/asset_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		listTable : $(mCfg.formId + ' #tbl_asset_ip'),
		pAssetId : $(mCfg.formId + ' [name=p_asset_id]'),
		assetId : $(mCfg.formId + ' [name=asset_id]'),
		groupCodeType : $(mCfg.formId + ' .btn-register-group').data('value'),
		typeCodeType : $(mCfg.formId + ' .btn-register-type').data('value')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.pAssetId.val() == "" ? true : false,
		mode : m$.pAssetId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();

		// 장비 종류 SelectBox Load
		m$.form.find('[name=eqp_type_cd]').chosen({search_contains : true, width:'100%'});
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}else {
			m$.assetId.addClass("form-text").prop("readonly",true);
		}
		// 데이타 조회
		if(!mState.isNew){
			select();
		}
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);

		m$.form.find('.btn-load').exModalPopup(mCfg.urlLoadForm, {
			width:800,
			height:500,
			onClose: function(){
				_equipInfo();
			}
		});
		
		m$.form.find('.btn-register-group').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.groupCodeType, {
			width:550,
			height:455,
			onClose: function(){
				_addCode(m$.form.find('[name=group_cd]'));
			}
		});
		
		m$.form.find('.btn-register-type').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.typeCodeType, {
			width:550,
			height:455,
			onClose: function(){
				_addCodeChosen(m$.form.find('[name=eqp_type_cd]'));
			}
		});
		
		//탭 Change 이벤트
		m$.form.find(".config_tab li").click(function(){
			changeTab($(this).index());
		});
		
		//IP 추가버튼
		m$.form.find('.btn-plus').on("click",function(e){
			addIpTr();
		});
		
		//IP 제거버튼	
		m$.form.on("click",".btn-minus",function(e){
			delIpTr($(this));
		});
		
		//ip 형식 체크
		m$.form.find("[name=ip_type]").change(function() {
			ipTypeChg($(this).val());
		});
	},

	select = function() {
		var id = m$.assetId.val(),
		rqData = {'asset_id': id},
	
		callback = function(data){
			_SL.setDataToForm(data, m$.form, {
				"eqp_type_cd" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=eqp_type_cd]').val(cvData);
						m$.form.find('[name=eqp_type_cd]').trigger('chosen:updated');
					}
				}
			});
			
			ipTypeChg(m$.form.find("[name=ip_type]:checked").val());

			slui.attach.setTransformSelect(mCfg.formId);
		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	changeTab = function(idx){
		
		m$.form.find(".config_tab li").removeClass("tab-item-active");
		m$.form.find(".config_tab li").eq(idx).addClass("tab-item-active");
		
		switch(idx) {
			case 0 :
				m$.form.find("#default").css("display", "block"); 
				m$.form.find("#ipInfo").css("display", "none");
				break;
			case 1 :
				m$.form.find("#default").css("display", "none"); 
				m$.form.find("#ipInfo").css("display", "block");
				break;
		}		
	},
	
	ipTypeChg = function(ipType){
		m$.listTable.find("tr").each(function(idx, elem) {
			if(idx > 0) {
				m$.listTable.find("#tr_ip"+idx).find("input").removeAttr("data-valid");
				m$.listTable.find("#tr_ip"+idx).find("input").attr("data-valid", "자산 IP,required,ipv"+ipType);
			}
		});
	},
	
	addIpTr = function(){
		var ipType = m$.form.find("[name=ip_type]:checked").val();
		var seqCnt = m$.listTable.find("tr").size();
		var $tr = $("<tr id='tr_ip"+ seqCnt +"' class='align-center'>");
		var $td1 = $("<td><span data-name='seq_no'>" + seqCnt + "</span></td>");
		var $td2 = $("<td />");
		var $input1 = $("<input type='text' name='sip' class='form-input' style='width: 250px;' value='' data-valid='자산 IP,required,ipv4'><span> ~ </span>");
		var $input2 = $("<input type='text' name='eip' class='form-input' style='width: 250px;' value='' data-valid='자산 IP,required,ipv4'>");
		var $input3 = $("<input type='text' name='sip' class='form-input' style='width: 250px;' value='' data-valid='자산 IP,required,ipv6'><span> ~ </span>");
		var $input4 = $("<input type='text' name='eip' class='form-input' style='width: 250px;' value='' data-valid='자산 IP,required,ipv6'>");
		var $btn1 = $("<td><button type='button' class='btn-basic btn-mini btn-minus'><i class='icon-minus'></i></button></td>");
		
		if(ipType == 4) 
			$td2.append($input1, $input2);
		else 
			$td2.append($input3, $input4);
		
		$tr.append($td1, $td2, $btn1);
		$tr.appendTo(m$.listTable);
	},
	
	delIpTr = function(btnMinus){
		var $listTable = m$.listTable;
		if(($listTable.find("tr")).size() == 2) return;
		
		btnMinus.parent().parent().remove();

		//순번 변경
		var seqCnt = $listTable.find("tr").size();
		for(var i=0; i<seqCnt; i++){
			$listTable.find("[data-name=seq_no]").eq(i).text(i+1);
			$listTable.find("tr").eq(i).attr("id", "tr_ip"+i);
		}		
	},
	
	slvalidate = function(){
		if(!_SL.validate(m$.form)){
			switch(_SL.validElement.name){
				case "asset_nm":
				case "group_cd":
				case "eqp_type_cd":
				case "weight":
				case "weak_score":
					changeTab(0);
					_SL.validElement.focus();
					break;
		
				case "sip":
				case "eip":
					changeTab(1);
					_SL.validElement.focus();
					break;
			}	
			return false;
		}
		return true;
	},
	
	onSave = function(){
		
		if(!slvalidate()) return;

		checkIpDupl();
	},
	
	checkIpDupl = function(){
		var assetId = m$.assetId.val();
		var ipType = m$.form.find("[name=ip_type]:checked").val();
		var $tbl = m$.listTable;
		var _sips = $.map($tbl.find("[name=sip]"), function(o, idx) { return $.trim($(o).val()); });
		var _eips = $.map($tbl.find("[name=eip]"), function(o, idx) { return $.trim($(o).val()); });
		var beforeSips = _sips.slice(),
			beforeEips = _eips.slice();
		var ipCnt = _sips.length;
		var ip1_checked = false,
			ip2_checked = false;
		var bipRangType, cipRangType;
		var nSips = [], nEips = [];
		
		var pageType = mState.isNew ? "add" : "upd";
		
		//IP정규화해주기 IPv4 IPv6
		for(var i in _sips) {
			_sips[i] = _SL.ip.toNormalize(_sips[i]);
			_eips[i] = _SL.ip.toNormalize(_eips[i]);
			
			nSips.push(_sips[i]);
			nEips.push(_eips[i]);
		}
		
		for(var i=0; i<ipCnt; i++) {
			//단일, 범위 체크
			var ipRangChk;
			
			if(nSips[i] == nEips[i]) ipRangChk = 0;
			else if(nSips[i] > nEips[i]) ipRangChk = 1;
			else if(nSips[i] < nEips[i]) ipRangChk = -1;
			else ipRangChk = "";
			
			if(ipRangChk == 0) {
				cipRangType ="single";
				if(i==0) bipRangType = cipRangType;
				ip1_checked = true;
			}
			else if(ipRangChk == 1) {
				_alert("시작 IP가 종료 IP보다 큽니다.");
				m$.listTable.find("#tr_ip"+(i+1)).find("[name=sip]").focus();
				ip1_checked = false;
				return;
			}
			else if(ipRangChk == -1) {
				cipRangType = "multi";
				if(i==0) bipRangType = cipRangType;
				ip1_checked = true;
			}
			else {
				_alert("에러가 발생하였습니다.");
				ip1_checked = false;
				return;
			}
			
			if(bipRangType != cipRangType) {
				_alert("단일IP 혹은 범위IP로만 일괄 입력가능합니다.");
				ip1_checked = false;
				return;
			}
			else if(bipRangType == cipRangType) {
				ip1_checked = true;
			}
			else {
				_alert("단일,범위체크 에러발생!!!");
				ip1_checked = false;
			}
			
			//범위IP 등록일때, 중복검사해야됨
			if(cipRangType == "multi" && ipCnt > 1) {
				for(var j=i+1; j<nSips.length; j++) {
					var stdSip = nSips[i],
						stdEip = nEips[i];
					var cmpSip = nSips[j],
						cmpEip = nEips[j];
					
					if(stdSip >= cmpSip && stdSip <= cmpEip) {
						_alert("중복된 IP가 있습니다.("+ stdSip +")");
						ip1_checked = false;
						return;
					} 
					else if (stdEip >= cmpSip && stdEip <= cmpEip) {
						_alert("중복된 IP가 있습니다.("+ stdEip +")");
						ip1_checked = false;
						return;
					}
					else {
						ip1_checked = true;
					}
				}
			}
		}
		
		var param = {
			asset_id : assetId,
			page_type : pageType,		//추가or수정 - add or upd
			ip_range_type : cipRangType,//단일or범위 - single or multi
			ip_type : ipType,			//IPv4orIPv6 - 4 or 6
			sips : _sips,
			eips : _eips
		};
		
		$('body').requestData(mCfg.urlExistIp, param, {
			callback : function(rsMsg){
				if(rsMsg == "EXIST_ID" && !mState.isNew){
					_alert("사용중인 자산ID가 있습니다.");
					ip2_checked = false;
					return;					
				}else if(rsMsg == "EXIST_IP") {
					_alert("이미 자산에 등록된 IP입니다.");
					ip2_checked = false;
					return;
				}else if(rsMsg == "EMPTY_IP" || rsMsg == "OK") {
					ip2_checked = true;
				}else{
					_alert("처리 중 에러가 발생하였습니다. 관리자에게 문의하세요.");
					return;
				}

				if(ip1_checked && ip2_checked) 
					saveAsset(beforeSips,beforeEips);
			}
		});
	},
	
	saveAsset = function(sips,eips){
		var afterClose = m$.form.find('.btn-save').data('after-close') == true ? true : false;	
		var data = _SL.serializeMap(m$.form);
		
		$.extend(data ,{sips : sips, eips : eips});
		
		$('body').requestData(mState.mode.action, data, {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(afterClose);
					}
				});
			}
		});
	},
	
	onDelete = function(){
		
		var assetId = m$.pAssetId.val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {asset_id: assetId}, {
					callback : function(rsData, rsCd, rsMsg){
						_alert(rsMsg, {
							onAgree : function(){
								onClose(afterClose);
							}
						});
					}
				});
			}
		});
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},

	_equipInfo = function(){
		var data = slapp.parser.eqpPopupList.getParam();
		
		m$.listTable.find("tr").each(function(idx, elem) {
			if(idx > 1) $(this).remove();
		});
		
		m$.form.find("[name=ip_type]").each(function() {
			if($(this).val() == 4) {
				$(this).prop("checked", true);
			} else {
				$(this).prop("checked", false);
			}
		});
		
		ipTypeChg(4);
		
		m$.form.find("[name=asset_nm]").val(data.eqp_nm);
		m$.form.find("[name=sip]").val(data.eqp_ip);
		m$.form.find("[name=eip]").val(data.eqp_ip);
		
		m$.form.find("[name=group_cd]").val(data.group_cd);
		m$.form.find("[name=eqp_type_cd]").val(data.eqp_type_cd);
		m$.form.find("[name=eqp_type_cd]").trigger('chosen:updated');

		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	_addCode = function($fld) {
		var data = slapp.comcode.form.getCode();

		$fld.append('<option value="'+data.code_id+'">'+data.code_name+'</option>');
		$fld.val(data.code_id);

		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	_addCodeChosen = function($fld) {
		var data = slapp.comcode.form.getCode();

		$fld.append('<option value="'+data.code_id+'">'+data.code_name+'</option>');
		$fld.val(data.code_id);
		$fld.trigger('chosen:updated');
	};
	
	return {
		init: init
	};

}();

$(function(){
	slapp.asset.form.init();
});