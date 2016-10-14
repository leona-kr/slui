//# sourceURL=goDetailAndWrite.js
'use strict';
_SL.nmspc("DetailAndWrite").mode;
_SL.nmspc("DetailAndWrite").boardName;
_SL.nmspc("DetailAndWrite").boardType;
_SL.nmspc("DetailAndWrite").boardIndex;
_SL.nmspc("board").DetailAndWrite = function() {

	// Config 정의	
	var
	maxleng = 150,
	Count = 0,
	
	mCfg = {
		formId		:		$("#detailAndWriteform")
	},
	
	// JQuery 객체 변수	
	m$ = {
		
	},

	init = function() {
		// 초기 화면 구성
		$('.multi-file').MultiFile({ 
			STRING: {
				remove: '<button type="button" class="btn-basic btn-xs icon-times" title="삭제">'
			}
		 }); 
		
		$("form").keypress(function(event){
			if( event.which == '13' ){_SL.enterNext();}//엔터입력시 다음 입력칸으로 
		});

		
		$("#comet_cont").keyup( function() {
			var charLimit = 1000;
			if($("#comet_cont").val().length > charLimit) {
				this.value = this.value.substring(0,charLimit);
				return false;
			} else {
				$("#textlength").text($("#comet_cont").val().length);
			}
		});
		display( $("#YnChk").val() );
		
		if($('.area-list li').size()==0){
			$('.area-list').hide();
		}else{
			$('.area-list').show();
		}
		
		//팝업만료일자 change 이벤트
		expiredDateChangeEvent();
		
		//write form save btn click event
		$(".write-save").on("click", function(){
			checkInvalid();
		});
		
		$(".btn-submit").on("click", function(){
			jsSaveComent();
		});
		
		$("td .filedown").on("click", function(){
			jsFiledownload ( $(this).attr("data-fileSeq") );
		});
		
		
		
		slui.attach.setTransformSelect(mCfg.formId);
		
		bindEvent();
	},
	bindEvent = function() {
		
		$(".area-list").on("click"," .btn-delete",function (){
			
			var obj = $(this);
			
			_confirm("댓글을 삭제하시겠습니까?",{
				onAgree : function(){
					
					var Seq = obj.attr("data-comment_no");
					$("#comment_no").val(Seq);

					$('body').requestData("/board/DeleteCommon.do",  _SL.serializeMap( $("form") ), {
						
						
						callback : function(rsData, rsCd, rsMsg){
							if(rsCd=="SUC_COM_0000"){
								$("#comment_no").val("");
								$(obj).parent().parent().remove();	
								$(".tit").text("댓글("+ rsData.comment_size +")")
							}else{
								_alert("저장 처리중 에러가 발생했습니다.<br>다시 실행하세요.");
							}
						}
					});	
				}
			});	
		});
		
		$("#btn-detail-delete").on("click",function(){
			jsDelete();
		});
		
		$("#btn-detail-modify").on("click",function(){
			jsmodify();
		});
		
		$("#btn-detail-list").on("click",function(){
			cancel();
		});
		
		$("#btn-detail-write").on("click",function(){
			jsDab()
		});

		$('#comet_cont').keyup(function (e){
			var content = $(this).val();
			$('.txt-cnt').html('('+content.length + '/1000)');
		});

		$(".write-cancel").on("click", function(){
			cancel();
		})
		
		
		$("#timeSet").change(function(){
			var setMin = this.value;
			var nTime = _SL.formatDate("yyyyMMdd");
			
			if (setMin == 0) {
				$("#popup_expire_dt").val("");
			}else{
				var startDate = _SL.formatDate.addMin(nTime+"0000", setMin);
				$("#popup_expire_dt").val(startDate.substring(0,8));
			}

		});
		
		// 만료일자 change 이벤트 설정
		$("#popup_expire_dt").change(function(){
			$("#timeSet").val(0);
		});
		
		$("#popup_timeSet").hide();
		$("#popup_date").hide();
		$("#popup_label").hide();
		
		$("#popup_check").change(function(){
			if( $("#popup_check").val()=="N" ){
				$("#popup_timeSet").hide();
				$("#popup_date").hide();
				$("#popup_label").hide();
			}else{
				$("#popup_timeSet").show();
				$("#popup_date").show();
				$("#popup_label").show();
				slui.attach.setTransformSelect('#popup_timeSet');
			}
		})
	},

	modifySetting = function(obj,str){
		$(obj).val(str);
	},

	jsmodifySave = function(){
		var form = document.form;
		if (!_SL.validate()) return;
		
		if($("#popup_check").val() == "Y"){
			if($.trim( $("#popup_expire_dt").val()) != ""){//만료일자가 입력되었다면 valid체크!!
				var nTime = _SL.formatDate("yyyyMMdd");
				var eTime = $.trim( $("#popup_expire_dt").val());
				var dateRegExp = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[1,2][0-9]|3[0,1])$/;
				 
				if(!dateRegExp.test(eTime)){
					_alert("팝업의 만료일자가\n올바른 날짜 형식(yyyyMMdd)이 아닙니다.");
					return;
				}
				if(nTime > eTime) {
					_alert("팝업의 만료일이\n현재시간보다 작습니다.");
					return;
				}
			}
		}
		
		var rx = RemoveXSS($("#bd_subject").val());
		var removeXssStr = RemoveXSSTwo(rx);
		$("#bd_subject ").val('');
		$("#bd_subject ").val(removeXssStr);
		
		oEditors.getById["bd_cont"].exec("UPDATE_CONTENTS_FIELD", []);

		$(".write-save").on("click", function(){
			checkInvalid();
		})

		$("#detailAndWriteform")[0].action = "/board/modifySave.do";
		
		$("#detailAndWriteform").submit();

	},
	
	jsmodify = function(){
		
		oEditors.getById["bd_cont"].setIR($("#bd_cont_temp").val());
		
		modifySetting($("#bd_subject"),$("#modifysubject").text().trim());
		
		$('body').requestData("/board/BoardModify.json",  _SL.serializeMap( $("form") ), {
			
			
			callback : function(rsData, rsCd, rsMsg){
				var rsJson = rsData;
				if(rsCd=="SUC_COM_0000"){
					$("#writeform > table").find("tr").eq(1).after("<tr><th>기존파일</th><td id='listFiles'></td></tr>");
					for(var dataidx in rsJson){
						if(dataidx =="Filelist"){
							//rsJson['Filelist'][idx]['bf_seq']
							for(var idx in rsJson["Filelist"]){
								$("#listFiles").append("<span id='span_"+rsJson['Filelist'][idx]['bf_seq']+"'>"+rsJson["Filelist"][idx]["org_name"]+"</span> <button type='button' class='btn-basic btn-xs icon-times' title='삭제' alt='"+rsJson['Filelist'][idx]['bf_seq']+"' ></button><br>");
							}
						} 
					}
					

					$("#listFiles").on('click','button' ,function (){
						var FileSeq= $(this).attr("alt");
						if(Count ==0){
							$("#fileDeleteList").val($(this).attr("alt"));
							Count++;
						} else {
							$("#fileDeleteList").val($("#fileDeleteList").val()+","+$(this).attr("alt"));
						}
						$(this).remove();
						$("#span_"+FileSeq).remove();
					});

					if(rsData.BoardList[0].popup_expire_dt != ""){
						$("#popup_timeSet").show();
						$("#popup_date").show();
						$("#popup_label").show();
						$("#popup_expire_dt").val(rsData.BoardList[0].popup_expire_dt);
					}
					slui.attach.setTransformSelect('table');
				}else{
					_alert("저장 처리중 에러가 발생했습니다.<br>다시 실행하세요.");
				}
			}
		});

		$("#divform1").hide();
		$("#divform2").show();
		$("#writeform").show();
		$("#Detailform").hide();

		//여기서 저장을 save로 바꾸고
		$(".write-save").on("click", function(){
			jsmodifySave();
		})
		
		
	},

	jsDab = function(){
	

		$("#writeChk").val("Y");
		$("#StartChk").val("");
		
		$("#detailAndWriteform")[0].action = "/board/goDetailAndWrite.html";
		
		$("#detailAndWriteform").submit();
	
	},

	jsSaveComent = function(){

		if($("#comet_cont ").val()=="" || typeof $("#comet_cont ").val() =="undefined"){
			return false;
		}
		var rx = RemoveXSS($("#comet_cont ").val());
		var removeXssStr = RemoveXSSTwo(rx);
		$("#comet_cont ").val('');
		$("#comet_cont ").val(removeXssStr);
		
		$('body').requestData("/board/goComentSave.json",  _SL.serializeMap( $("form") ), {
			callback : function(rsData, rsCd, rsMsg){
				var rsJson = rsData;
				
				if(rsCd=="SUC_COM_0000"){
					
					$(".tit").text("댓글("+ rsData.length +")")
					$(".area-list ul").empty();

					$(".area-list").show();
					for(var idx in rsData){
						var data = rsData[idx];
						var Close = data["YN"] =="YES"|| $("#role_id") =='1' ? "<button type='button' class='btn-basic btn-xs btn-delete' data-comment_no=" + data["comment_no"] + ">삭제</button>" : ""; 

					$(".area-list ul").append("<li><div class='sp-info'>"
													+data["user_nm"]
													+data["reg_dt"]
													+Close
													+"</div>"
													+ "<div class='data_div sp-text'>"
													+data["comment_cont"]
													+"</div></li>");
						
						
					}
					/*$("div .fr").each(function(){
						$(this).show();
					});
					$("div .fr_js").each(function(){
						$(this).hide();
					});*/
					$("#comet_cont").val('');
					//$("#DivComent").hide();
				}else{
					_alert("저장 처리중 에러가 발생했습니다.<br>다시 실행하세요.");
				}
			}
		});
	},

	/*jsComent = function(str){
		if(str=="fr"){
			$("#textlength").text(0);//댓글 글자수체크 초기화
			$("div .fr").each(function(){
				$(this).hide();
			});
			$("div .fr_js").each(function(){
				$(this).show();
			});
			//$("#DivComent").show();
			$("#comet_cont").focus();
		}else {
			$("#textlength").text(0);//댓글 글자수체크 초기화
			$("div .fr").each(function(){
				$(this).show();
			});
			$("div .fr_js").each(function(){
				$(this).hide();
			});
			$("#comet_cont").val('');
			//$("#DivComent").hide();
		}
	},*/

	display = function(str){
		if(str =="Y"){
			$("#writeform").show();
			$("#Detailform").hide();
		} else {
			$("#writeform").hide();
			$("#Detailform").show();
		}
	},
	
	cancel = function() {
		$("form:first").attr({method:"POST", action:"/board/board_view.html"}).submit();
	},
	
	jsDelete = function(){
		
		_confirm("해당글을 삭제하시겠습니까?",{
			onAgree : function(){
				$("#detailAndWriteform")[0].action = "/board/BoardDelete.do";
				
				$("#detailAndWriteform").submit();
			}
		});
		
	
		
	},

	checkInvalid = function(){
		var form = document.form;
		if (!_SL.validate( $("#detailAndWriteform") )) return;
		
		if($("#popup_check").val() == "Y"){
			if($.trim( $("#popup_expire_dt").val()) != ""){//만료일자가 입력되었다면 valid체크!!
				var nTime = _SL.formatDate("yyyyMMdd");
				var eTime = $.trim( $("#popup_expire_dt").val());
				var dateRegExp = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[1,2][0-9]|3[0,1])$/;
				 
				if(!dateRegExp.test(eTime)){
					_alert("팝업의 만료일자가\n올바른 날짜 형식(yyyyMMdd)이 아닙니다.");
					return;
				}
				if(nTime > eTime) {
					_alert("팝업의 만료일이\n현재시간보다 작습니다.");
					return;
				}
			}
		}

		var rx = RemoveXSS($("#bd_subject").val());
		var removeXssStr = RemoveXSSTwo(rx);
		$("#bd_subject ").val('');
		$("#bd_subject ").val(removeXssStr);
		
		oEditors.getById["bd_cont"].exec("UPDATE_CONTENTS_FIELD", []);
		
		
		/*form.action = "/board/goSave.do";
		form.submit();
		*/
		$("#detailAndWriteform")[0].action = "/board/goSave.do";
		
		$("#detailAndWriteform").submit();
	},
	
	RemoveXSSTwo = function(XssStr){
		var RmXss = XssStr;
		RmXss= RmXss.replace(/<(\/)?[Ss][Cc][Rr][Ii][Pp][Tt](\/)?>/g,"");
		RmXss= RmXss.replace(/<(\/)?[Jj][Aa][Vv][Aa][Ss][Cc][Rr][Ii][Tt](\/)?>/g,"");
		RmXss= RmXss.replace(/[Dd][Oo][Cc][Mm][Ee][Nn][Tt][.][Cc][Oo][Oo][Kk][Ii][Ee]/g,"");
		RmXss= RmXss.replace(/<(\/)?[Ii][Ff][Rr][Aa][Mm][Ee](\/)?>/g,"");
		RmXss= RmXss.replace(/<(\/)?[Oo][Bb][Jj][Ee][Cc][Tt](\/)?>/g,"");
		RmXss= RmXss.replace(/<(\/)?[Ee][Mm][Bb][Ee][De](\/)?>/g,"");
		//RmXss= RmXss.replace(/<(\/)?[Ss][Cc][Rr][Ii][Pp][Tt](\s+)?[Tt][Yy][Pp][Ee](\=)[^...]?[Tt][Ee][Xx][Tt](\/)[Jj][Aa][Vv][Aa][Ss][Cc][Rr][Ii][Pp][Tt](\/)?[^...]?>/g,"");
		
		return RmXss;
	},
	
	jsFiledownload = function(seq){
		
	/*	var form = document.form;
		
		form.bf_seq.value=seq;
		form.action = "/board/BoardDownload.do";
		form.submit();
		*/
		
		$("#bf_seq").val(seq);
		$("#detailAndWriteform")[0].action = "/board/BoardDownload.do";
		
		$("#detailAndWriteform").submit();
		
	},

	expiredDateChangeEvent = function(){
		var datePickerOptions = {
				dateFormat : "yymmdd",
				changeMonth : true,
				changeYear : true,
				showAnim : "fadeIn"
		};
		
		if("${list[0].popup_check}" =="Y" ){
			$("#popup_expire_dt_span").show();
		}else{
			$("#popup_expire_dt_span").hide();
		}
		
		$("#popup_check").change(function(){
			if($( this ).val()=="N"){
				$("#popup_expire_dt_span").hide();
			}else{
				$("#popup_expire_dt_span").show();
			}
		});
		
		$("#popup_expire_dt").datepicker(datePickerOptions);
		// timeSet change 이벤트 설정
		$("#timeSet").change(function(){
			var setMin = this.value;
			var nTime = _SL.formatDate("yyyyMMdd");
			
			if (setMin == 0) {
				$("#popup_expire_dt").val("");
			}else{
				var startDate = _SL.formatDate.addMin(nTime+"0000", setMin);
				$("#popup_expire_dt").val(startDate.substring(0,8));
			}

		});
		
		// 만료일자 change 이벤트 설정
		$("#popup_expire_dt").change(function(){
			$("#timeSet").val(0);
		});
	},
	
	

	RemoveXSS = function(str) {
		 var content = str;
		 var EventList=new Array(
		  'document.cookie', 
		  'onabort', 'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate',  
		  'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus', 'onbeforepaste',  
		  'onbeforeprint', 'onbeforeunload', 'onbeforeupdate', 'onbegin', 'onblur',  
		  'onbounce', 'oncellchange', 'onchange', 'onclick', 'oncontentready',  
		  'oncontentsave', 'oncontextmenu', 'oncontrolselect', 'oncopy', 'oncut',  
		  'ondataavailable', 'ondatasetchanged', 'ondatasetcomplete', 'ondblclick', 'ondeactivate',  
		  'ondetach', 'ondocumentready', 'ondrag', 'ondragdrop', 'ondragend',  
		  'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop',  
		  'onend', 'onerror', 'onerrorupdate', 'onfilterchange', 'onfinish',  
		  'onfocus', 'onfocusin', 'onfocusout', 'onhelp', 'onhide',  
		  'onkeydown', 'onkeypress', 'onkeyup', 'onlayoutcomplete', 'onload',  
		  'onlosecapture', 'onmediacomplete', 'onmediaerror', 'onmedialoadfailed', 'onmousedown',  
		  'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover',  
		  'onmouseup', 'onmousewheel', 'onmove', 'onmoveend', 'onmovestart',  
		  'onopenstatechange', 'onoutofsync', 'onpaste', 'onpause', 'onplaystatechange',  
		  'onpropertychange', 'onreadystatechange', 'onrepeat', 'onreset', 'onresize',  
		  'onresizeend', 'onresizestart', 'onresume', 'onreverse', 'onrowclick',  
		  'onrowenter', 'onrowexit', 'onrowout', 'onrowover', 'onrowsdelete',  
		  'onrowsinserted', 'onsave', 'onscroll', 'onseek', 'onselect',  
		  'onselectionchange', 'onselectstart', 'onshow', 'onstart', 'onstop',  
		  'onsubmit', 'onsyncrestored', 'ontimeerror', 'ontrackchange', 'onunload',  
		  'onurlflip'  
		 );
		 
		 for(var i=0;  i< EventList.length; i++){
			var replacestr ="";
			if(EventList[i].indexOf("<") != -1) {
				replacestr = content.replace(EventList[i], "");
			} else {
				replacestr = content.replace(EventList[i], "");
			}
			content = replacestr;
		 }
		 return content; 
	},
	
	refresh = function() {
		
	};
	
	return {
		init : init,
		
	};

}();

$(function(){
	slapp.board.DetailAndWrite.init();
/*
	$('.multi-file').MultiFile({ 
		STRING: {
			remove: '<button type="button" class="btn-basic btn-xs icon-times" title="삭제">'
		}
	 }); */
});