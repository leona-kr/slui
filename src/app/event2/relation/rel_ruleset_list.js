//# sourceURL=rel_ruleset_list.js
'use strict';

_SL.nmspc("relRulesetlist").list = function() {

	var
	// Config 정의
	mCfg = {
		formId : '#searchRelRuleset',
		gridId : '#gridRelRuleset',
		urlList : gCONTEXT_PATH + 'event2/rel_ruleset_list.json',
		urlForm : gCONTEXT_PATH + 'event2/rel_ruleset_form.html',
		urlOnOff: gCONTEXT_PATH + 'event2/rel_ruleset_onoff.json'
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
		var levelStrArr = ['Low','Middle','High'];
		var levelClsArr = ['label-success','label-attention','label-danger'];
		
		var gridSource = {
			datatype: "json",
			datafields: [
			    { name: "ruleset_id", type: "string"},
				{ name: "use_yn", type: "string"},
				{ name: "event_nm", type: "string"},
				{ name: "event_cate_nm", type: "string"},
				{ name: "event_level", type: "string"},
				{ name: "times", type: "string"},
				{ name: "time_nm", type: "string"}
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
			/*
			beforeLoadComplete: function(rows) {
				for (var i in rows) {
					rows[i].reg_dt = _SL.formatDate(rows[i].reg_dt, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
				}
				return rows;
			},
			*/
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
			enablehover: false,
			rendergridrows: function(obj){
				return obj.data;
			},
			columns: [
				{ 
					text: '상태', datafield: 'use_yn', cellsalign:'center', width:70,
					cellsrenderer: function (row, column, value, defaulthtml,columnproperties, rowdata) {
						var btnStatus = "on";
						var btnVal = "1";
						
						if(value =="N"){
							btnStatus = "off";
							btnVal = "0";
						}  
						return $(defaulthtml).html('<button type="button" data-ruleset_id="'+rowdata.ruleset_id+'" class="onoff-icon btn-switch-'+ btnStatus +'" value="'+ btnVal +'" data-switch-toggle="true"><span class="text-on">ON</span><span class="text-off">OFF</span></button>')[0].outerHTML;
					}
				},
				{
					text: '번호', columntype: 'number', cellsalign:'center', width:50,
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ 	text: '이벤트명', datafield: 'event_nm', width:'39%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '분류', datafield: 'event_cate_nm', cellsalign:'center' },
				{ text: '등급', datafield: 'event_level',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<span class="'+levelClsArr[value-1]+'">'+levelStrArr[value-1]+'</span>')[0].outerHTML;
					} },
				{ text: '체크 주기', datafield: 'time_nm', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html(rowdata.times + value)[0].outerHTML;
					}
				}
			]
		});

		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'event_nm'){
				var rulesetId = event.args.row.bounddata.ruleset_id;
				viewDetail(mCfg.urlForm +'?ruleset_id='+rulesetId,true);
			}
		});
	},

	bindEvent = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnApply = m$.grid.parent().siblings('.grid-bottom').find('.btn-apply');
		
		//체크주기이벤트
		setTimes();
		m$.form.find('[name=s_time_type]').on("change",function(){
			setTimes();
		});
		
		//검색
		m$.form.find('.form-submit').on('click',function(){
			refresh();
		});
		
		//등록
		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm,false);
		});
		
		//적용
		$btnApply.off().on('click',function(){
			fnOnOff();
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
	
	setTimes = function(){
		var gTimeUnit = {
				"1" : [1,2,3,5,10,15,30],
				"2" : [1,2,3,6,12],
				"3" : [1]
		};
		
		var $sTimesObj = m$.form.find('[name=s_times]');
		var $sTimesTypeObj = m$.form.find('[name=s_time_type]');
		var sType = $sTimesTypeObj.val();
		var oTimes = $sTimesObj.empty()[0]; 
		
		if(sType != "") {
			if(sType != "3"){
				$sTimesObj.append('<option>전체</option>');
			}
			
			for(var i in gTimeUnit[sType]){
				$sTimesObj.append('<option value="'+gTimeUnit[sType][i]+'">'+gTimeUnit[sType][i]+'</option>');
			}
			setTimeout(function(){
				slui.attach.setTransformSelect(mCfg.formId);
			},10);
		}

		if(sType == "1" || sType == "2"){
			$sTimesObj.prop('disabled',false);
		} else {
			$sTimesObj.prop('disabled',true);
		}
		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(_url, _setScroll){
		var modal = new ModalPopup(_url, {
			width : 800,
			height : 600,
			setScroll: _setScroll,
			onClose : function(){
				refresh();
			}
		});
	};

	return {
		init: init
	};
}();


$(function(){
	slapp.relRulesetlist.list.init();
});