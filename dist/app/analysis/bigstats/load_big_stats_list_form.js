_SL.nmspc("bigStatsManager").loadBigStatsForm=function(){var a={formId:"#loadBigStatsList",urlList:gCONTEXT_PATH+"analysis/load_big_stats_list.json",mngUrlForm:gCONTEXT_PATH+"analysis/big_stats_manager_form.html?page_type=big_stats_mng_load"},b={form:$(a.formId),bigCode:$(a.formId+" [name=big_code]")},c=function(){d(),b.form.find(".btn-save").on("click",e)},d=function(){$("body").requestData(a.urlList,{},{callback:function(a){var c=a;if(c.length>0)for(var d in c){var e=c[d];$("<option/>").attr({value:e.big_code}).text(e.stats_nm).appendTo(b.bigCode)}b.bigCode.chosen()}})},e=function(){var c=b.bigCode.val();slapp.bigStatsManager.list.viewDetail(a.mngUrlForm+"&big_code="+c),f(!0)},f=function(a){a&&b.form.find("[data-layer-close=true]").click()};return{init:c}}(),$(function(){slapp.bigStatsManager.loadBigStatsForm.init()});