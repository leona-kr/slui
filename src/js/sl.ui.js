'use strict';

var slui = slui || {};
slui.attach = function() {
	var container = (container != undefined)? container : 'body',
	init = function(container){
		// attach datapicker
		setDatepicker();

		// transform ui
		setTransformSelect(container);

		// toggle layer 
		setToggleLayer(container);

		//checkbox, radio
		setTransforms(container);

		// nano scroller
		$(container+' .nano').nanoScroller();

		// switch button
		setSwitchToggle();

		// 폼에 input:text 하나일 경우 enter로 submit 방지
		preventSingleInputSubmit();

		// slui tooltip
		tooltip(container);
	},
	setDatepicker = function(){
		if($(container+' [data-datepicker=true]').size() > 0){
			$(container+' [data-datepicker=true]').each(function(){
				$(this).datepicker({
					dateFormat: "yymmdd",
					showOtherMonths: true,
					selectOtherMonths: true
				});
			});
		}
	},
	setTransforms = function(_container){
		$(_container).formDesign();
	},
	setTransformSelect = function(_container){
		if( $(_container).find('select').size() > 0){
			setTimeout(function(){
				$(_container).selectui();
			},0);
		}
	},
	setToggleLayer = function(_container){
		if( $(_container+' [data-toggle-handle=true]').size() > 0){
			$(_container+' [data-toggle-handle=true]').each(function(){
				if( $(this).data('toggle-target') != undefined ){
					var target = $(this).data('toggle-target'),
						toggleclass = $(this).data('toggle-class') ? $(this).data('toggle-class') : '';

					$(this).off().on('click',function(){
						$(target).toggle();
						$(this).toggleClass(toggleclass);
						setDatepicker(target);
						setTransformSelect(target);
					});
				}
			});
		}
	},
	setSwitchToggle = function(){
		$(container).on("click","[data-switch-toggle=true]",function(event){
			var classOn = 'btn-switch-on',
				classOff = 'btn-switch-off';
			if( $(this).hasClass(classOn) ){
				$(this).removeClass(classOn).addClass(classOff).val('0');
			} else {
				$(this).removeClass(classOff).addClass(classOn).val('1');
			}
			event.stopImmediatePropagation();
		});
	},
	tooltip = function(_container){
		var _makeElement = function(){
			if( !document.getElementById('slui-tooltip') ){
				$('body').append('<div id="slui-tooltip" class="slui-tooltip"><div class="slui-tooltip-text"></div></div>');
			}
		};
		if( $(container+' [data-ui=tooltip]').size() > 0 ){
			_makeElement();

			$(container+' [data-ui=tooltip]').each(function(){
				var text = $(this).attr('data-text');
				if(!text) text = $(this).data('text');
				if( !text ) return;

				$(this).off('mousemove','mouseleave').on('mousemove',function(event){
					var x = event.pageX+15, y = event.pageY+20;
					
					$('#slui-tooltip').css({
						left : x+'px',
						top : y+'px',
						opacity : 100,
						visibility : 'visible',
						display : 'block'
					});
					$('#slui-tooltip > div').html(text);
				}).on('mouseleave',function(){
					$('#slui-tooltip').css({
						opacity : 0,
						visibility : 'hidden',
						display : 'none'
					});
					$('#slui-tooltip > div').html('');
				});
			});
		}
	},
	preventSingleInputSubmit = function(){
		var form = document.querySelector(container).querySelector('form');
		if(!form) return false;

		if(form.querySelectorAll('input[type=text]').length === 1){
			form.setAttribute("onkeypress","return event.keyCode != 13;");
		}
	}

	return {
		init: init,
		setDatepicker: setDatepicker,
		setTransforms : setTransforms,
		setTransformSelect: setTransformSelect,
		setToggleLayer: setToggleLayer,
		setSwitchToggle: setSwitchToggle,
		tooltip: tooltip
	};
}();

