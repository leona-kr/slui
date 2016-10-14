<%@ page language="java" contentType="text/html;charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>


<link rel="stylesheet" href="<c:url value="/resources/css/dashboard.css" />" id="dashboardStyle">

<script src = "<c:url value="/resources/fw/fusioncharts.jqueryplugin.js" />"></script>
<script src="<c:url value="/resources/fw/jquery.gridster.custom.js" />"></script>

<script src="/resources/js/sl.biz.util.js"></script>
<script src="<c:url value="/resources/app/dashboard/dashboard.js" />"></script>

<script src="<c:url value="/resources/app/dashboard/component/collect_status.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/system_status.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/search_stats_top.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/search_stats_top_time.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/search_stats_top_total.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/search_stats_top_week.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/top5.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/search_event.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/eps_security_event.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/eps_security_risk.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/web_attack_top.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/performance_event.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/blacklist_event.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/rel_event.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/total_risk.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/interlock_status.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/my_group_log_search.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/my_log_search_count.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/my_log_search_event_ticker.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/my_log_search.js" />"></script>
<script src="<c:url value="/resources/app/dashboard/component/big_stats.js" />"></script>

<script>
/* _SL.formatNumber.Options.unitNames = "K,M,G,T";
_SL.formatNumber.Options.unitRange = 1024; */

var ComponentInfoList = ${component_list_json};
var LogCaptionInfo = ${log_caption_json};
var GroupCaptionInfo = ${group_caption_json};
var EventCaptionInfo = ${event_caption_json};
var CollectorList = ${col_list_json};
var AgentList = ${agt_list_json};
var EquipList = ${eqp_list_json};
var LogCategoryList = ${log_category_list_json};
<%-- var tooltip1 = "공유가 Y이고 공유대상을 미설정하면 전체공유 됩니다.\n"+
			   "공유가 N이면 공유대상에 상관없이 공유 되지 않습니다."; --%>
var ComCodes = {};

<%-- var myGroupSearchLimitRow = ${my_group_search_limit_row};
var myGroupSearchLimitMin = ${my_group_search_limit_min}; --%>

var gDashboardRefreshSecond = ${dashboard_refresh_sec};
var gDashboardMinRefreshSecond = ${dashboard_min_refresh_sec};

<%-- var minIntvlId;
var curMinIntvlChkTime = 0 ;
var maxMinIntvlChkTime = 0 ; */

var alarmCheckTime = ""; --%>
<jsp:useBean id="now" class="java.util.Date"/>
var gTimeDiffFromServer = _SL.formatDate.diff(_SL.formatDate("yyyyMMddHHmmss"), "<fmt:formatDate pattern="yyyyMMddHHmmss" value="${now}" />", "yyyyMMddHHmmss")/1000 | 0;

var gDFD = {
	/***
		Deferred[Delay Loading] Data를 사용하기 위해 각 데이타별로 data, url, load 설정
	 	데이타를 사용할 때는 아래 예와 같이 사용 
	 	예1) gDFD.fldToCodes.ready(function);
	 	예2) 초기화 : gDFD.fldToCodes.ready(), 사용 : $.when(gDFD.fldToCodes).then(function(args));
	 	예2) 초기화 : gDFD.fldToCodes.ready(), 사용 : $.when(gDFD.fldToCodes, $.getJSON(...)).then(function(args1, args2));
	 ***/
	fldToCodes : {
		data : null,
		url : gCONTEXT_PATH + "monitoring/code_list.json",
		load : function(rsJson, statusTxt, jqXHR) {
			// 필드명과 코드정보 Mapping(CodeType별 단일 객체 생성을 위해 화면에서 처리)
			for(var k in rsJson.data.fldToCodeTypes) {
				this.data[k] = rsJson.data.comCodes[rsJson.data.fldToCodeTypes[k]];
			}
		}
	}
};

gDFD.init = function() {
	for(var key in gDFD) {
		gDFD[key]["ready"] = function( fnc ) {
			if(this.data == null) {
				this.data = {};
				
				$.ajax({
						type : "post",
						url: this.url,
						contentType : "application/json",
						data : "{}",
						dataType : "json",
						success : $.proxy(this.load, this)
				})
				.promise(this);
			}
			
			this.done(fnc);
			
			return this;
		};
	}
}();

function gGetServerTime(pattern) {
	return _SL.formatDate.addSec(new Date(), gTimeDiffFromServer, pattern);
}

</script>

<div class="section-dashboard">

	<div class="group-tab">
		<button type="button" class="btn-add"><i class="icon-plus-circle"></i></button>
		<ul>
		</ul>
	</div>
	<div class="group-topbutton">
		<button type="button" class="btn-toggle"><i class="icon-chevron-down"></i></button>
	</div>

	<div class="group-side">
		<button type="button" class="btn-setting" title="대시보드 설정"><i class="icon-cog"></i></button>
		<button type="button" class="btn-report" title="보고서 다운로드"><i class="icon-download-square"></i></button>
		<span class="area-time"></span>
	</div>

	<div class="group-board" id="mainboard">
	</div>

	<button type="button" class="btn-addboard" title="컴포넌트 추가"><i class="icon-plus-circle"></i></button>
