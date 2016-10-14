//# sourceURL=user_tagging_sql_list.js
'use strict';

_SL.nmspc("tagging").sqlList = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'sysdata/user_tagging_sql_list.json',
		
		formId : '#formTaggingSqlList',
		gridHeadId	: '#gridTaggingSqlListHead',
		gridId : '#gridTaggingSqlList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		gridHead : $(mCfg.gridHeadId),
		grid : $(mCfg.gridId),
		
		sqlStmt  : $(mCfg.formId + ' [name=sqlStmt]'),
		currPage : $(mCfg.gridHeadId + ' [name=currPage]')
	},
	
	init = function() {
		// 초기 화면 구성
		drawList();
		
		// 이벤트 Binding
		bindEvent();
		
		//sql확인 
		chkSql();
	},
	
	chkSql = function(){
		if(rsMsg == "ERROR"){
			_alert("SQL에 오류가 있습니다.", {
				onAgree : function(){
					self.close();
				}
			});
		}else if(rsMsg == "OK"){
			slapp.tagging.form.setSqlCheck();
		}
	},
	
	bindEvent = function(){
		//Paging start
		m$.gridHead.find('.btn-prev').off().on('click',function(){
			goPrev();
		});
		
		m$.gridHead.find('.btn-next').off().on('click',function(){
			goNext();
		});
		
		m$.currPage.off().on('keydown',function(){
			goPage();
		});
		
		m$.gridHead.find('[name=pageRow]').change(function(){
			refresh();
		});
	},
	
	//Paging event start
	goPrev = function(){
		var currPage = parseInt(m$.currPage.val());
		
		if(currPage == 1){
			return;
		}else if(m$.currPage.data('total-page') == 0 ){
			m$.currPage.val(1);
			return;
		}
		
		m$.currPage.val(currPage - 1);
		
		refresh();
	},

	goNext = function(){
		var currPage = parseInt(m$.currPage.val());
		
		if(currPage == m$.currPage.data('total-page')){
			return;
		}else if(m$.currPage.data('total-page') == 0){
			m$.currPage.val(1);
			return;
		}
		
		m$.currPage.val(currPage + 1);
		
		refresh();
	},
	
	goPage = function(){
		var num = (event.srcElement || event.target).value;
		var totalPage = parseInt(m$.currPage.data('total-page'));
		if (event.keyCode == 13) {
			if(isNaN(num) || parseInt(num) < 1 || parseInt(num) > totalPage) {
				return;
			}else{
				$('#currPage').val(num);
				refresh();
			}
		}
	},
	
	drawList = function(){
		var params = $.extend({}, _SL.serializeMap(m$.form),{pagesize : m$.form.find("[name=pageRow]").val()});
		
		$('body').requestData(mCfg.urlList, params, {
			callback : function(rsData, rsCd, rsMsg){

				m$.grid.empty();
				var $thead = $('<thead>');
				var $tbody = $('<tbody>');
				var $tr = $('<tr>');
				
				if(rsData){
					var list = rsData.sqlList;
					
					//검색,페이징관련 값들 맵핑
					//_SL.setDataToForm(rsData, m$.gridHead);
					$('#sqlTotalCnt').text(_SL.formatNumber(rsData.totalCount));
					$('#sqlSpanTotalPage').text(_SL.formatNumber(rsData.totalPage));
					m$.currPage.data('total-page',rsData.totalPage);
					
					var listHead = Object.keys(list[0]);
					var len = listHead.length > 2 ? 2 : listHead.length;

					// th start
					$tr.append('<th scope="col" style="width:50px;">번호</th>');
					
					for(var idx =0; idx < len; idx++){
						$tr.append('<th scope="col">'+ listHead[idx] +'</th>');
					}
				
					$thead.append($tr);
					// th end
				
					// td start
					for(var outerIdx in list){
						
						$tr = $('<tr>');
						
						var data = list[outerIdx];
						
						$tr.append('<td class="align-center">'+ (parseInt(outerIdx)+1+rsData.recordstartindex) +'</td>');

						for(var innerIdx =0; innerIdx < len; innerIdx++){
							$tr.append('<td class="align-center">'+ data[listHead[innerIdx]] +'</td>');
						}
						
						$tbody.append($tr);
					}
					// td end
					
					m$.grid.append($thead).append($tbody);
				
				}else{
					
					// th start
					$tr.append('<th scope="col">번호</th>');
					$thead.append($tr);
					// th end
					
					$tr = $('<tr>');
					
					// td start
					$tr.append('<td class="list-empty">There is no Search Result</td>');
					// td end
					
					$tbody.append($tr);
				}

				m$.grid.append($thead).append($tbody);
			}
		});
	},
	
	refresh = function() {
		drawList();
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.tagging.sqlList.init();
});