slui.headerlayer = function(){
	var _init = function(){
		$('header .group-aside button:not(.btn-setting)').each(function(){
			var target = '.'+$(this).data('hover-target');
			_load($(this), target);
		});
	},
	_load = function( $element, target ){
		var outTimer, inTimer,
		outTime = 400, inTime = 400,
		classActive = 'open';
		
		var show = function(){
			if($(target).hasClass('header-layer-licence')){
				var left = $element.offset().left + $element.outerWidth() - $(target).outerWidth();

				$(target).css({
					'left' : left +'px',
					'margin-left' : '0'
				});
			}else{
				var left = Math.ceil($element.offset().left + $element.outerWidth()* .5),
				margin = Math.ceil($(target).outerWidth() * -.5);

				$(target).css({
					'left' : left.toFixed(1) +'px',
					'margin-left' : margin +'px'
				});
			}

			$(target).siblings().hide();
			$(target).show();
		},
		hide = function(){
			$(target).hide();
			$element.removeClass(classActive);
		}

		$element.off().on('mouseenter',function(event){
			inTimer = setTimeout(show,inTime);
			event.stopPropagation();
		}).on('mouseleave',function(event){
			clearTimeout(inTimer);
			outTimer = setTimeout(hide,outTime);

			event.stopPropagation();
		});

		$(target).off().on('mouseenter',function(event){
			clearTimeout(outTimer);
			show();

			event.stopPropagation();
		}).on('mouseleave',function(event){
			clearTimeout(inTimer);
			outTimer = setTimeout(hide,outTime);;

			event.stopPropagation();
		});
	};

	return {
		init : _init
	}
}();