</div>






<!-- 대시보드 추가 레이어 -->
<div class="modal-dashboard-add">
	<div class="tab-group">
		<ul>
			<li class="tab-item-active"><button type="button" class="tab-button">신규대시보드</button></li>
			<li><button type="button" class="tab-button">공유대시보드</button></li>
		</ul>
	</div>
	<div class="cont">
		<div><input type="text" class="form-input"></div>
		<div><select class="form-select" data-size="10"></select></div>
	</div>
	<div class="button">
		<button type="button" class="btn-basic">추가</button>
	</div>
</div>

<!-- 대시보드 설정 레이어 -->
<div class="window dashboardsetting page-modal-area" style="display:none;z-index:8000;width:350px;height:auto;">
	<div class="modal-head">
		<button type="button" class="btn-close"><i class="icon-times"></i></button>
		<div class="section-title">
			<h2>대시보드 설정</h2>
		</div>
	</div>
	<div class="modal-body area-setting" style="height:463px;padding:0;background-color:#fafafa;border-style:solid;border-color:#7e7e7e;border-width:0 1px 1px;">
		<div class="sp-bundle" id="setting_name">
			<div class="tit tit-switch">
				<div class="text">
					<div class="name"></div>
					<span class="btns">
						<button type="button"><i class="icon-pencil"></i></button>
						<button type="button"><i class="icon-trash"></i></button>
					</span>
				</div>
				<div class="form">
					<input type="text">
					<span class="btns">
						<button type="button"><i class="icon-disk"></i></button>
						<button type="button"><i class="icon-times-circle"></i></button>
					</span>
				</div>
			</div>
		</div>
		<div class="sp-bundle" id="setting_grid">
			<div class="tit">
				<div class="text">그리드 보기</div>
				<button type="button" class="btn-switch-on" value="1" data-switch-toggle="true"><span class="text-on">SHOW</span><span class="text-off">HIDE</span></button>
			</div>
			<div class="txt-select">
				그리드 가이드
				<span class="form-select-outer">
					<select class="form-select">
						<option value="2">2단</option>
						<option value="3">3단</option>
						<option value="4">4단</option>
						<option value="5">5단</option>
					</select>
				</span>
			</div>
		</div>
		<div class="sp-bundle" id="setting_theme">
			<div class="tit">
				<div class="text">테마 선택</div>
			</div>
			<div class="ranges-group">
				<div class="range-3"><label><input type="radio" name="dashboard_theme">Basic</label></div>
				<div class="range-3"><label><input type="radio" name="dashboard_theme">Dark Blue</label></div>
				<div class="range-3"><label><input type="radio" name="dashboard_theme">Dark Gray</label></div>
			</div>
			<div class="button">
				<button type="button" class="btn-basic btn-theme">테마 적용</button>
			</div>
		</div>
		<div class="sp-bundle" id="setting_share">
			<div class="tit">
				<div class="text">공유설정 <span class="text-point">공유대상을 미설정하면 전체공유 됩니다.</span></div>
				<button type="button" class="btn-switch-on" value="1" data-switch-toggle="true"></button>
			</div>
			<div class="txt-search">
				공유 기관
				<div class="form-search-outer">
					<input type="text" class="form-input" placeholder="검색" data-target="layer-search-group"><button type="button" class="btn-search" data-target="layer-search-group">검색</button>
					<div class="layer-search-result" id="layer-search-group">
						<div class="nano">
							<ul class="nano-content">
							<c:forEach var="map" items="${groupCds}">
								<li data-cd="${map.key}">${map.value}</li>
							</c:forEach>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="list">
				<div class="nano">
					<ul class="nano-content"></ul>
				</div>
			</div>
			<div class="txt-search">
				공유 사용자
				<div class="form-search-outer">
					<input type="text" class="form-input" placeholder="검색" data-target="layer-search-user"><button type="button" class="btn-search" data-target="layer-search-user">검색</button>
					<div class="layer-search-result" id="layer-search-user">
						<div class="nano">
							<ul class="nano-content">
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="list">
				<div class="nano">
					<ul class="nano-content"></ul>
				</div>
			</div>
			<div class="button">
				<button type="button" class="btn-basic btn-apply">공유 적용</button>
			</div>
		</div>
	</div>
</div>

<!-- 컴포넌트 추가 레이어 -->
<div class="window componentadd page-modal-area" style="display:none;z-index:8000;width:238px;">
	<div class="modal-head">
		<button type="button" class="btn-close"><i class="icon-times"></i></button>
		<div class="section-title">
			<h2>컴포넌트 추가</h2>
		</div>
	</div>

	<div class="modal-body" style="height:372px;padding:0;background-color:#fafafa;border-style:solid;border-color:#7e7e7e;border-width:0 1px 1px;">
		<div class="area-list nano">
			<ul class="nano-content" id="componentaddlist"></ul>
		</div>
	</div>
</div>