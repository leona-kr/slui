<%@ page language="java" contentType="text/html;charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ page import="java.util.*, java.text.*" %>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta charset="utf-8">
<title>eyeCloudSIM</title>
<link rel="icon" href="/resources/images/favicon-16.ico" sizes="16x16">
<link rel="icon" href="/resources/images/favicon-32.ico" sizes="32x32">

<link rel="stylesheet" href="<c:url value="/resources/css/common.css" />">
<link rel="stylesheet" href="<c:url value="/resources/css/plugins.css" />">

<!-- plugins -->
<script src="<c:url value="/resources/fw/jquery.min.js" />"></script>
<script src="<c:url value="/resources/fw/json2.js" />"></script>
<script src="<c:url value="/resources/fw/overthrow.min.js" />"></script>
<script src="<c:url value="/resources/fw/fusioncharts.js" />"></script>
<script src="<c:url value="/resources/fw/plugins.min.js" />"></script><%-- chosen.jquery.min.js, jquery.nanoscroller.min.js, jquery-ui.custim.js, jquery.cookie.min.js, dynatree.min.js --%>
<script src="<c:url value="/resources/fw/jqx.ecs.min.js" />"></script>

<script src="<c:url value="/resources/js/i18n/sl.messages-ko.js" />"></script>

<script src="<c:url value="/resources/js/common.ui.js" />"></script>
<script src="<c:url value="/resources/js/sl.ui.js" />"></script>

<script src="<c:url value="/resources/js/sl.util.js" />"></script>
<script src="<c:url value="/resources/js/sl.form.js" />"></script>
<script src="<c:url value="/resources/timeline/api/timeline-api.js" />"></script>

<script>
	var gCONTEXT_PATH = "<c:url value='/' />".split(";")[0];
	var gDISPLAY_ALARM = "${sessionScope.USER_SESSION.alarm_mode}";
</script>

<script src="<c:url value="/resources/js/angular.min.js" />"></script>
</head>
