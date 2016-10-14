'use strict';
_SL.nmspc("monitoring").mylogs_group_form = function(){

	var
	// Config 정의
	mCfg = {
			urlGroupList	: 	gCONTEXT_PATH + "monitoring/gGroup_List_Json.json",
			gridId 			: '#gridMylogGroupList',
			urlGetMylogGroupList : gCONTEXT_PATH + "monitoring/mylogs_list.json",
			logSearch : gCONTEXT_PATH + "monitoring/log_search.html",
			urlLink 		: gCONTEXT_PATH + "monitoring/mylogs_form.html",
			formId 			: '#searchMylogsGroup'
	},
	
	// JQuery 객체 변수
	
	m$ = {
		form		:	$("#searchMylogsGroup"),
		grid 	: $(mCfg.gridId),
		
	},

	init = function(){

		TreeManager.init();
		GroupManager.init();

		bindEvent();

		self.focus();

		$("#group_name").keypress(function(event){
			if( event.which == '13' ){event.preventDefault();}//submit방지
		});
	},
	
	bindEvent = function() {
		$(".btn-submit").off().on('click',function(){
			drawGrid(m$.grid);
		})
		
		$('#group_name').off().on('keyup',function (e){
			var content = $(this).val();
			if(content.length >= 50){
				_alert("50 글자를 초과했습니다");
			}
		});

		$(".write-cancel").off().on("click", function(){
			jsSubmit('CANCEL');
		})
	
	},
	
	drawMylogsForm = function($grid, $mylogs_id){
		$(".section-content").html(
			"<div id='windowMylistSetting'>"+
				"<div>내 검색 조건 설정</div>"+
				"<div>"+
					"<div class='ranges-group'>"+
						"<div class='range-2'><span class='form-label'>이름</span></div>"+
						"<div class='range-8'><input type='text' class='form-input'></div>"+
					"</div>"+
					"<div class='ranges-group'>"+
						"<div class='range-2'><span class='form-label'>설명</span></div>"+
						"<div class='range-8'><input type='text' class='form-input'></div>"+
					"</div>"+
					"<div class='ranges-group'>"+
					"	<div class='range-2'><span class='form-label'>표시 필드</span></div>"+
					"	<div class='range-8'><input type='text' class='form-input'></div>"+
					"</div>"+
					"<div class='ranges-group'>"+
					"	<div class='range-2'><span class='form-label'>공유</span></div>"+
					"	<div class='range-1'>"+
					"		<label class='form-label'><input type='radio' name='share_yn' value='Y'>Y</label>"+
					"	</div>"+
					"	<div class='range-1'>"+
					"		<label class='form-label'><input type='radio' name='share_yn' value='N'>N</label>"+
					"	</div>"+
					"	<div class='range-6 form-label text-success align-right'>*공유대상을 미설정하면 전체공유 됩니다.</div>"+
					"</div>"+
				"</div>"+
			"</div>"
		);
	},
	
	drawGrid = function($grid){
		var node_data_key = $("#s_group_id").val()
	
		var gridSource = {
				datatype: "json",
				datafields: [
					{ name: "cnt", type: "string"},
					{ name: "mylogs_name", type: "string"},
					{ name: "search_stime", type: "string"},
					{ name: "search_query", type: "string"},
					{ name: "save_count", type: "string"},
					{ name: "log_file_name", type: "string"},	
					{ name: "search_etime", type: "string"},	
					{ name: "mylogs_id", type: "string"},	
					
				
				],
				root: 'rows',
				beforeprocessing: function(data){
					if (data != null){
						gridSource.totalrecords = data.totalRows;
					}
				},

				cache: false,
				
				url: mCfg.urlGetMylogGroupList+"?s_group_id="+node_data_key
		},
		
		dataadapter = new $.jqx.dataAdapter(gridSource, {
			beforeLoadComplete: function(rows) {
				for (var i in rows) {
					rows[i].search_stime = _SL.formatDate(rows[i].search_stime, 'yyyyMMddHHmm', 'yyyyMMddHHmm');
					rows[i].search_etime = _SL.formatDate(rows[i].search_etime, 'yyyyMMddHHmm', 'yyyyMMddHHmm');
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
			loadError: function(xhr, status, error){
				_alert(error);
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
					text: '번호', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
			    },
			    { text: '이름', datafield: 'mylogs_name', cellsalign:'center', width:'18%',
			    	cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
			    		
			    		if( $("#s_group_id").val() == '0' ){
			    			return  $(defaulthtml).html(''+rowdata.mylogs_name)[0].outerHTML;
			    		}else{
			    			return  $(defaulthtml).html('<button type="button" class="btn-link" data-mylogs_id=' + rowdata.mylogs_id + '>' + rowdata.mylogs_name  + '</button>')[0].outerHTML;
			    		}
					}
			    },
			    { text: '발생시간', datafield: 'search_stime', cellsalign:'center', width:'20%',
				    cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){    
				    	var sTime = _SL.formatDate( rowdata.search_stime, 'yyyyMMddHHmm', 'MM-dd HH:mm');
				    	var eTime = _SL.formatDate( rowdata.search_etime, 'yyyyMMddHHmm', 'MM-dd HH:mm');
				    	return  $(defaulthtml).html( sTime +' ~ ' + eTime )[0].outerHTML;
					}
			    },
			    { text: '검색어', datafield: 'search_query'},
				{ text: '저장건수', datafield: 'save_count', cellsalign:'center', width:'12%'},
			    { text: '보기', datafield: 'log_file_name', cellsalign:'center', width:'12%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						if(rowdata.log_file_name == null){
							return  $(defaulthtml).html('<button type="button" class="btn-link" data-line=' + row + '>처리중</button>')[0].outerHTML;
						}else{
							
							return  $(defaulthtml).html('<button type="button" class="btn-link" data-line=' + row + '>결과보기</button>')[0].outerHTML;
						}
					}
			    }
			]
		});	
		
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'log_file_name'){
				goLogSearch( event.args.row.bounddata.search_stime, event.args.row.bounddata.search_etime , event.args.row.bounddata.search_query , event.args.row.bounddata.mylogs_id);
			}
			else if(event.args.datafield === 'mylogs_name'){
				goDetail(event.args.row.bounddata.mylogs_id );
			}
		});
		
	},

	goDetail = function(mylogs_id) {
		
		if($("#s_group_id").val() == "0") {
			_alert("공유 건은 수정할 수 없습니다.");
			return;
		}
		$("mylogs_id").val(mylogs_id);
		var link = mCfg.urlLink + "?mylogs_id="+mylogs_id;
		viewDetail(link);
		
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url,{
			height:300,
			onClose : function(){
				drawGrid(m$.grid);
			}
		});
		
	},

	goLogSearch = function(search_stime,search_etime,search_query,mylogs_id) {

		var $logSearchForm = m$.form.find("[name='logSearchForm']");

		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="filter_type">');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="popup" id="popup" value="Y">');
			$logSearchForm.append('<input type="hidden" name="mylogs_id">');
			
			m$.form.append($logSearchForm);
		}
		
		$("[name=start_time]", $logSearchForm).val(search_stime);
		$("[name=end_time]", $logSearchForm).val(search_etime);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val(search_query);
		$("[name=mylogs_id]", $logSearchForm).val(mylogs_id);
	
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.logSearch
		}).submit();
	};


	var GroupManager = function () {
		var $dlg;
		
		var
		init = function() {
			$dlg = $("#searchResultDlg");
			$dlg.jqxWindow({
				width: 440, height: 130, autoOpen: false,
				resizable: false, isModal: true, modalOpacity: 0.5
				
			});
			
			$(".btn-save", $dlg).click(function(){
				
				onDlgSave();
			})
			
			$("#dlgBottomDiv .btn-cancel").click(function(){
				$dlg = $("#searchResultDlg");
				$($dlg).jqxWindow('close');
			})

			$(".area-buttons .btn-add").click(onClickBtAdd);
			$(".area-buttons .btn-delete").click(onClickBtDel);
			$(".area-buttons .btn-modify").click(onClickBtUpd);

			onResize();
			$(window).resize(onResize);
			
		},
		
		onResize = function() {
			
			var sectionHeight = $("body").outerHeight() - $(".pop_area").outerHeight();
			$(".ifrm").css("height", sectionHeight + "px");
		},
		
		onClickBtAdd = function() {	
			//console.log("onClickBtAdd");
			var node = TreeManager.getCurNode();
			
			if(node.data.key == gShareGroup.key) {
				_alert(gShareGroup.title + "는 분류를 추가할 수 없습니다.");
				return;
			}
			
			$("[name=dlg_mode]", $dlg).val("1");
			$("[name=group_id]", $dlg).val("");
			$("[name=group_name]", $dlg).val("");
			$("[name=group_level]", $dlg).val(node.getLevel() + 1);
			$("[name=parent_group_id]", $dlg).val(node.data.key);

		
			$dlg = $("#searchResultDlg");
			
			
			$dlg.jqxWindow('open');
			/*$("#searchResultDlg").jqxWindow('open');*/
			
			
		},

		onClickBtDel = function() {
			
			var node = TreeManager.getCurNode();
			
			if(node.data.key == gShareGroup.key) {
				_alert(gShareGroup.title + "는 삭제할 수 없습니다.");
				return;
			}
			
			if(node.getLevel() == 1) {
				_alert("최상위 분류는 삭제할 수 없습니다.");
				return;
			}
			
			if(node.hasChildren()) {
				_alert("먼저 하위 분류를 삭제하세요.");
				return;
			}
			
			
			_confirm("삭제 하시겠습니까?<br>현재 분류에 존재하는 검색결과는 상위 분류로 이동됩니다.",{
				onAgree	:	function(){
					$.post("mylogs_group_delete.json", {group_id : node.data.key, parent_group_id : node.getParent().data.key}, function(rsJson, statusText, xhr) {
						
						if(rsJson.RESULT_CODE) {
							if(rsJson.RESULT_CODE == "0000") {
								
								TreeManager.delNode();
							}
							else _alert(rsJson.RESULT_MSG);
						}
						else _alert("처리중 에러가 발생했습니다.<br>다시 시도해 보세요.");
					})
					.fail(function(jqXHR, textStatus) {
						_alert("처리중 에러가 발생했습니다.(" + textStatus + ")<br>다시 시도해 보세요.");
					});
				}
			}
		)},
		
		onClickBtUpd = function() {
			
			var node = TreeManager.getCurNode();
		
			if(node.data.key == gShareGroup.key) {
				_alert(gShareGroup.title + "는 수정할 수 없습니다.");
				return;
			}
			
			$("[name=dlg_mode]", $dlg).val("2");
			$("[name=group_id]", $dlg).val(node.data.key);
			$("[name=group_name]", $dlg).val(node.data.title);
			$("[name=group_level]", $dlg).val("");
			$("[name=parent_group_id]", $dlg).val("");

			
			$dlg = $("#searchResultDlg");
			
			$($dlg).jqxWindow('open');
			
			
			
			/*$("#searchResultDlg").jqxWindow('open');*/
			
			
			
		},
		
		onDlgSave = function() {
			var that = this;
			var dlgMode = $("[name=dlg_mode]", $dlg).val();
			var groupId = $("[name=group_id]", $dlg).val();
			var groupName = $("[name=group_name]", $dlg).val();
			var strUrl;
			
			if(groupName == "") {
				_alert("분류명을 입력하세요.");
				return;
			}
			
			if(dlgMode == "1") strUrl = "mylogs_group_insert.json";
			else strUrl = "mylogs_group_update.json";
			
			$.post(strUrl, $("#group_dlg_form").serialize(), function(rsJson, statusText, xhr) {
				if(rsJson.RESULT_CODE) {
					if(rsJson.RESULT_CODE == "0000") {
						
						if(dlgMode == "1")
							TreeManager.addNode(groupName, rsJson.group_id);
						else 
							TreeManager.updNode(groupName);
						
						
						$dlg = $("#searchResultDlg");
						
						$($dlg).jqxWindow('close');
					}
					else _alert(rsJson.RESULT_MSG);
				}
				else _alert("처리중 에러가 발생했습니다.<br>다시 시도해 보세요.");
			})
			.fail(function(jqXHR, textStatus) {
				_alert("처리중 에러가 발생했습니다.(" + textStatus + ")<br>다시 시도해 보세요.");
			});
		};
		
		return {
			init			: init
			
		};
	}();
	
	
	var TreeManager = function() {
		var oKeyMap = {},
			oRootTreeData = null,
			oTree = null,

		init = function() {
			var oCurRow, oParent,
			params = _SL.serializeMap(m$.form),
			callback = function(rsData){
				var gGroupListJson = rsData.gGroupListJson;

				// Data 초기화
				for(var idx in gGroupListJson) {
					oCurRow = gGroupListJson[idx];
					oKeyMap[oCurRow.group_id] = {title : oCurRow.group_name, tooltip : oCurRow.group_name, key : oCurRow.group_id, children : []};
					oParent = oKeyMap[oCurRow.parent_group_id];

					if(!oParent) oRootTreeData = oKeyMap[oCurRow.group_id];
					else oParent.children.push(oKeyMap[oCurRow.group_id]);
				}
				// 공유 분류
				oRootTreeData.children.push({title : gShareGroup.title, tooltip : gShareGroup.title, key : gShareGroup.key})

				$("#mylogsGroupTree").dynatree({
					minExpandLevel : 2,
					autoFocus: true,
					clickFolderMode: 3,
					//activeVisible: true,
					onActivate: function(node) {
						$("#s_group_id").val(node.data.key);
				
						m$.grid.unbind();
						drawGrid(m$.grid);
					},
					children : [oRootTreeData]
				});

				oTree = $("#mylogsGroupTree").dynatree("getTree");

				if(gInitGroupId == -1){
					oTree.getNodeByKey(oRootTreeData.key).activate();
				}else{ 
					oTree.getNodeByKey(gInitGroupId).activate();
				}

				// 왼쪽 tree 영역 사이즈 세팅
				var t;
				setTimeout(function(){
					setTreeContainer();
				},400);
				$('#expandcontent .section-container').on('resize',function(){
					clearTimeout(t);
					t = setTimeout(function(){
						setTreeContainer();
					},300);
				});
			},
			setTreeContainer = function(){
				var treeContainerHeight = $('#expandcontent .section-container').height() - $('#expandcontent .section-tree-cols .area-buttons').outerHeight(true) - 10;
				$('#expandcontent .section-tree-cols ul.dynatree-container').height( treeContainerHeight +'px' );
			};

			$('body').requestData(mCfg.urlGroupList, params, {callback : callback});
		},
		
		getCurNode = function() { return oTree.getActiveNode(); },
		getCurId = function() { return getCurNode().data.key; },
		
		addNode = function(title, key) {
			var node = getCurNode();
			node.addChild({title : title, tooltip : title, key : key}).activate();
		},
		updNode = function(str) { getCurNode().setTitle(str); },
		delNode = function() {
			var node = getCurNode();
			var pNode = node.getParent();
			
			node.remove();
			pNode.activate();
		};
		
		return {
			init		: init,
			getCurNode	: getCurNode,
			getCurId	: getCurId,
			addNode		: addNode,
			updNode		: updNode,
			delNode		: delNode
		};
	}();

	return {
		init: init,
		GroupManager	:	GroupManager,
		TreeManager		:	TreeManager
	};
	
	

}();

$(function(){
	slapp.monitoring.mylogs_group_form.init();
});