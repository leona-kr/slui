//# sourceURL=mymenu_form.js
'use strict';

_SL.nmspc("main").mymenuForm = function() {
	var
	// Config 정의
	mCfg = {
		urlSave : gCONTEXT_PATH + 'main/mymenu_insert.do',
		formId : '#setMymenu',
		mymenu : ' .setmenus-group .area-my .inner-wrap',
		allmenu : '.setmenus-group .area-menus ul'
	},
	init = function(data){
		var checkedMenu = [],
		$target = $('header .group-mymenu .item-menu');

		$target.each(function(){
			var $a = $(this).find('a');
			checkedMenu.push({
				menu_id : Number( $a.attr('data-id') ),
				menu_nm : $a.text()
			});
		});

		_loadTotal(data,checkedMenu);
		_loadMymenu(checkedMenu);

		$(mCfg.formId+' .btn-save').on('click',_eventSave);
	},
	_loadTotal = function(totalMenu, checkedMenu){
		var $target = $(mCfg.allmenu),
		markup = function(_d, $target, depth){
			var $li = $('<li />')
				.appendTo($target);

			if(_d.child.length>0){
				$li.append('<span class="sp-d'+depth+'">'+_d.menu_nm+'</span>');

				var $ul = $('<ul />').appendTo($li);

				depth++;

				for(var j=0,_len=_d.child.length;j<_len;j++){
					markup(_d.child[j], $ul, depth);
				}
			} else {
				$li.append('<label class="sp-d'+depth+'"><input type="checkbox" value="'+_d.menu_id+'" data-id="'+_d.menu_id+'">'+_d.menu_nm+'</label>');
			}
		};

		$target.empty();
		for(var i=0,len=totalMenu.length;i<len;i++){
			markup(totalMenu[i], $target, 1);
		}
		for(var i=0,len=checkedMenu.length;i<len;i++){
			$(mCfg.allmenu+' [data-id='+checkedMenu[i].menu_id+']').prop('checked',true);
		}
		_eventTotal();
	},
	_loadMymenu = function(checkedMenu){
		var _d = checkedMenu;
		$(mCfg.mymenu).empty();

		for(var i=0,len=_d.length;i<len;i++){
			_appendMymenu(_d[i].menu_id, _d[i].menu_nm);
		}
		_eventMymenu();
	},
	_appendMymenu = function(_id, _nm){
		var $item = $('<span />')
			.attr('data-id',_id)
			.addClass('item-menu')
			.appendTo($(mCfg.mymenu)),
		$span = $('<span />')
			.text(_nm)
			.appendTo($item),
		$btn = $('<button />')
			.attr('type','button')
			.addClass('icon-times')
			.appendTo($item)
			.on('click',function(){
				$(this).parent().remove();
				$(mCfg.allmenu+' [data-id='+_id+']').prop('checked',false);
			});
	},
	_eventTotal = function(){
		var $ele = $(mCfg.allmenu+' [type=checkbox]');
		$ele.each(function(){
			$(this).on('click',function(){
				if( $(this).prop('checked') ){
					if($(mCfg.mymenu).find('[data-id='+$(this).val()+']').size() == 0){
						_appendMymenu( $(this).val(), $(this).parent().text());
						_eventMymenu();
					}
				} else {
					$(mCfg.mymenu).find('[data-id='+$(this).val()+']').remove();
				}
			})
		})
	},
	_eventMymenu = function(){
		$(mCfg.mymenu).sortable({
			items: '.item-menu'
		});
	},
	_eventSave = function(){
		var arr = [],
			afterClose = $(this).data('after-close') == true ? true : false;

		$(mCfg.mymenu+' .item-menu').each(function(){
			arr.push( Number($(this).attr('data-id')) );
		});

		$('body').requestData(mCfg.urlSave, arr, {
			displayLoader : true,
			callback:function(rsData, code, msg){
				if(code.indexOf('SUC') !=-1){
					if(afterClose){
						$(mCfg.formId+" [data-layer-close=true]").click();
					}
				} else {
					_alert(msg);
				}
			}
		});
	}

	return {
		init: init
	};
}();


$(function(){
	if(typeof gMenuTree.child !='undefined' && gMenuTree.child.length>0){
		slapp.main.mymenuForm.init(gMenuTree.child);
	} else {
		$('header .btn-setting').hide();
	}
});