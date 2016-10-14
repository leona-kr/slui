'use strict';

_SL.nmspc("integrity").list = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'system/integrity_list.json',
		urlChkIntegrity : gCONTEXT_PATH + 'system/integrity_check.json',
		urlUpdateIntegrity : gCONTEXT_PATH + 'system/integrity_update.do',
		formId : '#searchIntegrityList',
		gridId : '#gridIntegrityList',
		dialogId : '#view_detail'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		dialog : $(mCfg.dialogId)
	},
	
	init = function() {
		var $btnUpdate = m$.grid.parent().siblings('.grid-bottom').find('.btn-update');

		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 설정
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
		});

		$btnUpdate.off().on('click',function(){
			
			var	listId = [];
			var idxs = [];
			
			var selectedrowindex = $.map(m$.grid.find("[name=chk_idx]"), function(o) {
				if (o.checked) return o.value;
			});
			
			var displayobj = m$.grid.jqxGrid('getdisplayrows');
			var isBlank = false;
			var message ="";

			for( var key in displayobj){
				for(var i=0, len = selectedrowindex.length; i<len; i++){
					if( selectedrowindex[i] == displayobj[key].boundindex){
						idxs.push(displayobj[key].boundindex);
					}
				}
			}

			if (idxs.length > 0){
				for(var i = 0, l = idxs.length; i < l; i++) {
					var rowData = m$.grid.jqxGrid('getrowdata', idxs[i]);
					if(rowData.cur_md5 === ""){
						message += "[시스템 : "+rowData.system_nm+"] [파일명 : "+rowData.file_nm+"]<br/>";
					}
					
					listId.push(rowData.integrity_id);
				}
				
				if(message != ""){
					message += "파일이없어 Update 할수 없습니다.";
					_alert(message);
					return;
				}
				
				updateIntegrity(listId);
				
			}else{
				_alert("변경할 건을 선택하세요.");
			}
		});
		
		m$.dialog.jqxWindow({
			height: 100, width: 500, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5
		});

	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "integrity_id", type: "string"},
				{ name: "system_nm", type: "string"},
				{ name: "file_path", type: "string"},
				{ name: "file_nm", type: "string"},
				{ name: "ori_md5", type: "string"},
				{ name: "ori_md5_dt", type: "string"},
				{ name: "cur_md5", type: "string"},
				{ name: "cur_md5_dt", type: "string"},
				{ name: "change_opt", type: "string"}
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
			
			loadComplete : function () {
				m$.grid.find('.iconscontainer').remove(); //그리드 헤더의 jqxCheckBox가 클릭이 안되는 상황때문에 sort icon 블럭 제거
				setToolTip();
			},
			
			loadError: function(xhr, status, error){
				alert(error);
			}
		});

		$grid.jqxGrid({
			source: dataadapter,
			sortable: true,
			width: '100%',
			selectionmode: 'none',
			virtualmode: true,
			rendergridrows: function(obj){
				return obj.data;
			},
			columns: [
				{ text: '', sortable: false, width:40, cellsalign:'center',
				   renderer: function () {
					   return '<div style="margin-left: 7px; margin-top: 5px;"></div>';
				   },
				
				   rendered: function (element) {
					   $(element).jqxCheckBox({ width: 30, height: 16, animationShowDelay: 0, animationHideDelay: 0 });
				
					   $(element).bind('change', function (event) {
						   m$.grid.find('[name=chk_idx]').prop("checked", event.args.checked);
					   });
				   },
				
				   cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
					   if(rowdata.change_opt == 'Y')
						   return $(defaulthtml).html('<input type="checkbox" name="chk_idx" value="'+ rowdata.boundindex +'" class="form-transform"><span class="form-clone"></span>')[0].outerHTML;
				   }
				},
				{
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ text: '시스템명', datafield: 'system_nm', width:'12%', cellsalign:'center'},
				{ text: '파일명', datafield: 'file_nm', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strPath = rowdata.file_path;
						return  $(defaulthtml).html('<label class="hasTooltip" data-value="'+ strPath +'">'+ value +'</label>')[0].outerHTML;
					}
				},
				{ text: '상태', datafield: 'change_opt', width:'10%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value == "Y") 
							return $(defaulthtml).html('&nbsp;<span class="label-danger text-danger">비정상</span>')[0].outerHTML;
						else if(value == "N")
							return $(defaulthtml).html('&nbsp;<span class="label-success">정상</span>')[0].outerHTML;
					}
				},
				{ text: '원본', datafield: 'ori_md5', width:'20%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var changeOpt = rowdata.change_opt;
						var strVal = value.substring(0,30) + (value.length > 30 ? '...' : '');
						
						if(changeOpt == "Y")
							return $(defaulthtml).html('<div style="cursor:pointer;" class="text-danger">'+ strVal +'</div>')[0].outerHTML;
						else if(changeOpt == "N")
							return $(defaulthtml).html('<div style="cursor:pointer;">'+ strVal + '</div>')[0].outerHTML;
					}
				},
				{ text: '현재', datafield: 'cur_md5', width:'20%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var changeOpt = rowdata.change_opt;
						var strVal = value.substring(0,30) + (value.length > 30 ? '...' : '');

						if(changeOpt == "Y")
							return $(defaulthtml).html('<div style="cursor:pointer;" class="text-danger">'+ strVal +'</div>')[0].outerHTML;
						else if(changeOpt == "N")
							return $(defaulthtml).html('<div style="cursor:pointer;">'+ strVal + '</div>')[0].outerHTML;
					}
				},
				{ text: '무결성검사', datafield: 'Edit', columntype: 'button', width:100,
					cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties, rowdata) {
						return "검사";
					}, 
					buttonclick: function (row) {
						var dataRecord = $grid.jqxGrid('getrowdata', row);

						checkIntegrity(dataRecord.file_path, dataRecord.file_nm, dataRecord.system_nm);
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'agent_nm'){
				var agentid = event.args.row.bounddata.agent_id;
				viewDetail(mCfg.urlForm +'?agent_id='+agentid);
			}
			
			if(event.args.datafield === 'inspection'){
				viewAgentControl(event.args.row.bounddata.agent_ip);				
			}
			
			if(event.args.datafield === 'ori_md5'){
				
				var data = event.args.row.bounddata;
				if(data.ori_md5.length > 0) openDialog(data.ori_md5, data.cur_md5);
			}else if(event.args.datafield === 'cur_md5'){
				
				var data = event.args.row.bounddata;
				if(data.cur_md5.length > 0) openDialog(data.ori_md5, data.cur_md5);
			}
		});
	},
	
	openDialog = function(ori_md5,cur_md5) {
		m$.dialog.find("#view_text_ori").text("원본 :"+ ori_md5);
		m$.dialog.find("#view_text_cur").text("현재 :"+ cur_md5);
		m$.dialog.jqxWindow({ position: 'center'});
		m$.dialog.jqxWindow('open');
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid('clearselection');
		setToolTip();
	},
	
	setToolTip = function() {
		setTimeout(function(){
            $(".hasTooltip").each(function () {
            	var text = $(this).data('value');
                $(this).jqxTooltip({ position: 'mouse', content: text });
            });
		}, 500);
	},

	updateIntegrity = function(listId){
		$('body').requestData(mCfg.urlUpdateIntegrity, {id_list:listId}, {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						refresh();
					}
				});
			}
		});		
	},
	
	checkIntegrity = function(file_path, file_name, systemName){
		
		var filePath = file_path;
		var oFileName = file_name;
		var nFileName = file_name;
		
		if(nFileName.indexOf(".jar") != (-1)) nFileName = "../"+nFileName; 
		
		$('body').requestData(mCfg.urlChkIntegrity, {filePath:filePath ,nFileName :nFileName, systemName : systemName ,oFileName : oFileName}, {
			callback : function(rsMap, rsCd, rsMsg){
				_alert(rsMap.message, {
					onAgree : function(){
						refresh();
					}
				});
			}
		});		
	};
	
	
	return {
		init : init
	};

}();

$(function(){
	slapp.integrity.list.init();
});