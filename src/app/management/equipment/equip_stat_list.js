'use strict';

_SL.nmspc("equipment").statList = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'management/equip_stat_list.json',
		formId : '#searchEquipStatList',
		gridId : '#gridEquipStatList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
	},
	
	init = function() {
		
		m$.form.find('[name=s_eqp_type_cd]').chosen({search_contains : true });
		
		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 설정
		m$.form.find('.btn-submit').off().on('click',function(){
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
		});
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "eqp_type_cd", type: "string"},
				{ name: "eqp_type_nm", type: "string"},
				{ name: "eqp_id", type: "string"},
				{ name: "eqp_nm", type: "string"},
				{ name: "eqp_ip", type: "string"},
				{ name: "collect_allow_time", type: "string"},
				{ name: "agent_ip", type: "string"},
				{ name: "stat_chk_port", type: "string"},
				{ name: "stat_chk_msg", type: "string"},
				{ name: "stat_chk_type", type: "string"},
				{ name: "stat_result", type: "string"},
				{ name: "collect_yn", type: "string"},
				{ name: "stat_chk_time", type: "string"},
				{ name: "last_collect_time", type: "string"}
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
					if(rows[i].last_collect_time != "-") rows[i].last_collect_time = _SL.formatDate(rows[i].last_collect_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
				}
				return rows;
			},
			formatData : function(data) {
				var params = {}, param, flds = $(mCfg.formId).serializeArray();
				for(param in flds) {
					params[flds[param].name] = flds[param].value;
				};
				$.extend(data, params);
				
				return data;
			},
			loadComplete : function () {
				setToolTip();
			},
			loadError: function(xhr, status, error){
				_1(error);
			}
		});

		$grid.jqxGrid({
			source: dataadapter,
			sortable: true,
			width: '100%',
			virtualmode: true,
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
				{ text: '장비명', datafield: 'eqp_nm'},
				{ text: '장비종류', datafield: 'eqp_type_nm', width:'15%', cellsalign:'center'},
				{ text: '장비 IP', datafield: 'eqp_ip', width:'18%', cellsalign:'center'},
				{ text: '수집상태', datafield: 'collect_yn', width:'10%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						
						var strTooltip;
						switch(rowdata.collect_allow_time){
						case 5 :
						case 10 :
						case 30 :
							strTooltip = rowdata.collect_allow_time + "분";
							break;
						case 60 :
						case 180 :
						case 360 :
						case 720 :
							strTooltip = (rowdata.collect_allow_time / 60) + "시간";
							break;
						case 1440 :
							strTooltip = "1일";
							break;
						default :
							strTooltip = "장비의 정상수집 허용기간";
							break;
						}
						
						if(value == "Y") 
							return $(defaulthtml).html('<span class="label-success hasTooltip" data-value="\['+ strTooltip +' 기준\]">수집</span>')[0].outerHTML;
						else if(value == "N")
							return $(defaulthtml).html('<span class="label-danger hasTooltip" data-value="\['+ strTooltip +' 기준\]">미수집</span>')[0].outerHTML;
					}
				},
				{ text: '상태', datafield: 'stat_result', cellsalign:'center', width:'10%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(rowdata.stat_chk_type == '-'){
							
							return $(defaulthtml).html('-')[0].outerHTML;
						}else{
							
							var strTooltip = '* 최종 체크 시간 \['+ rowdata.stat_chk_time +'\]';
							
							if(value == 'normal')
								return $(defaulthtml).html('<span class="label-success hasTooltip" data-value="'+ strTooltip +'">정상</span>')[0].outerHTML;
							else if(value == 'abnormal')
								return $(defaulthtml).html('<span class="label-danger hasTooltip" data-value="'+ strTooltip +'">비정상</span>')[0].outerHTML;
						}
					}
				},
				{ text: '최종 수집시간', datafield: 'last_collect_time', cellsalign:'center', width:'12%'},
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'eqp_nm'){}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},
	
	setToolTip = function() {
		setTimeout(function(){
			m$.grid.find('.hasTooltip').each(function(index){
				var text = $(this).data('value');
				$(this).jqxTooltip({position: 'mouse', content: text });
			});
		}, 500);			
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.equipment.statList.init();
});