//실시간 경고알림 & 공지사항
slui.notices = function() {
	var _ = {
		container : 'notice-container',
		danger : 'notice-danger',
		warning : 'notice-warning',
		attention : 'notice-attention',
		head : 'notice-head',
		body : 'notice-body',
		btnClose : 'btn-close'
	},
	_intervalTime,
	_init = function(){
		if($('.'+_.container).size()<1){
			var $div = $('<div />').addClass(_.container).appendTo($('body'));
		}
	},

	//경보알림 푸쉬
	pushalram = function(){
		_init();
		clearInterval(_intervalTime);
		_intervalTime = setInterval(_call,10*1000);
	},
	_call = function(){
		var callCount = 0,
		checkTotal = false,
		checkEvent = false,
		strHref = location.pathname,
		callbackTotalAlarm = function(data, cd, msg){
			checkTotal = true;

			//테스트 데이터
			//var data = [{"info_page":"/event/search_event_list.html","status_nm":"High","alarm_deco":"경계 이상 발생","event_time":"20160711154200","alarm_cd":"1","alarm_nm":"전체위험도"},{"info_page":"/event/search_event_list.html","status_nm":"High","alarm_deco":"High 이상 발생","event_time":"20160711154200","alarm_cd":"3","alarm_nm":"일반이벤트"}];
			if(cd.indexOf('SUC') != -1 && data.length>0){
				if(gDISPLAY_ALARM == 'dashboard' && strHref.indexOf('dashboard') == -1){ //내 정보보기 알림 전체화면으로 설정, 현재 페이지가 대시보드가 아닐 떄 
					_appendTopLayer(data);
				}else{
					_drawTotalItem(data);
					_appendTopLayer(data);
					callCount++;
				}
			}
			checkNoise();
		},
		callbackEventAlarm = function(data, cd, msg){
			checkEvent = true;
			//테스트 데이터
			//var data = [{"event_cate_cd":"1","user_id":"sjsjss","event_nm":"[내부] 특정 위험국가 접근자 탐지","reg_time":"20160809202500","event_level":"1","dashboard_yn":"Y","level_nm":"Low","event_time":"201608092025"}];
			if(cd.indexOf('SUC') != -1 && data.length>0){
				_drawEventItem(data);
				callCount++;
			}
			checkNoise();
		},
		checkNoise = function(){
			if(!checkTotal | !checkEvent) return false;

			if(callCount > 0) {
				var repeat = function(){
					setTimeout(function(){
						if( $('.notice-warning').size() + $('.notice-attention').size() >0 ){
							_makeNoise();
							repeat();
						}
					},4000)
				};

				_makeNoise();
				repeat(); 
			}
		}

		$('body').requestData('/main/alarm_history.json',{},{callback:callbackTotalAlarm});
		
		if(!(gDISPLAY_ALARM == 'dashboard' && strHref.indexOf('dashboard') == -1)){
			$('body').requestData('/main/event_alarm_list.json',{},{callback:callbackEventAlarm});
		}
	},
	_drawTotalItem = function(data){
		var _maxsize = 3,
		time = _SL.formatDate(data[0].event_time, 'yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm'),
		$container = $('.'+_.container),

		//make DOM
		$item = $('<div />')
			.addClass(_.warning+' notice-group')
			.css('display','none'),
		$head = $('<div />')
			.addClass(_.head)
			.append( '<i class="icon-exclamation-triangle"></i> 통합 경보 메세지<button type="button" class="'+_.btnClose+'"><i class="icon-times"></i></button>' )
			.appendTo($item),
		$body = $('<div />')
			.addClass(_.body)
			.appendTo($item),
		$time = $('<strong />')
			.text(time)
			.appendTo($body);

		for(var i=0,len=data.length;i<len;i++){
			var msg = data[i].alarm_nm+' '+data[i].alarm_deco;

			if(data[i].info_page != ''){
				var startDate='',
					endDate='';

				switch(data[i].alarm_cd){
					case '4' : // 유해IP
						startDate = _SL.formatDate.addMin(data[i].event_time, -4);
						endDate = _SL.formatDate.addMin(data[i].event_time, -3);
						break;
					case '5' : // 성능정보이벤트
						startDate = _SL.formatDate.addMin(data[i].event_time, -3);
						endDate = _SL.formatDate.addMin(data[i].event_time, -2);
						break;
					default :
						startDate = _SL.formatDate.addMin(data[i].event_time, -1);
						endDate = data[i].event_time;
						break;
				}

				$body.append( (i+1)+'. <a href="'+data[i].info_page+'?start_time='+startDate+'&end_time='+endDate+'" target="_blank">'+msg+'</a><br>');
			}else{
				$body.append( (i+1)+'. '+msg+'<br>' );
			}
		}

		if($container.find('.'+_.warning).size()>0){
			if($container.find('.'+_.attention).size()>0){
				$container.find('.'+_.attention).after($item);
			}else{
				$container.prepend($item);
			}
		}else{
			$container.append($item);
		}

		$item.fadeIn(250,function(){
			if($('.'+_.warning).size()>_maxsize){
				_removeItem( $('.'+_.warning).eq(_maxsize) );
			}

			//set event
			$(this).one('click','.'+_.btnClose,function(){
				_removeItem($item);
			});
		});
	},
	_drawEventItem = function(data){
		var _maxline = 100;
		/* 파라메터
			start_time = event_time,
			end_time = event_time +1분,
			s_event_nm = event_nm,
			s_event_cate_cd= event_cate_cd,
			s_event_level = event_level */

		if( $('.'+_.container+' .'+_.attention).size() == 0){
			var $container = $('.'+_.container),
			$item = $('<div />')
				.addClass(_.attention+' notice-group')
				.css('display','none')
				.prependTo($container),
			$head = $('<div />')
				.addClass(_.head)
				.append( '<i class="icon-file-info"></i> 실시간 이벤트 경보 메시지<button type="button" class="'+_.btnClose+'"><i class="icon-times"></i></button>' )
				.appendTo($item),
			$body = $('<div />')
				.addClass(_.body)
				.appendTo($item);
		}

		for(var i=0, len=data.length;i<len;i++){
			var msg = '['+_SL.formatDate(data[i].reg_time, 'yyyyMMddHHmmss', 'HH:mm:ss') +'] '+data[i].event_nm + ' '+data[i].level_nm+' 발생',
			link = '/event/search_event_list.html?start_time='+data[i].event_time+'&end_time='+_SL.formatDate.addMin(data[i].event_time,1)+'&s_event_nm='+data[i].event_nm+'&s_group_cd='+data[i].group_cd+'&s_event_cate_cd='+data[i].event_cate_cd+'&s_event_level='+data[i].event_level;
			$('.'+_.container+' .'+_.attention+' .'+_.body).prepend('<div><a href="'+link+'" target="_blank">'+msg+'</a></div>');

			if($('.'+_.container+' .'+_.attention+' .'+_.body+' > div').size()>_maxline){
				$('.'+_.container+' .'+_.attention+' .'+_.body+' > div').eq(_maxline).remove();
			}
			if(i > _maxline) break;
		}

		if( $('.'+_.container+' .'+_.attention).is(':hidden') ){
			var $item = $('.'+_.container+' .'+_.attention);
			$item.fadeIn(250,function(){
				$(this).one('click','.'+_.btnClose,function(){
					_removeItem($item);
				});
			});
		}
	},
	_removeItem = function($ele){
		$ele.animate({
			height:0
		},100,function(){
			$ele.remove();
		});
	},
	_makeNoise = function(){
		if( !document.getElementById('alarmNoise') ){
			var $audio = $('<audio />')
				.attr('src','/resources/wav/alarm.mp3')
				.attr('id','alarmNoise')
				.appendTo($('body'));
		}

		document.getElementById('alarmNoise').play();
	},
	_appendTopLayer = function(data){
		var $target = $('.header-layer-alarm');
		if($target.size()<1) return false;

		var str = '<dt>'+_SL.formatDate(data[0].event_time, 'yyyyMMddHHmmss', 'MM/dd HH:mm')+'</dt>';
		str += '<dd>';
		for(var i=0,len=data.length;i<len;i++){
			str += data[i].alarm_nm+' '+data[i].alarm_deco+'<br>';
		}
		str += '</dd>';

		var index = $target.find('dt:eq(2)').index()-1;
		$target.find('dl > *:gt('+index+')').remove();
		$target.find('dl').prepend(str);
	},

	//공지사항
	notice = function(){
		var $boardContainer = $('.notice-group.notice-board'),
		_boardItem = '.board-item-container',
		_btnLeft = 'icon-chevron-left',
		_btnRight = 'icon-chevron-right',
		_noticesize = 1,
		_remove = function(){
			$('.notice-group.notice-board').animate({
				height:0
			},500,function(){
				$(this).remove();
			})
		},
		_eventBtn = function(){
			$boardContainer.on('click','.btn-today',function(){
				$.cookie('stopNotice', 'Y', {expires:1, path:'/'});
				_remove();
			});
			$boardContainer.on('click','.btn-close',function(){
				_remove();
			});
		},
		_makePaging = function(){
			$(_boardItem).each(function(index){
				var $paging = $('<span class="area-paging" />'),
					$btnLeft = $('<button type="button" class="'+_btnLeft+'" />').appendTo($paging),
					$btnRight = $('<button type="button" class="'+_btnRight+'" />').appendTo($paging);
				$(this).find('.btn-today').after($paging);

				if(index===0){
					$btnLeft.prop('disabled',true);
				}else if(index===_noticesize-1){
					$btnRight.prop('disabled',true);
				}
			});
			_eventPaging();
		},
		_eventPaging = function(){
			var showIndex = function(index){
				$(_boardItem+':eq('+index+')').show();
				$(_boardItem+':eq('+index+')').siblings().hide();
			}

			$(_boardItem).each(function(){
				var index = $(this).index();
				$(this).find('.'+_btnLeft).on('mousedown',function(event){
					event.stopPropagation();
					showIndex(index-1);
				});
				$(this).find('.'+_btnRight).on('mousedown',function(event){
					event.stopPropagation();
					showIndex(index+1);
				});
			});
		};

		if($boardContainer.size()<0) return false;

		_init();
		$boardContainer.appendTo($('.'+_.container));

		_eventBtn();

		$(_boardItem).each(function(){
			var $body = $(this).find('.notice-body'),
			$innerBody = $(this).find('.notice-body-inner');
			if( $body.outerHeight() < $innerBody.outerHeight() ){
				$body.addClass('nano');
				$innerBody.addClass('nano-content');
				$body.nanoScroller();
			}
		});

		if( $(_boardItem).size() > 1){
			_noticesize = $(_boardItem).size();
			$(_boardItem+':gt(0)').hide();
			_makePaging();
		}
	},

	//라이선스 팝업
	licence = function(){
		_init();
		$('body').requestData('/common/license_check.json', {}, {callback : _licenceCont});
	},
	_licenceCont = function(rsJson){
		/*//테스트 데이터 - 용량초과1
		var rsJson = {
			"warningPercentage":90,		"percentage":120,
			"remainQuota":10,	"warningQuota":0,
			"issueId":"시큐레이어_eyeCloudSIM-150105-18","issueDate":"20160524",
			"warningQuota":7,
			"LIMIT_EXCEED_DAY":3,
			"diskUsage":0,"version":"2.5",
			"remainQuota":10,"size":500,
			"product":"eyeCloudSIM","quota":60,
			"LIMIT_PERCENTAGE":120,"repeatExceedDay":2
		};
		//테스트 데이터 - 용량초과2
		var rsJson = {
			"warningPercentage":80,		"percentage":90,
			"remainQuota":10,	"warningQuota":0,
			"issueId":"시큐레이어_eyeCloudSIM-150105-18","issueDate":"20160524",
			"warningQuota":7,
			"LIMIT_EXCEED_DAY":3,
			"diskUsage":0,"version":"2.5",
			"remainQuota":10,"size":500,
			"product":"eyeCloudSIM","quota":60,
			"LIMIT_PERCENTAGE":120,"repeatExceedDay":0
		};
		//테스트 데이터 - 날짜 용량 둘 다
		var rsJson = {
			"warningPercentage":80,		"percentage":90,
			"remainQuota":10,	"warningQuota":12,
			"issueId":"시큐레이어_eyeCloudSIM-150105-18","issueDate":"20160524",
			"warningQuota":7,
			"LIMIT_EXCEED_DAY":3,
			"diskUsage":0,"version":"2.5",
			"remainQuota":10,"size":500,
			"product":"eyeCloudSIM","quota":60,
			"LIMIT_PERCENTAGE":120,"repeatExceedDay":0
		};
		//테스트 데이터 - 날짜 만료
		var rsJson = {
			"remainQuota":10,	"warningQuota":12,
			"warningPercentage":90, "percentage":0,
			"issueId":"시큐레이어_eyeCloudSIM-150105-18","issueDate":"20160524",
			"LIMIT_EXCEED_DAY":3,
			"diskUsage":0,"version":"2.5","size":500,
			"product":"eyeCloudSIM","quota":60,
			"LIMIT_PERCENTAGE":120,"repeatExceedDay":0
		};*/

		var conts = '', licneseInfo = '', title = '',
		 quota = rsJson.quota,
		 size = rsJson.size;

		if(quota == 0){
			quota ="Unlimited";
			remainQuota = "Unlimited";
		}
		
		if(size == 0){
			size ="Unlimited";
		}

		licneseInfo+="[ License Info ]<br>";
		licneseInfo+="- Issue ID : " + rsJson.issueId + "<br>";
		licneseInfo+="- Issue Date : " + _SL.formatDate(rsJson.issueDate+"000000", "yyyy-MM-dd") + "<br>";
		
		if(rsJson.quota == 0){
			licneseInfo+="- Quota : " + quota + "<br>";
		}else{
			licneseInfo+="- Quota : " + quota + " Day<br>";
		}
		
		if(rsJson.size == 0){
			licneseInfo+="- Size : " + size + "<br>";
		}else{
			licneseInfo+="- Size : " + size + "GB Per Day<br>";
		}

		if (rsJson.quota != 0 && rsJson.remainQuota <= rsJson.warningQuota) {
			conts += licneseInfo;
			title +=" 라이선스 기간 만료까지 " + rsJson.remainQuota + "일 남았습니다.<br>";
		}
		if (rsJson.percentage >= rsJson.warningPercentage) {
			if(conts.length == 0) {
				conts += licneseInfo;
			}

			if(rsJson.percentage <= 100){
				title +="라이선스 용량이 전일기준 " + rsJson.percentage + "%("+ rsJson.diskUsage +"GB/"+ rsJson.size +"GB) 사용 중입니다.<br>";
			}else{
				title +=" 라이선스 용량이 전일기준 "+rsJson.repeatExceedDay+"일간 "+ (rsJson.percentage - 100)+"%를 초과하였습니다.("+ rsJson.diskUsage +"GB/"+rsJson.size +"GB)<br>";
			}
		}

		if(conts.length > 0) {
			conts+="<br><span class='text-gray'>*라이선스 기간이 만료되거나 라이선스 용량이 "
					+ rsJson.LIMIT_PERCENTAGE + "%를 " + rsJson.LIMIT_EXCEED_DAY
					+ "일 연속 초과시 사용제한<strong class='text-danger'>(로그인 불가)</strong>됩니다.";

			_licenceMarkup(title, conts);
		}
	},
	_licenceMarkup = function(title, cont){
		var str = '<div class="notice-head">';
		str+= '<i class="icon-file-percent"></i>' +title;
		str+= '<button type="button" class="btn-close"><i class="icon-times"></i></button>';
		str+= '</div>';
		str+= '<div class="notice-body">'+cont;
		str+='</div>';

		var $item = $('<div />')
			.addClass(_.danger+' notice-group')
			.html(str);

		$('.'+_.container).append($item);
		$('.'+_.container).append('<div class="notice-background"></div>');
		
		$item.css({
			'margin-left' : $item.width() * -.5+'px',
			'margin-top' : $item.height() * -.5+'px',
		}).find('.'+_.btnClose).on('click',function(){
			$item.animate({
				height:0
			},250,function(){
				$item.remove();
				$('.notice-background').fadeOut(100,function(){
					$(this).remove();
				});
			});
		});
	}

	return {
		pushalram : pushalram,
		notice : notice,
		licence : licence
	}
}();

