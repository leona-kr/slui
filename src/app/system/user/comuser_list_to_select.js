'use strict';

_SL.nmspc("user").listSel = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'system/comuser_list_to_select.json',
		formId : '#searchComcodeListSel',
		gridId : '#gridComcodeListSel'
		//	,gridBottomId : '.grid-bottom'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		/*gridBottom : m$.grid.parent().siblings('.grid-bottom')
		*/
	},
	
	param = {
		userDataArr : [],
		userIdx : 0
	},
	
	getParam = function() {
		return param;
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');

		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 설정
		m$.form.find('.btn-submit').off().on('click',function(){
			refresh();
		});

		$btnAdd.off().on('click',function(){
			var afterClose = $(this).data('after-close') == true ? true : false;
			addUser(-1);
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
				{ name: "role_nm", type: "string"},
				{ name: "group_nm", type: "string"},
				{ name: "cust_nm", type: "string"},
				{ name: "reg_dt", type: "string"}
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
			formatData : function(data) {
				var params = {}, param, flds = $(mCfg.formId).serializeArray();
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
			sortable: false,
			width: '100%',
			virtualmode: true,
			selectionmode: 'checkbox',
			enablehover:false,
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
				{ text: '이름', datafield: 'user_nm', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '기관', datafield: 'group_nm' },
				{ text: '휴대폰번호', datafield: 'mobile_no', cellsalign:'center'},
				{ text: '이메일', datafield: 'mail_addr' },
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'user_nm'){
				var	addList = [];
				addList.push(event.args.row.bounddata);
				param.userDataArr = addList;
				 m$.grid.parent().siblings('.grid-bottom').find("[data-layer-close=true]").click();
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},
	
	addUser = function() {

		var	addList = [];
		var selectedrowindex = m$.grid.jqxGrid('selectedrowindexes');
		var displayobj = m$.grid.jqxGrid('getdisplayrows');
		var idxs = [];
		var data;

		for( var key in displayobj){
			for(var i=0, len = selectedrowindex.length; i<len; i++){
				if( selectedrowindex[i] == displayobj[key].boundindex){
					idxs.push(displayobj[key].boundindex);
				}
			}
		}
		
		if (idxs.length > 0){
			for (var i in idxs) {
				var rowData = m$.grid.jqxGrid('getrowdata', idxs[i]);
				if(!rowData) break; //체크박스동작관련 임시 소스( 전체 체크후 해제해도 virtual mode로 생성된 idx는 남아있음..)
				
				addList.push(rowData);
			}
			
			param.userDataArr = addList;
			//param.userIdx  = m$.form.find('[name=user_idx]').val();
			
			 m$.grid.parent().siblings('.grid-bottom').find("[data-layer-close=true]").click();
		}
		else {
			_alert("사용자를 선택하세요");
		}			
	};
	
	return {
		init : init,
		getParam : getParam
	};

}();

$(function(){
	slapp.user.listSel.init();
});