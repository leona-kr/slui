"use strict";_SL.nmspc("inc").gnb=function(){var a={layers:"#section-header-layers",urlLogout:gCONTEXT_PATH+"login/logout.do",urlUserInfo:gCONTEXT_PATH+"main/main_simpleUserInfo.html"},b={layers:null},c=function(c,f,g){$(function(){b.layers=$(a.layers),$.fn.gnbMenu&&c&&$("header").gnbMenu(c.child,f,g),b.layers.find(".btn-logout").on("click",d),b.layers.find(".btn-userInfo").on("click",e)})},d=function(){location.href=a.urlLogout},e=function(){new ModalPopup(a.urlUserInfo,{height:580})};return{init:c}}(),_SL.nmspc("inc").mymenu=function(){var a={urlRead:gCONTEXT_PATH+"main/mymenu_list.json",urlPage:gCONTEXT_PATH+"main/mymenu_form.html"},b=function(){$(function(){c(),$("header .btn-setting").on("click",e)})},c=function(){$("body").requestData(a.urlRead,{},{callback:function(a){d(a)}})},d=function(a){if($("header .group-mymenu").size()<1)return!1;for(var b=".nav-global",c=$("header .group-mymenu").empty(),d=0,e=a.length;d<e;d++){var f=$(b+" a[data-id="+a[d]+"]");if(f.size()>0){var g=(f.attr("href"),f.text(),$("<span />").addClass("item-menu").appendTo(c)),h=$("<a />").attr({href:f.attr("href"),"data-id":a[d]}).text(f.text()).appendTo(g);271==a[d]&&h.attr("target","_blank")}}},e=function(){new ModalPopup(a.urlPage,{width:900,height:450,onClose:function(){c()}})};return{init:b}}(),$(function(){slui.headerlayer.init(),$(".header-layer-board .btn-link").on("click",function(){return window.open($(this).attr("href"),"boardPopup","toolbar=no,location=no,directory=no,status=no,menubar=no,height=800,width=1200,scrollbars=no,resizable=yes"),!1}),$("#btnHistory").on("click",function(){var a=$(this).attr("href");new ModalPopup(a,{width:700,height:640});return!1}),$("#dialLicence").on("click",function(){var a=$(this).attr("href");new ModalPopup(a,{width:400,height:130});return!1}),slui.notices.pushalram(),slui.notices.notice()});