//왼쪽 검정 배경 영역
slui.sectionCols = function(){
	var _init = function(){
		if( $('.container > .section-container > [class*="-cols"]').size()>0 || $('.page-popup-area > .section-container > [class*=-cols]').size()>0 ){
			_event();
			$(window).on('resize',function(){
				setTimeout(function(){
					_event();
				},500);
			})
		}
	},
	_event = function(){
		var $container = $('body > [class$=container]');

		if( $container.width() > $(window).width() ){
			$(window).on('scroll',_setColsStyle);
		}
	},
	_setColsStyle = function(){
		$('#cols-style').remove();
		var _size = $(window).scrollLeft() * -1;
		$('head').append('<style id="cols-style">.page-popup-area>.section-container .section-defined-cols:after,\
				.page-popup-area>.section-container .section-tree-cols:after,\
				.page-popup-area>.section-container .section-search-cols:after,\
				.container>.section-container .section-defined-cols:after,\
				.container>.section-container .section-tree-cols:after,\
				.container>.section-container .section-search-cols:after{left:'+_size+'px}</style>');
	},

	// make auto scroll in user defined list
	_userListScroll = function( _container ){
		if( $(_container).size() === 0 || !$(_container).hasClass('section-defined-cols') ) return false;

		var $listContainer = $(_container),
		$lists = $(_container+' .defined-list'),
		makeScroll = function(){
			var h = $(window).height() - $lists.offset().top;

			if($lists.find('nano').size() == 0){
				$lists.wrap('<div class="nano" style="height:'+h+'px;"></div>');
				$lists.addClass('nano-content');
			}

			$lists.parent('.nano').nanoScroller();
		},
		initScroll = function(){
			var listh = $lists.offset().top + $lists.outerHeight();
			if( listh > $(window).height() && listh > $lists.parents('.section-container').find('.section-content').outerHeight() ){
				makeScroll();
			}
		};

		if($lists.hasClass('nano-content')) return false;
		initScroll();

		var st;
		$(window).on('resize',function(){
			clearTimeout(st);
			st = setTimeout(function(){
				initScroll();
			},500);
		});
	};

	return {
		init : _init,
		userlist : _userListScroll
	}
}();

