//# sourceURL=search_ruleset_list.js
'use strict';

_SL.nmspc("searchRuleset").list = function() {

	var
	// Config 정의
	mCfg = {
		gridId : '#gridSearchRuleset',
		formId : '#searchSearchRuleset',
		urlList : gCONTEXT_PATH + 'event/search_ruleset_list.json',
		urlForm : gCONTEXT_PATH + 'event/search_ruleset_form.html',
		urlOnOff: gCONTEXT_PATH + 'event/search_ruleset_onoff.json',
		urlImportForm : gCONTEXT_PATH + 'event/search_ruleset_import_form.html',
		urlDownload : gCONTEXT_PATH + 'event/search_ruleset_export.do'
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId)
	},
	
	init = function(){
		
		// 초기 화면 구성
		drawGrid(m$.grid);
		
		// 이벤트 Binding
		bindEvent();
		
	},
	
	
	drawGrid = function($grid){
		var 
			levelStrArr = ['Low','Middle','High'],
			levelClsArr = ['label-success','label-attention','label-danger'];
		
		var gridSource = {
			datatype: "json",
			datafields: [
			    { name: "ruleset_id", type: "string"},
				{ name: "use_yn", type: "string"},
				{ name: "event_nm", type: "string"},
				{ name: "event_cate_nm", type: "string"},
				{ name: "event_level", type: "string"},
				{ name: "cvt_group_field", type: "string"},
				{ name: "limit_count", type: "string"},
				{ name: "distinct_count", type: "string"}
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
					text: '상태', datafield: 'use_yn', width:50, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml,columnproperties, rowdata) {
						var btnStatus = "on";
						var btnVal = "1";
						
						if(value =="N"){
							btnStatus = "off";
							btnVal = "0";
						}
						return $(defaulthtml).css('margin-top','4px').html('<button type="button" data-ruleset_id="'+rowdata.ruleset_id+'" class="onoff-icon btn-switch-'+ btnStatus +'" value="'+ btnVal +'" data-switch-toggle="true"><span class="text-on">ON</span><span class="text-off">OFF</span></button>')[0].outerHTML;
					}
				},
				{
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ 	text: '이벤트명', datafield: 'event_nm', width:'25%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '분류', datafield: 'event_cate_nm', cellsalign:'center'},
				{ text: '등급', datafield: 'event_level', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<span class="'+levelClsArr[value-1]+'" style="float:left;margin-left:10px;">'+levelStrArr[value-1]+'</span>')[0].outerHTML;
					} 
				},
				{ text: '기준필드', datafield: 'cvt_group_field', width:'18%'},
				{ text: '임계치', datafield: 'limit_count', cellsalign:'center', width:100,
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var cvtLmCnt = value;
						
						if(rowdata.distinct_count) cvtLmCnt = value +'/'+rowdata.distinct_count;
						return $(defaulthtml).html(cvtLmCnt)[0].outerHTML;
					}
				}
			]
		});

		$grid.on("cellclick", function (event){
			
			if(event.args.datafield === 'event_nm'){
				var rulesetId = event.args.row.bounddata.ruleset_id;
				viewDetail(mCfg.urlForm +'?ruleset_id='+rulesetId);
			}

		});
	},
	
	bindEvent = function() {
		var 
			$btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add'),		
			$btnImport = m$.grid.parent().siblings('.grid-bottom').find('.btn-import'),
			$btnApply = m$.grid.parent().siblings('.grid-bottom').find('.btn-apply'),
			$btnDownload = m$.form.find('.btn-download');
		
		//검색
		m$.form.find('.form-submit').on('click',function(){
			refresh();
		});
		
		//등록
		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm);
		});		
		
		//적용
		$btnApply.off().on('click',function(){
			fnOnOff();
		});
		
		//엑셀다운로드
		$btnDownload.off().on('click',function(){
			excelDownLoad();
		});
		
		//불러오기
		$btnImport.off().on('click',function(){
			var modal = new ModalPopup(mCfg.urlImportForm, {
				height:175,
				onClose : function(){
					refresh();
				}
			});
		});
	},	
	
	fnOnOff = function(){
		var chkInfo = [];
		
		m$.grid.find("*[class*='btn-switch-']").each(function(){
			chkInfo.push({
				ruleset_id	: $(this).data("ruleset_id"),
				use_yn		: $(this).val() == "1" ? "Y" : "N"
			});
		})
		
		if(chkInfo.length == 0) {
			_alert("On/Off 적용할 건을 선택하세요.");
		}else{
			_confirm("적용 하시겠습니까??", {
				onAgree : function(){
					$('body').requestData(mCfg.urlOnOff,  chkInfo, {
						callback : function(rsData, rsCd, rsMsg){
							refresh();
							_alert(rsMsg);
						}
					});
				},
				onDisagree : function(){
					return;
				}
			});
		}
	},	
	
	excelDownLoad = function(){
		m$.form.attr({
			action : mCfg.urlDownload
		}).submit();
	},	

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:800,
			height:500,
			onClose : function(){
				refresh();
			}
		});
	},
	
	deleteBlacklist = function(delList){
		//step1. 사용자 확인
		_confirm("삭제 하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {del_ip_list:delList}, {
					callback : function(rsData){
						refresh();
					}
				});
			}
		});
	},
	
	excelDownLoad = function(){
		if(!_SL.validate(m$.form)) return;
		m$.form.attr({
			action : mCfg.urlDownload
		}).submit();
	}

	return {
		init: init
	};
}();


$(function(){
	slapp.searchRuleset.list.init();
});