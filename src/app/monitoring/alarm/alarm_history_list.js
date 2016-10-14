'use strict';

_SL.nmspc("alarm").histroyList = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'monitoring/alarm_history_list.json',
		alarmDivId : '.group-alarm-history',
		infoPageId : '#formInfoPage'
	},
	
	m$ = {
		alarmDiv : $(mCfg.alarmDivId),
		infoPage : $(mCfg.infoPageId)
	},
	
	gList,
	
	init = function() {
		drawTree();
	},

	drawTree = function(){
		$('body').requestData(mCfg.urlList, {}, {
			displayLoader : true,
			callback : function(rsData, rsCd, rsMsg){
				
				var list = rsData.list;
				gList = list;
				
				var eventDay;
				var strHref;
				var $areaDiv = $("<div class='alarms-area'>"); // 데이터 Tree
				var i = 0;

				if(list.length>0){
					while(i < list.length){
						var data = list[i];
						var $itemDiv = $("<div class='alarm-item'>"); // 시간별 그룹 Area
						var $timeDiv = $("<div class='time-label'><i class='icon-clock'></i>"+ _SL.formatDate(data.event_hour, "HHmm", "HH:mm") +"</div>"); // 시간 Area
						var $messageDiv = $("<div class='message'>"); // 건수 및 메세지 Area
						var $cntDiv = $("<div class='cnt'><strong>"+ data.grp_cnt +"</strong>건 발생</div>"); // 건수 Area
						
						var strTxt = "";
						
						for(var j=0 ; j < data.grp_cnt; j++){
							
							if(list[i + j].info_page){
								strHref ="javascript:slapp.alarm.histroyList.linkInfoPage('" + parseInt(i + j) + "')";
								strTxt += "<a href=\""+strHref+"\">" + list[i + j].alarm_nm + " " + list[i + j].alarm_deco+"</a><br>";
							}else{
								strTxt += list[i + j].alarm_nm + " " + list[i + j].alarm_deco+"<br>";
							}
						}
						
						var	$txtDiv = $('<div class="txt">'+ strTxt +'</div>'); //메세지 Area

						$messageDiv.append($cntDiv).append($txtDiv);
						
						$itemDiv.append($timeDiv).append($messageDiv);
						
						$areaDiv.append($itemDiv);
						
						i += data.grp_cnt;
					}
					
					//Tree Draw
					m$.alarmDiv.append("<div class='date-label'>"+ _SL.formatDate(data.event_day, "yyyyMMdd", "yyyy년 MM월 dd일") +"</div>");
					m$.alarmDiv.append($areaDiv);
					
				}else{
					m$.alarmDiv.addClass('list-empty').text('최근 알람이 없습니다');
				}
			}
		});
	},
	
	linkInfoPage = function(idx){
		
		var data = gList[idx];
		var startDate,endDate;
		
		switch(data.alarm_cd){
		case '4' : // 유해IP
			startDate = _SL.formatDate.addMin(data.event_time, -4);
			endDate = _SL.formatDate.addMin(data.event_time, -3);
			break;
		case '5' : // 성능정보이벤트
			startDate = _SL.formatDate.addMin(data.event_time, -3);
			endDate = _SL.formatDate.addMin(data.event_time, -2);
			break;
		default :
			startDate = _SL.formatDate.addMin(data.event_time, -1);
			endDate = data.event_time;
			break;
		}
		
		m$.infoPage[0].reset();
		
		m$.infoPage.find('[name=start_time]').val(startDate);
		m$.infoPage.find('[name=end_time]').val(endDate);
		
		var winName = "infoPageWin_" + (new Date()).getTime();
		
		m$.infoPage.attr({
			action : data.info_page,
			target : winName,
			method : "post"
		}).submit();
	};
	
	return {
		init : init,
		linkInfoPage : linkInfoPage
	};

}();

$(function(){
	slapp.alarm.histroyList.init();
});