'use strict';

_SL.nmspc("agent").list = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'management/agent_list.json',
		urlForm : gCONTEXT_PATH + 'management/agent_form.html',
		urlCtlAgent : gCONTEXT_PATH + 'management/jws_connector.do',
		formId : '#searchAgentList',
		gridId : '#gridAgentList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
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

		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm);
		});
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "collector_id", type: "string"},
				{ name: "collector_nm", type: "string"},
				{ name: "agent_id", type: "string"},
				{ name: "agent_nm", type: "string"},
				{ name: "agent_ip", type: "string"},
				{ name: "mac_addr", type: "string"},
				{ name: "collect_yn", type: "string"},
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
				{ text: 'Agent 이름', datafield: 'agent_nm', width:'18%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: 'Agent IP', datafield: 'agent_ip', cellsalign:'center'},
				{ text: 'Collector 이름', datafield: 'collector_nm', width:'17%'},
				{ text: 'Mac Address', datafield: 'mac_addr',width:'17%'},
				{ text: '수집상태(1시간이내)', datafield: 'collect_yn', cellsalign:'center', width:'12%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value == "Y") 
							return $(defaulthtml).html('<span class="label-success">수집</span>')[0].outerHTML;
						else
							return $(defaulthtml).html('<span class="label-danger">미수집</span>')[0].outerHTML;
					}
				},
				{ text: '에이전트 정보', datafield: 'agent_info', cellsalign:'center', width:'12%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link"><i class="icon-drive"></i> 보기</button>')[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'agent_nm'){
				var agentid = event.args.row.bounddata.agent_id;
				viewDetail(mCfg.urlForm +'?agent_id='+agentid);
			}
			
			if(event.args.datafield === 'agent_info'){
				viewAgentControl(event.args.row.bounddata.agent_ip);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:450, height:240,
			onClose : function(){
				refresh();
			}
		});
	},
	
	viewAgentControl = function(agentIp){
		var strUrl = gAgentControlUrl.replace(/@{AGENT_IP}/, agentIp);
		var $viewForm = $("#viewForm");
		
		if($viewForm.length == 0){
			$viewForm = $('<form id="viewForm">');
			$viewForm.append('<input type="hidden" name="str_url">');
			$viewForm.append('<input type="hidden" name="svr_type" value="Agent">');
			$("body").append($viewForm);
		}
		
		$("[name=str_url]", $viewForm).val(strUrl);
		
		$viewForm.attr({
			action : mCfg.urlCtlAgent
		}).submit();
	};
	
	
	return {
		init : init
	};

}();

$(function(){
	slapp.agent.list.init();
});