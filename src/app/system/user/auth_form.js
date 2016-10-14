//# sourceURL=auth_form.js

'use strict';


_SL.nmspc("auth").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formAuth',
		menuTreeId : "#authMenuTree",
		urlSelect : gCONTEXT_PATH + "system/auth_list.json",
		urlSave : gCONTEXT_PATH + "system/auth_save.do",
		urlRoleForm : gCONTEXT_PATH + "system/role_form.html",
		urlExist : gCONTEXT_PATH + "system/role_nm_exist.json"
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		menuTree : $(mCfg.menuTreeId),
		roleId : $(mCfg.formId + ' [name=role_id]')
	},
	
	// 현재 상태 변수
	mState = {
		tree : null
	},
	
	init = function(){
		
		// 이벤트 Binding
		bindEvent();
		
		// 데이타 조회
		m$.roleId.trigger("change");
	},
	
	bindEvent = function() {
		// Role Change
		m$.roleId.on("change", onChangeRole);
		
		// Save Button
		m$.form.find('.btn-save').on('click', onClickSave);
		
		// Role Update Button
		m$.form.find('.btn-role-form').exModalPopup(mCfg.urlRoleForm, {
			width:300,
			height:135,
			onOpen:_setRole,
			onClose:_changeRoleNm
		});
	},
	
	onChangeRole = function() {
		var	rqData = {'role_id': m$.roleId.val()};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : _makeTree});
	},
	
	_makeTree = function(menuAuthList) {
		// generator tree
		var authMenuTreeData = {title: "전체", key : "ALL", icon : "/resources/imgs/plugins/dynatree/base.gif", children : []};

		var data, hiddenMenu = [], nodes = {};
		
		for(var i = 0, l = menuAuthList.length; i < l; i++) {
			data = menuAuthList[i];
			
			if(data.menu_div == 'M' || data.menu_div == 'P') {
				nodes[data.group_key] = {title : data.menu_nm, isFolder : true, children : []};
				
				if(data.menu_level == 1)
					authMenuTreeData.children.push(nodes[data.group_key]);
				else
					nodes[data.p_group_key].children.push(nodes[data.group_key]);
			}
			if(data.menu_div == 'F') {
				nodes[data.group_key].children.push({
					title : data.menu_nm, select : data.sel_opt == "true", key : data.menu_id, menu_cate : data.menu_cate
				});
			}
			if(data.menu_div == 'H') {
				hiddenMenu.push({menu_id : data.menu_id, menu_cate: data.menu_cate});
			}
		}
		
		m$.menuTree.dynatree({
			minExpandLevel : 3,
			checkbox: true,
			selectMode: 3,
			children : [authMenuTreeData],
			onExpand:function(){
				m$.form.parents('.nano').nanoScroller();
			}
		});
		
		if(mState.tree)
			mState.tree.reload();
		else
			mState.tree = m$.menuTree.dynatree("getTree");
	},
	
	onClickSave = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		var submit = function() {
			var selNodes = mState.tree.getSelectedNodes();
			
			var menuList = $.map(selNodes, function(node){
				if (node.data.key.charAt(0) != '_' && node.data.key != "ALL") 
					return node.data.key;
			});
			
			var rqData = {
				role_id : m$.roleId.val(),
				menu_list : menuList
			};
		
			$('body').requestData(mCfg.urlSave, rqData, {
				callback : function(rsData, rsCd, rsMsg) {
					_alert(rsMsg);
				}
			});
		};
		
		_confirm("저장 하시겠습니까?", {onAgree : submit});
	},
	
	// slapp.role.form 연계용
	_setRole = function() {
		slapp.role.form.setRole(m$.roleId.val(), m$.roleId.find(":selected").text());
	},
	
	_changeRoleNm = function() {
		m$.roleId.find(":selected").text(slapp.role.form.getRole().role_nm);
		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	dummy = null;
	
	return {
		init: init
	};

}();

$(function(){
	slapp.auth.form.init();
});