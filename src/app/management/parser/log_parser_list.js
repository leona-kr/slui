'use strict';

_SL.nmspc("parser").logList = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'management/log_parser_list.json',
		urlForm : gCONTEXT_PATH + 'management/log_parser_manager_form.html',
		formId : '#searchLogParserList',
		gridId : '#gridLogParserList',
		logPsrDetailId : '#log_parser_detail_dlg',
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		logPsrDetail : $(mCfg.logPsrDetailId),
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');

		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 설정
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
		});
		
		m$.logPsrDetail.jqxWindow({
			height: 520, width: 750, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5
		});

		$btnAdd.off().on('click',function(){
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
				if(slapp.parser.logForm.selectLogParser){
					slapp.parser.logForm.selectLogParser(addList);
					
					m$.grid.parent().siblings('.grid-bottom').find('.btn-cancel').click();
				}
				else{
					_alert("호출한 페이지가 없거나 변경되었습니다.");
				}
			}
			else {
				_alert("추가할 로그파서를 선택하세요.");
			}			
		});
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
			    { name: "log_psr_id", type: "string"},
				{ name: "log_psr_nm", type: "string"},
				{ name: "log_type_cd", type: "string"},
				{ name: "log_type_nm", type: "string"},
				{ name: "log_cate_cd", type: "string"},
				{ name: "log_cate_nm", type: "string"},
				{ name: "handle_type", type: "string"},
				{ name: "handle_type_nm", type: "string"},
				{ name: "handle_opt", type: "string"},
				{ name: "log_cate_value", type: "string"},
				{ name: "sample", type: "string"},
				{ name: "psr_xml", type: "string"},
				{ name: "description", type: "string"}
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
			sortable: true,
			width: '100%',
			selectionmode: 'checkbox',
			virtualmode: true,
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
				{ text: '로그파서명', datafield: 'log_psr_nm',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '로그타입', datafield: 'log_type_nm', width:'10%', cellsalign:'center'},
				{ text: '구분방법', datafield: 'handle_type_nm', width:'15%', cellsalign:'center'},
				{ text: '구분Option', datafield: 'handle_opt', width:'12%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						
						var strVal = value;
						
						if(rowdata.handle_type == 1){
							strVal = '구분자(';
							strVal += value.split("|")[0].replace("@P@","|") + ') ';
							strVal += (parseInt(value.split("|")[1]) + 1) + '번째';
						}
						
						return  $(defaulthtml).html(strVal)[0].outerHTML;
					}
				},
				{ text: '구분값', datafield: 'log_cate_value', width:'12%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strVal = value.length > 25 ? value.substring(0,24) + '....' : value;
						
						return  $(defaulthtml).html(strVal)[0].outerHTML;
					}
				},
				{ text: '로그분류', datafield: 'log_cate_nm', cellsalign:'center'}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'log_psr_nm'){
				var data = event.args.row.bounddata;
				
				m$.logPsrDetail.find('[name=log_cate_value]').val(data.log_cate_value);
				m$.logPsrDetail.find('[name=sample]').val(data.sample);
				m$.logPsrDetail.find('[name=psr_xml]').val(data.psr_xml);
				m$.logPsrDetail.find('[name=description]').val(data.description);
				
				m$.logPsrDetail.jqxWindow('open');
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.parser.logList.init();
});