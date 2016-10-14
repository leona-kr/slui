//# sourceURL=login_user_list.js
'use strict';

_SL.nmspc("user").logined = function() {

	var
	// Config 정의
	mCfg = {
		gridId : '#gridLoginUser',
		formId : '#searchLoginUser',
		urlList : gCONTEXT_PATH + 'system/login_user_list.json',
		urlDisconnect : gCONTEXT_PATH + "system/disconnect_user.do"
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId)
	},
	
	init = function(){
		var $btnDisconnect = m$.grid.parent().siblings('.grid-bottom').find('.btn-disconnect');

		drawGrid( m$.grid );

		m$.form.find('.form-submit').on('click',function(){
			refresh();
		});

		$btnDisconnect.off().on('click', function(){
			var	listUser = [],
				idxs = m$.grid.jqxGrid('getselectedrowindexes');

			if (idxs.length > 0){
				for(var i = 0, l = idxs.length; i < l; i++) {
					listUser.push(m$.grid.jqxGrid('getrowdata', idxs[i]).user_id);
				}
				
				disconnectUser(listUser);
			}
			else {
				_alert("선택한 사용자가 없습니다.");
			}
		});
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "user_id", type: "string"},
				{ name: "user_nm", type: "string"},
				{ name: "mobile_no", type: "string"},
				{ name: "mail_addr", type: "string"},
				{ name: "group_nm", type: "string"},
				{ name: "last_conn_dt", type: "string"}
			],
			root: 'rows',
			beforeprocessing: function(data){
				if (data != null){
					gridSource.totalrecords = data.totalRows;
				}
			},

			cache: false,
			url: mCfg.urlList
		},

		dataadapter = new $.jqx.dataAdapter(gridSource, {
			beforeLoadComplete: function(rows) {
				for (var i in rows) {
					if(!!rows[i].last_conn_dt) 
						rows[i].last_conn_dt = _SL.formatDate(rows[i].last_conn_dt, 'yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm:ss');
				}
				return rows;
			},
			formatData : function(data) {
				var params = {}, param, flds = m$.form.serializeArray();
				for(param in flds) {
					params[flds[param].name] = flds[param].value;
				};
				$.extend(data, params);

				return data;
			},
			loadError: function(xhr, status, error){
				alert(error);
			}
		});

		$grid.jqxGrid({
			source: dataadapter,
			sortable: true,
			width: '100%',
			virtualmode: true,
			selectionmode: 'checkbox',
			enablehover: false,
			rendergridrows: function(obj){
				return obj.data;
			},
			columns: [
				{
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ text: '아이디', datafield: 'user_id' },
				{ text: '이름', datafield: 'user_nm', cellsalign:'center',width:'15%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '기관', datafield: 'group_nm',width:'15%' },
				{ text: '휴대폰번호', datafield: 'mobile_no', cellsalign:'center',width:'15%' },
				{ text: '이메일', datafield: 'mail_addr' },
				{ text: '최근접속시간', datafield: 'last_conn_dt', cellsalign:'center',width:'15%' }
			]
		});

		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'user_nm'){
				var userid = event.args.row.bounddata.user_id;
				disconnectUser([userid]);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	disconnectUser = function(listUser){
		//step1. 사용자 확인
		_confirm("선택한 사용자를 로그아웃 하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDisconnect, {user_list:listUser}, {
					callback : function(rsData){
						refresh();
					}
				});
			}
		});
	};

	return {
		init: init
	};
}();


$(function(){
	slapp.user.logined.init();
});