slui.chart = {
	chartConfig : {
		"alignCaptionWithCanvas": "0",
		"alternateHGridAlpha":"25",
		"alternateVGridAlpha":"25",
		"axisLineAlpha": "25",
		"baseFont": "tahoma",//"baseFont": "Malgun Gothic",
		"baseFontSize": "11",
		"borderAlpha":"100",
		"bgAlpha": "100",
		"captionFontSize": "14",
		"canvasBgAlpha":"100",
		"canvasBorderAlpha":"100",
		"canvasBorderThickness":"0",
		"canvaspadding":"0",
		"divLineAlpha": "100",
		"labelAlpha":"100",
		"labelFontSize":"11",
		"legendBorderThickness": "0",
		"legendShadow":"0",
		"maxLabelHeight": "120",
		"outCnvBaseFont": "tahoma",//"baseFont": "Malgun Gothic",
		"outCnvBaseFontSize": "11",
		"plotBorderAlpha": "53",
		"plotfillalpha":"100",
		"plotFillHoverAlpha": "95",
		"placeValuesInside": "1",
		"showAlternateHGridColor" : "1",
		"showAlternateVGridColor": "0",
		"showAxisLines": "1",
		"showBorder": "0",
		"showCanvasBase": "0",
		"showCanvasBorder": "0",
		"showHoverEffect":"1",
		"showPlotBorder":"1",
		"subcaptionFontSize": "12",
		"subcaptionFontBold": "0",
		"toolTipBgAlpha": "70",
		"toolTipBorderThickness": "0",
		"toolTipBorderRadius": "2",
		"toolTipPadding": "5",
		"usePlotGradientColor": "0",

		"alternatevgridcolor" : "#f2f2f2",
		"alternatehgridcolor" : "#f2f2f2",
		"baseFontColor": "#000000",
		"bgColor": "#ffffff",
		"borderColor" : "#f2f2f2",
		"canvasBgColor" : "#fefefe",
		"divLineColor" : "#f2f2f2",
		"legendBgColor" : "#fefefe",
		"outCnvBaseFontColor": "#000000",
		"plotBorderColor": "#000000",
		"toolTipColor": "#ffffff",
		"toolTipBgColor": "#000000",
		"paletteColors": "#00c0dd, #92d050, #ffc000, #ff812d, #aa80fd, #2293e5, #ff9999, #42b642, #feac72, #c6e700, #2dbda5, #ff87e8, #6144ff"
		//"paletteColors": "#35a0dd, #efbc13, #5f72b6, #4496d1, #84cae9, #f77c7c, #f1ad42, #73b873, #c6c6c6",
			//#69ac1d, #eb6325,
	}
}

$(document).ready(function(){
	slui.attach.init('body');
	slui.sectionCols.init();
});
