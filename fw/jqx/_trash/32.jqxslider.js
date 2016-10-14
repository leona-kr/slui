/*
jQWidgets v4.0.0 (2016-Jan)
Copyright (c) 2011-2016 jQWidgets.
License: http://jqwidgets.com/license/
*/


(function ($) {

    $.jqx.jqxWidget("jqxSlider", "", {});

    $.extend($.jqx._jqxSlider.prototype, {
        defineInstance: function () {
            var settings = {
                // Type: Bool
                // Default: false
                // Sets or gets whether the slider is disabled.
                disabled: false,
                // Type: Number/String
                // Default: 300
                // Sets or gets slider's width.
                width: 300,
                // Type: Number/String
                // Default: 30
                // Sets or gets slider's height.
                height: 30,
                // Type: Number
                // Default: 2
                // Sets or gets slide step when the user is using the arrows or the mouse wheel for changing slider's value.
                step: 1,
                // Type: Number
                // Default: 10
                // Sets or gets slider's maximum value.
                max: 10,
                // Type: Number
                // Default: 0
                // Sets or gets slider's minimum value.
                min: 0,
                int64: false,
                // Type: String
                // Default: horizontal
                // Sets or gets slider's orientation.
                orientation: 'horizontal',
                // Type: Bool
                // Default: true
                // Sets or gets whether ticks will be shown.
                showTicks: true,
                // Type: Number
                // Default: both
                // Sets or gets slider's ticks position. Possible values - 'top', 'bottom', 'both'.
                ticksPosition: 'both',
                // Type: Number
                // Default: 2
                // Sets or gets slider's ticks frequency.
                ticksFrequency: 2,
                minorTicksFrequency: 1,
                showMinorTicks: false,
                // Type: Bool
                // Default: true
                // Sets or gets whether the scroll buttons will be shown.
                showButtons: true,
                // Type: String
                // Default: both
                // Sets or gets scroll buttons position. Possible values 'both', 'left', 'right'.
                buttonsPosition: 'both',
                // Type: String
                // Default: default
                // Sets or gets slider's mode. If the mode is default then the user can use floating values.
                mode: 'default',
                // Type: Bool
                // Default: true
                // Sets or gets whether the slide range is going to be shown.
                showRange: true,
                // Type: Bool
                // Default: false
                // Sets or gets whether the slider is a range slider.
                rangeSlider: false,
                // Type: Number
                // Default: 0
                // Sets or gets slider's value. This poperty will be an object with the following structure { rangeStart: range_start, rangeEnd: range_end } if the
                // slider is range slider otherwise it's going to be a number.
                value: 0,
                // Type: Array
                // Default: [0, 10]
                // Sets or gets range slider's values.
                values: [0, 10],
                // Type: Bool
                // Default: true
                // Sets or gets whether the slider title will be shown.
                tooltip: false,
                tooltipFormatFunction: null,
                // determines the tooltip's position.
                tooltipPosition: 'near',
                tooltipHideDelay: 500,
                // Type: Number/String
                // Default: 11
                // Sets or gets whether the slider buttons size.
                sliderButtonSize: 14,
                // Type: Number/String
                // Default: 5
                // Sets or gets the tick size.
                tickSize: 7,
                minorTickSize: 4,
                showTickLabels: false,
                tickLabelFormatFunction: null,
                // mirror
                layout: "normal",
                rtl: false,
                changeType: null,
                // Private properties
                _settings: {
                    'vertical': {
                        'size': 'height',
                        'oSize': 'width',
                        'outerOSize': 'outerWidth',
                        'outerSize': 'outerHeight',
                        'left': 'top',
                        'top': 'left',
                        'start': '_startY',
                        'mouse': '_mouseStartY',
                        'page': 'pageY',
                        'opposite': 'horizontal'
                    },
                    'horizontal': {
                        'size': 'width',
                        'oSize': 'height',
                        'outerOSize': 'outerHeight',
                        'outerSize': 'outerWidth',
                        'left': 'left',
                        'top': 'top',
                        'start': '_startX',
                        'mouse': '_mouseStartX',
                        'page': 'pageX',
                        'opposite': 'vertical'
                    }
                },
                _touchEvents: {
                    'mousedown': $.jqx.mobile.getTouchEventName('touchstart'),
                    'click': $.jqx.mobile.getTouchEventName('touchstart'),
                    'mouseup': $.jqx.mobile.getTouchEventName('touchend'),
                    'mousemove': $.jqx.mobile.getTouchEventName('touchmove'),
                    'mouseenter': 'mouseenter',
                    'mouseleave': 'mouseleave'
                },
                _events: ['change', 'slide', 'slideEnd', 'slideStart', 'created'],
                _invalidArgumentExceptions: {
                    'invalidWidth': 'Invalid width.',
                    'invalidHeight': 'Invalid height.',
                    'invalidStep': 'Invalid step.',
                    'invalidMaxValue': 'Invalid maximum value.',
                    'invalidMinValue': 'Invalid minimum value.',
                    'invalidTickFrequency': 'Invalid tick frequency.',
                    'invalidValue': 'Invalid value.',
                    'invalidValues': 'Invalid values.',
                    'invalidTicksPosition': 'Invalid ticksPosition',
                    'invalidButtonsPosition': 'Invalid buttonsPosition'
                },
                //Containing the last value. This varialbe is used in the _raiseEvent method and it's our criteria for checking
                //whether we need to trigger event.
                _lastValue: [],
                _track: null,
                _leftButton: null,
                _rightButton: null,
                _slider: null,
                _rangeBar: null,
                _slideEvent: null,
                _capturedElement: null,
                _slideStarted: false,
                aria:
                {
                    "aria-valuenow": { name: "value", type: "number" },
                    "aria-valuemin": { name: "min", type: "number" },
                    "aria-valuemax": { name: "max", type: "number" },
                    "aria-disabled": { name: "disabled", type: "boolean" }
                }
            }
            $.extend(true, this, settings);
            return settings;
        },

        createInstance: function (args) {
            var that = this;

            if (that.int64 === true) {
                if (!$.jqx.longInt) {
                    throw new Error('jqxSlider: Missing reference to jqxdata.js');
                }

                // enables 64-bit number support
                $.jqx.longInt(that);

                that._value64 = new $.jqx.math().fromString(that.value.toString(), 10);
                that._values64 = [new $.jqx.math().fromString(that.values[0].toString(), 10), new $.jqx.math().fromString(that.values[1].toString(), 10)];
                that._min64 = new $.jqx.math().fromString(that.min.toString(), 10);
                that._max64 = new $.jqx.math().fromString(that.max.toString(), 10);
                that._step64 = new $.jqx.math().fromString(that.step.toString(), 10);
                that._ticksFrequency64 = new $.jqx.math().fromString(that.ticksFrequency.toString(), 10);
                that._minorTicksFrequency64 = new $.jqx.math().fromString(that.minorTicksFrequency.toString(), 10);
            }
            this.render();
        },

        render: function () {
            this.element.innerHTML = "";
            this.host.attr('role', 'slider');
            this.host.addClass(this.toThemeProperty('jqx-slider'));
            this.host.addClass(this.toThemeProperty('jqx-widget'));

            $.jqx.aria(this);
            this._isTouchDevice = $.jqx.mobile.isTouchDevice();
            this.host.width(this.width);
            this.host.height(this.height);
            this._refresh();
            this._raiseEvent(4, { value: this.getValue() });
            this._addInput();
            var me = this;
            var autoTabIndex = me.host.attr("tabindex") == null;
            if (autoTabIndex) {
                me.host.attr("tabindex", 0);
            }
            $.jqx.utilities.resize(this.host, function () {
                me.__trackSize = null;
                me.__thumbSize = null;
                me.host.width(me.width);
                me.host.height(me.height);
                me._performLayout();
                me._initialSettings();
            });
        },

        resize: function (width, height) {
            this.width = width;
            this.height = height;
            this.refresh();
            this.host.width(me.width);
            this.host.height(me.height);
            this._performLayout();
            this._initialSettings();
        },

        focus: function () {
            try {
                this.host.focus();
            }
            catch (error) {
            }
        },

        destroy: function () {
            this.host.remove();
        },

        _addInput: function () {
            var name = this.host.attr('name');
            this.input = $("<input type='hidden'/>");
            this.host.append(this.input);
            if (name) {
                this.input.attr('name', name);
            }
            if (!this.rangeSlider) {
                this.input.val(this.value.toString());
            }
            else {
                if (this.values) {
                    this.input.val(this.value.rangeStart.toString() + "-" + this.value.rangeEnd.toString());
                }
            }
        },

        _getSetting: function (setting) {
            return this._settings[this.orientation][setting];
        },

        _getEvent: function (event) {
            if (this._isTouchDevice) {
                return this._touchEvents[event];
            } else {
                return event;
            }
        },

        refresh: function (initialRefresh) {
            if (!initialRefresh) {
                this._refresh();
            }
        },

        _refresh: function () {
            this._render();
            this._performLayout();
            this._removeEventHandlers();
            this._addEventHandlers();
            this._initialSettings();
        },

        _render: function () {
            this._addTrack();
            this._addSliders();
            this._addTickContainers();
            this._addContentWrapper();
            this._addButtons();
            this._addRangeBar();
        },

        _addTrack: function () {
            if (this._track === null || this._track.length < 1) {
                this._track = $('<div class="' + this.toThemeProperty('jqx-slider-track') + '"></div>');
                this.host.append(this._track);
            }
            this._track.attr('style', '');
            this._track.removeClass(this.toThemeProperty('jqx-slider-track-' + this._getSetting('opposite')));
            this._track.addClass(this.toThemeProperty('jqx-slider-track-' + this.orientation));
            this._track.addClass(this.toThemeProperty('jqx-fill-state-normal'));
            this._track.addClass(this.toThemeProperty('jqx-rc-all'));
        },

        _addSliders: function () {
            if (this._slider === null || this._slider.length < 1) {
                this._slider = {};
                this._slider.left = $('<div class="' + this.toThemeProperty('jqx-slider-slider') + '"></div>');
                this._track.append(this._slider.left);
                this._slider.right = $('<div class="' + this.toThemeProperty('jqx-slider-slider') + '"></div>');
                this._track.append(this._slider.right);
            }
            this._slider.left.removeClass(this.toThemeProperty('jqx-slider-slider-' + this._getSetting('opposite')));
            this._slider.left.addClass(this.toThemeProperty('jqx-slider-slider-' + this.orientation));
            this._slider.right.removeClass(this.toThemeProperty('jqx-slider-slider-' + this._getSetting('opposite')));
            this._slider.right.addClass(this.toThemeProperty('jqx-slider-slider-' + this.orientation));
            this._slider.right.addClass(this.toThemeProperty('jqx-fill-state-normal'));
            this._slider.left.addClass(this.toThemeProperty('jqx-fill-state-normal'));

        },

        _addTickContainers: function () {
            if (this._bottomTicks !== null || this._bottomTicks.length < 1 ||
                this._topTicks !== null || this._topTicks.length < 1) {
                this._addTickContainers();
            }
            var type = 'visible';
            if (!this.showTicks) {
                type = 'hidden';
            }
            this._bottomTicks.css('visibility', type);
            this._topTicks.css('visibility', type);
        },

        _addTickContainers: function () {
            if (typeof this._bottomTicks === 'undefined' || this._bottomTicks.length < 1) {
                this._bottomTicks = $('<div class="' + this.toThemeProperty('jqx-slider-tickscontainer') + '" style=""></div>');
                this.host.prepend(this._bottomTicks);
            }
            if (typeof this._topTicks === 'undefined' || this._topTicks.length < 1) {
                this._topTicks = $('<div class="' + this.toThemeProperty('jqx-slider-tickscontainer') + '" style=""></div>');
                this.host.append(this._topTicks);
            }
        },

        _addButtons: function () {
            if (this._leftButton === null || this._leftButton.length < 1 ||
                this._rightButton === null || this._rightButton.length < 1) {
                this._createButtons();
            }
            var type = 'block';
            if (!this.showButtons || this.rangeSlider) {
                type = 'none';
            }
            this._rightButton.css('display', type);
            this._leftButton.css('display', type);
        },

        _createButtons: function () {
            this._leftButton = $('<div class="jqx-slider-left"><div style="width: 100%; height: 100%;"></div></div>');
            this._rightButton = $('<div class="jqx-slider-right"><div style="width: 100%; height: 100%;"></div></div>');
            this.host.prepend(this._rightButton);
            this.host.prepend(this._leftButton);
            if (!this.host.jqxRepeatButton) {
                throw new Error("jqxSlider: Missing reference to jqxbuttons.js.");
            }
            this._leftButton.jqxRepeatButton({ theme: this.theme, delay: 50, width: this.sliderButtonSize, height: this.sliderButtonSize });
            this._rightButton.jqxRepeatButton({ theme: this.theme, delay: 50, width: this.sliderButtonSize, height: this.sliderButtonSize });
        },

        _addContentWrapper: function () {
            if (this._contentWrapper === undefined || this._contentWrapper.length === 0) {
                this.host.wrapInner('<div></div>');
                this._contentWrapper = this.host.children(0);
            }
            if (this.orientation === 'horizontal') {
                this._contentWrapper.css('float', 'left');
            } else {
                this._contentWrapper.css('float', 'none');
            }
        },

        _addTicks: function (container) {
            if (!this.showTicks)
                return;

            var width = container[this._getSetting('size')](),
                count, tickscount, minorTicksCount, minorTicksDistance, min, max;

            if (this.int64 === false) {
                count = this.max - this.min;
                tickscount = Math.round(count / this.ticksFrequency);
                minorTicksCount = Math.round(count / this.minorTicksFrequency);
                min = this.min;
                max = this.max;
            } else {
                count = this._max64.subtract(this._min64);
                tickscount = count.div(this._ticksFrequency64).toNumber();
                minorTicksCount = count.div(this._minorTicksFrequency64).toNumber();
                min = this._min64.toString();
                max = this._max64.toString();
            }

            var distance = width / tickscount,
                minorTicksDistance = width / minorTicksCount;

            container.empty();
            var ticks = "",
                htmlValue;

            if ((this.layout === 'normal' && this.orientation === 'horizontal') || (this.layout === 'reverse' && this.orientation === 'vertical')) {
                htmlValue = this.tickLabelFormatFunction ? this.tickLabelFormatFunction(min) : min;
            } else {
                htmlValue = this.tickLabelFormatFunction ? this.tickLabelFormatFunction(max) : max;
            }

            var span = $("<span style='visibility: hidden;'></span>");
            span.addClass(this.toThemeProperty('jqx-widget jqx-widget-content jqx-slider'));
            span.appendTo(document.body);
            span.html("0");
            var spanSize = { width: span.width(), height: span.height() };
            span.detach();
            var size = container[this._getSetting('oSize')]();
            ticks += this._addTick(container, 0, this.min, size, htmlValue, spanSize);
            for (var i = 1; i < tickscount; i++) {
                var number = i * distance;
                number = Math.floor(number);
                var value;
                if (this.int64 === false) {
                    if ((this.layout === 'normal' && this.orientation === 'horizontal') || (this.layout === 'reverse' && this.orientation === 'vertical')) {
                        value = this.min + this.ticksFrequency * i;
                    } else {
                        value = this.max - this.ticksFrequency * i;
                    }
                } else {
                    if ((this.layout === 'normal' && this.orientation === 'horizontal') || (this.layout === 'reverse' && this.orientation === 'vertical')) {
                        value = this._min64.add(this._ticksFrequency64.multiply(new $.jqx.math().fromString(i.toString(), 10))).toString();
                    } else {
                        value = this._max64.subtract(this._ticksFrequency64.multiply(new $.jqx.math().fromString(i.toString(), 10))).toString();
                    }
                }
                var htmlValue = this.tickLabelFormatFunction ? this.tickLabelFormatFunction(value) : value;
                ticks += this._addTick(container, number, i, size, htmlValue, spanSize);
            }
            if (this.showMinorTicks) {
                for (var i = 1; i < minorTicksCount; i++) {
                    var number = i * minorTicksDistance;
                    number = Math.floor(number);
                    //                    var value = this.min + this.minorTicksFrequency * i;
                    var htmlValue = "";
                    ticks += this._addTick(container, number, i, size, htmlValue, spanSize, true);
                }
            }

            if ((this.layout === 'normal' && this.orientation === 'horizontal') || (this.layout === 'reverse' && this.orientation === 'vertical')) {
                htmlValue = this.tickLabelFormatFunction ? this.tickLabelFormatFunction(max) : max;
            } else {
                htmlValue = this.tickLabelFormatFunction ? this.tickLabelFormatFunction(min) : min;
            }
            ticks += this._addTick(container, tickscount * distance, this.max, size, htmlValue, spanSize);
            container.append($(ticks));
        },

        _addTick: function (container, position, value, size, htmlValue, spanSize, minorTick) {
            var cssClass = "";
            cssClass = this.toThemeProperty('jqx-slider-tick');
            cssClass += " " + this.toThemeProperty('jqx-fill-state-pressed');
            var currentTick;
            var top = this._getSetting('top');
            var topValue = '2px';
            var tickSize = this.tickSize;
            if (minorTick) {
                tickSize = this.minorTickSize;
            }
            if (container[0] !== this._topTicks[0]) {
                topValue = size - tickSize - 2 + 'px';
            }

            if (this.orientation === 'horizontal') {
                currentTick = '<div style="' + top + ': ' + topValue + '; ' + this._getSetting('oSize') + ':  ' + tickSize + 'px; float: left; position:absolute; left:' + position +
                                'px;" class="' + this.toThemeProperty('jqx-slider-tick-horizontal') + ' ' + cssClass + '"></div>';
                if (this.showTickLabels) {
                    if (container[0] !== this._topTicks[0]) {
                        topValue = size - tickSize - spanSize.height - 2 + 'px';
                    }
                    else {
                        topValue = 2 + tickSize + 'px';
                    }

                    var w = spanSize.width * htmlValue.toString().length;
                    w = w / 2;
                    var pos = position - w;
                    currentTick += '<div style="' + top + ': ' + topValue + '; float: left; position:absolute; left:' + pos +
                                    'px;">' + htmlValue + '</div>';
                }
            } else {
                currentTick = '<div style="' + top + ': ' + topValue + '; ' + this._getSetting('oSize') + ':  ' + tickSize + 'px; float: none; position:absolute; top:' + position +
                                'px;" class="' + this.toThemeProperty('jqx-slider-tick-vertical') + ' ' + cssClass + '"></div>';
                if (this.showTickLabels) {
                    if (container[0] !== this._topTicks[0]) {
                        topValue = size - tickSize - htmlValue.toString().length * spanSize.width - 6 + 'px';
                    }
                    else {
                        topValue = 6 + tickSize + 'px';
                    }
                    var h = spanSize.height
                    h = h / 2;
                    var pos = position - h;
                    currentTick += '<div style="' + top + ': ' + topValue + '; float: none; position:absolute; top:' + pos +
                                       'px;">' + htmlValue + '</div>';
                }
            }
            return currentTick;
        },

        _addRangeBar: function () {
            if (this._rangeBar === null || this._rangeBar.length < 1) {
                this._rangeBar = $('<div class="' + this.toThemeProperty('jqx-slider-rangebar') + '"></div>');
                this._rangeBar.addClass(this.toThemeProperty('jqx-fill-state-pressed'));
                this._rangeBar.addClass(this.toThemeProperty('jqx-rc-all'));
                this._track.append(this._rangeBar);
            }
            if (!this.showRange) {
                this._rangeBar.css('display', 'none');
            } else {
                this._rangeBar.css('display', 'block');
            }

            this._thumbSize = this._slider.left.outerWidth();
        },

        _getLeftDisplacement: function () {
            if (!this.showButtons) {
                return 0;
            }
            if (this.rangeSlider) {
                return 0;
            }
            switch (this.buttonsPosition) {
                case 'left':
                    return this._leftButton[this._getSetting('outerSize')](true) + this._rightButton[this._getSetting('outerSize')](true);
                case 'right':
                    return 0;
                default:
                    return this._leftButton[this._getSetting('outerSize')](true);
            }
            return 0;
        },

        _performLayout: function () {
            this.host.width(this.width);
            this.host.height(this.height);
            var size = this.host.height();
            if (this._getSetting('size') == 'width') {
                size = this.host.width();
            }

            this._performButtonsLayout();
            this._performTrackLayout(size - 1);
            this._contentWrapper[this._getSetting('size')](this._track[this._getSetting('size')]());
            this._contentWrapper[this._getSetting('oSize')](this[this._getSetting('oSize')]);
            this._performTicksLayout();
            this._performRangeBarLayout();
            if (this.rangeSlider) {
                this._slider.left.css('visibility', 'visible');
            } else {
                this._slider.left.css('visibility', 'hidden');
            }
            this._refreshRangeBar();
            if (this.orientation == 'vertical') {
                if (this.showButtons) {
                    //   var leftMargin = parseInt(this._leftButton.css('margin-left'));
                    var centerLeft = parseInt((this._leftButton.width() - this._track.width()) / 2);

                    this._track.css('margin-left', -3 + centerLeft + 'px');
                }
            }
        },

        _performTrackLayout: function (size) {
            this._track[this._getSetting('size')](size - ((this.showButtons && !this.rangeSlider) ?
                        this._leftButton[this._getSetting('outerSize')](true) + this._rightButton[this._getSetting('outerSize')](true) : 0));
            this._slider.left.css('left', 0);
            this._slider.left.css('top', 0);
            this._slider.right.css('left', 0);
            this._slider.right.css('top', 0);
        },

        _performTicksLayout: function () {
            this._performTicksContainerLayout();
            this._addTicks(this._topTicks);
            this._addTicks(this._bottomTicks);
            this._topTicks.css('visibility', 'hidden');
            this._bottomTicks.css('visibility', 'hidden');
            if ((this.ticksPosition === 'top' || this.ticksPosition === 'both') && this.showTicks) {
                this._bottomTicks.css('visibility', 'visible');
            }
            if ((this.ticksPosition === 'bottom' || this.ticksPosition === 'both') && this.showTicks) {
                this._topTicks.css('visibility', 'visible');
            }
        },

        _performTicksContainerLayout: function () {
            var sizeDimension = this._getSetting('size');
            var oSizeDimension = this._getSetting('oSize');
            var outerSizeDimension = this._getSetting('outerOSize');

            this._topTicks[sizeDimension](this._track[sizeDimension]());
            this._bottomTicks[sizeDimension](this._track[sizeDimension]());
            var topTicksSize = -2 + (parseInt(this[oSizeDimension]) - this._track[outerSizeDimension](true)) / 2;
            this._topTicks[oSizeDimension](parseInt(topTicksSize));
            var bottomTicksSize = -2 + (parseInt(this[oSizeDimension]) - this._track[outerSizeDimension](true)) / 2;
            this._bottomTicks[oSizeDimension](parseInt(bottomTicksSize));

            if (this.orientation === 'vertical') {
                this._topTicks.css('float', 'left');
                this._track.css('float', 'left');
                this._bottomTicks.css('float', 'left');
            } else {
                this._topTicks.css('float', 'none');
                this._track.css('float', 'none');
                this._bottomTicks.css('float', 'none');
            }
        },

        _performButtonsLayout: function () {
            this._addButtonsStyles();
            this._addButtonsClasses();
            this._addButtonsHover();
            this._orderButtons();
            this._centerElement(this._rightButton);
            this._centerElement(this._leftButton);
            this._layoutButtons();
        },

        _addButtonsStyles: function () {
            this._leftButton.css('background-position', 'center');
            this._rightButton.css('background-position', 'center');
            if (this.orientation === 'vertical') {
                this._leftButton.css('float', 'none');
                this._rightButton.css('float', 'none');
            } else {
                this._leftButton.css('float', 'left');
                this._rightButton.css('float', 'left');
            }
        },

        _addButtonsClasses: function () {
            var icons = { prev: 'left', next: 'right' };
            if (this.orientation === 'vertical') {
                icons = { prev: 'up', next: 'down' };
            }
            this._leftButton.addClass(this.toThemeProperty('jqx-rc-all'));
            this._rightButton.addClass(this.toThemeProperty('jqx-rc-all'));
            this._leftButton.addClass(this.toThemeProperty('jqx-slider-button'));
            this._rightButton.addClass(this.toThemeProperty('jqx-slider-button'));
            this._leftArrow = this._leftButton.find('div');
            this._rightArrow = this._rightButton.find('div');
            this._leftArrow.removeClass(this.toThemeProperty('jqx-icon-arrow-left'));
            this._rightArrow.removeClass(this.toThemeProperty('jqx-icon-arrow-right'));
            this._leftArrow.removeClass(this.toThemeProperty('jqx-icon-arrow-up'));
            this._rightArrow.removeClass(this.toThemeProperty('jqx-icon-arrow-down'));
            this._leftArrow.addClass(this.toThemeProperty('jqx-icon-arrow-' + icons.prev));
            this._rightArrow.addClass(this.toThemeProperty('jqx-icon-arrow-' + icons.next));
        },

        _addButtonsHover: function () {
            var me = this, icons = { prev: 'left', next: 'right' };
            if (this.orientation === 'vertical') {
                icons = { prev: 'up', next: 'down' };
            }

            this.addHandler($(document), 'mouseup.arrow' + this.element.id, function () {
                me._leftArrow.removeClass(me.toThemeProperty('jqx-icon-arrow-' + icons.prev + '-selected'));
                me._rightArrow.removeClass(me.toThemeProperty('jqx-icon-arrow-' + icons.next + '-selected'));
                if (me.sliderTooltip) {
                    if (me.sliderTooltipTimer) {
                        clearTimeout(me.sliderTooltipTimer);
                    }

                    me.sliderTooltipTimer = setTimeout(function () {
                        me.sliderTooltip.fadeOut('fast');
                        me._mouseDown = false;
                    }, me.tooltipHideDelay);
                }
                else me._mouseDown = false;
            });

            this.addHandler(this._leftButton, 'mousedown', function () {
                if (!me.disabled) {
                    me._leftArrow.addClass(me.toThemeProperty('jqx-icon-arrow-' + icons.prev + '-selected'));
                    me._mouseDown = true;
                }
            });
            this.addHandler(this._leftButton, 'mouseup', function () {
                if (!me.disabled) {
                    me._leftArrow.removeClass(me.toThemeProperty('jqx-icon-arrow-' + icons.prev + '-selected'));
                }
            });
            this.addHandler(this._rightButton, 'mousedown', function () {
                if (!me.disabled) {
                    me._rightArrow.addClass(me.toThemeProperty('jqx-icon-arrow-' + icons.next + '-selected'));
                    me._mouseDown = true;
                }
            });
            this.addHandler(this._rightButton, 'mouseup', function () {
                if (!me.disabled) {
                    me._rightArrow.removeClass(me.toThemeProperty('jqx-icon-arrow-' + icons.next + '-selected'));
                }
            });

            this._leftButton.hover(function () {
                if (!me.disabled)
                    me._leftArrow.addClass(me.toThemeProperty('jqx-icon-arrow-' + icons.prev + '-hover'));
            }, function () {
                if (!me.disabled)
                    me._leftArrow.removeClass(me.toThemeProperty('jqx-icon-arrow-' + icons.prev + '-hover'));
            });
            this._rightButton.hover(function () {
                if (!me.disabled)
                    me._rightArrow.addClass(me.toThemeProperty('jqx-icon-arrow-' + icons.next + '-hover'));
            }, function () {
                if (!me.disabled)
                    me._rightArrow.removeClass(me.toThemeProperty('jqx-icon-arrow-' + icons.next + '-hover'));
            });
        },

        _layoutButtons: function () {
            if (this.orientation === 'horizontal') {
                this._horizontalButtonsLayout();
            } else {
                this._verticalButtonsLayout();
            }
        },

        _horizontalButtonsLayout: function () {
            var offset = (2 + Math.ceil(this.sliderButtonSize / 2));
            if (this.buttonsPosition == 'left') {
                this._leftButton.css('margin-right', '0px');
                this._rightButton.css('margin-right', offset);
            } else if (this.buttonsPosition == 'right') {
                this._leftButton.css('margin-left', 2 + offset);
                this._rightButton.css('margin-right', '0px');
            } else {
                this._leftButton.css('margin-right', offset);
                this._rightButton.css('margin-left', 2 + offset);
            }
        },

        _verticalButtonsLayout: function () {
            var offset = (2 + Math.ceil(this.sliderButtonSize / 2));
            if (this.buttonsPosition == 'left') {
                this._leftButton.css('margin-bottom', '0px');
                this._rightButton.css('margin-bottom', offset);
            } else if (this.buttonsPosition == 'right') {
                this._leftButton.css('margin-top', 2 + offset);
                this._rightButton.css('margin-bottom', '0px');
            } else {
                this._leftButton.css('margin-bottom', offset);
                this._rightButton.css('margin-top', 2 + offset);
            }
            var leftMargin = this._leftButton.css('margin-left');
            this._leftButton.css('margin-left', parseInt(leftMargin) - 1);
            this._rightButton.css('margin-left', parseInt(leftMargin) - 1);
        },

        _orderButtons: function () {
            this._rightButton.detach();
            this._leftButton.detach();
            switch (this.buttonsPosition) {
                case 'left':
                    this.host.prepend(this._rightButton);
                    this.host.prepend(this._leftButton);
                    break;
                case 'right':
                    this.host.append(this._leftButton);
                    this.host.append(this._rightButton);
                    break;
                case 'both':
                    this.host.prepend(this._leftButton);
                    this.host.append(this._rightButton);
                    break;
            }
        },

        _performRangeBarLayout: function () {
            this._rangeBar[this._getSetting('oSize')](this._track[this._getSetting('oSize')]());
            this._rangeBar[this._getSetting('size')](this._track[this._getSetting('size')]());
            this._rangeBar.css('position', 'absolute');
            this._rangeBar.css('left', 0);
            this._rangeBar.css('top', 0);
        },

        _centerElement: function (element) {
            var displacement = -1 + ($(element.parent())[this._getSetting('oSize')]() - element[this._getSetting('outerOSize')]()) / 2;
            element.css('margin-' + [this._getSetting('left')], 0);
            element.css('margin-' + [this._getSetting('top')], displacement);
            return element;
        },

        _raiseEvent: function (id, arg) {
            var evt = this._events[id];
            var event = new $.Event(evt);

            if (this._triggerEvents === false)
                return true;

            event.args = arg;
            if (id == 0) {
                event.args.type = this.changeType;
                this.changeType = null;
            }
            if (id === 1) {
                event.args.cancel = false;
                this._slideEvent = event;
            }
            this._lastValue[id] = arg.value;
            event.owner = this;
            var result = this.host.trigger(event);
            return result;
        },

        //Initializing the slider - setting it's values, disabling it if
        //disabled is true and setting tab-indexes for the keyboard navigation
        _initialSettings: function () {
            if (this.int64 === false) {
                if (this.rangeSlider) {
                    if (typeof this.value !== 'number') {
                        this.setValue(this.value);
                    } else {
                        this.setValue(this.values);
                    }
                } else {
                    if (this.value == undefined) this.value = 0;
                    this.setValue(this.value);
                }
            } else {
                if (this.rangeSlider === false || Array.isArray(this._value64) === true) {
                    this.setValue(this._value64);
                } else {
                    this.setValue(this._values64);
                }
            }

            if (this.disabled) {
                this.disable();
            }
        },

        _addEventHandlers: function () {
            var self = this;
            this.addHandler(this._slider.right, this._getEvent('mousedown'), this._startDrag, { self: this });
            this.addHandler(this._slider.left, this._getEvent('mousedown'), this._startDrag, { self: this });
            this.addHandler($(document), this._getEvent('mouseup') + '.' + this.element.id, function () {
                self._stopDrag();
            });

            try {
                if (document.referrer != "" || window.frameElement) {
                    if (window.top != null && window.top != window.self) {
                        var eventHandle = function (event) {
                            self._stopDrag();
                        };
                        var parentLocation = null;
                        if (window.parent && document.referrer) {
                            parentLocation = document.referrer;
                        }

                        if (parentLocation && parentLocation.indexOf(document.location.host) != -1) {
                            if (window.top.document) {
                                if (window.top.document.addEventListener) {
                                    window.top.document.addEventListener('mouseup', eventHandle, false);

                                } else if (window.top.document.attachEvent) {
                                    window.top.document.attachEvent("on" + 'mouseup', eventHandle);
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
            }

            this.addHandler($(document), this._getEvent('mousemove') + '.' + this.element.id, this._performDrag, { self: this });
            var me = this;
            this.addHandler(this._slider.left, 'mouseenter', function () {
                if (!me.disabled)
                    self._slider.left.addClass(self.toThemeProperty('jqx-fill-state-hover'));
            });

            this.addHandler(this._slider.right, 'mouseenter', function () {
                if (!me.disabled)
                    self._slider.right.addClass(self.toThemeProperty('jqx-fill-state-hover'));
            });

            this.addHandler(this._slider.left, 'mouseleave', function () {
                if (!me.disabled)
                    self._slider.left.removeClass(self.toThemeProperty('jqx-fill-state-hover'));
            });

            this.addHandler(this._slider.right, 'mouseleave', function () {
                if (!me.disabled)
                    self._slider.right.removeClass(self.toThemeProperty('jqx-fill-state-hover'));
            });

            this.addHandler(this._slider.left, 'mousedown', function () {
                if (!me.disabled)
                    self._slider.left.addClass(self.toThemeProperty('jqx-fill-state-pressed'));
            });

            this.addHandler(this._slider.right, 'mousedown', function () {
                if (!me.disabled)
                    self._slider.right.addClass(self.toThemeProperty('jqx-fill-state-pressed'));
            });

            this.addHandler(this._slider.left, 'mouseup', function () {
                if (!me.disabled)
                    self._slider.left.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));
            });

            this.addHandler(this._slider.right, 'mouseup', function () {
                if (!me.disabled)
                    self._slider.right.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));
            });

            this.addHandler(this._leftButton, this._getEvent('click'), this._leftButtonHandler, { self: this });
            this.addHandler(this._rightButton, this._getEvent('click'), this._rightButtonHandler, { self: this });
            this.addHandler(this._track, this._getEvent('mousedown'), this._trackMouseDownHandler, { self: this });
            this.addHandler(this.host, 'focus', function () {
                self._track.addClass(self.toThemeProperty('jqx-fill-state-focus'));
                self._leftButton.addClass(self.toThemeProperty('jqx-fill-state-focus'));
                self._rightButton.addClass(self.toThemeProperty('jqx-fill-state-focus'));
                self._slider.right.addClass(self.toThemeProperty('jqx-fill-state-focus'));
                self._slider.left.addClass(self.toThemeProperty('jqx-fill-state-focus'));
            });
            this.addHandler(this.host, 'blur', function () {
                self._leftButton.removeClass(self.toThemeProperty('jqx-fill-state-focus'));
                self._rightButton.removeClass(self.toThemeProperty('jqx-fill-state-focus'));
                self._track.removeClass(self.toThemeProperty('jqx-fill-state-focus'));
                self._slider.right.removeClass(self.toThemeProperty('jqx-fill-state-focus'));
                self._slider.left.removeClass(self.toThemeProperty('jqx-fill-state-focus'));
            });

            this.element.onselectstart = function () { return false; }
            this._addMouseWheelListeners();
            this._addKeyboardListeners();
        },

        _addMouseWheelListeners: function () {
            var self = this;
            this.addHandler(this.host, 'mousewheel', function (event) {
                if (self.disabled) {
                    return true;
                }
                self.changeType = "mouse";

                if (document.activeElement && !$(document.activeElement).ischildof(self.host)) {
                    return true;
                }

                var scroll = event.wheelDelta;
                if (event.originalEvent && event.originalEvent.wheelDelta) {
                    event.wheelDelta = event.originalEvent.wheelDelta;
                }

                if (!('wheelDelta' in event)) {
                    scroll = event.detail * -40;
                }
                if (scroll > 0) {
                    self.incrementValue();
                } else {
                    self.decrementValue();
                }
                event.preventDefault();
            });
        },

        _addKeyboardListeners: function () {
            var self = this;
            this.addHandler(this.host, 'keydown', function (event) {
                self.changeType = "keyboard";
                switch (event.keyCode) {
                    case 40:
                    case 37:    //left arrow
                        if (self.layout == 'normal' && !self.rtl) {
                            self.decrementValue();
                        }
                        else self.incrementValue();

                        return false;
                    case 38:
                    case 39:    //right arrow
                        if (self.layout == 'normal' && !self.rtl) {
                            self.incrementValue();
                        }
                        else self.decrementValue();
                        return false;
                    case 36:    //home
                        if (self.rangeSlider) {
                            self.setValue([self.values[0], self.max]);
                        } else {
                            self.setValue(self.min);
                        }
                        return false;
                    case 35:    //end
                        if (self.rangeSlider) {
                            self.setValue([self.min, self.values[1]]);
                        } else {
                            self.setValue(self.max);
                        }
                        return false;
                }
            });
        },

        _trackMouseDownHandler: function (event) {
            var touches = $.jqx.mobile.getTouches(event);
            var touch = touches[0];
            var self = event.data.self,
                event = (self._isTouchDevice) ? touch : event,
                position = self._track.coord()[self._getSetting('left')],
                pagePos = event[self._getSetting('page')] - self._slider.left[self._getSetting('size')]() / 2,
                slider = self._getClosest(pagePos),
                size = parseInt(self._track[self._getSetting('size')]());
            var value = self._getValueByPosition(pagePos);
            self._mouseDown = true;
            self.changeType = "mouse";
            self._setValue(value, slider);
            if (self.input) {
                $.jqx.aria(self, 'aria-valuenow', self.input.val());
            }
        },

        _getClosest: function (position) {
            if (!this.rangeSlider) {
                return this._slider.right;
            } else {
                position = position - this._track.coord()[this._getSetting('left')] - this._slider.left[this._getSetting('size')]() / 2;
                if (Math.abs(parseInt(this._slider.left.css(this._getSetting('left')), 10) - position) <
                Math.abs(parseInt(this._slider.right.css(this._getSetting('left')), 10) - position)) {
                    return this._slider.left;
                } else {
                    return this._slider.right;
                }
            }
        },

        _removeEventHandlers: function () {
            this.removeHandler(this._slider.right, this._getEvent('mousedown'), this._startDrag);
            this.removeHandler(this._slider.left, this._getEvent('mousedown'), this._startDrag);
            this.removeHandler($(document), this._getEvent('mouseup') + '.' + this.host.attr('id'), this._stopDrag);
            this.removeHandler($(document), this._getEvent('mousemove') + '.' + this.host.attr('id'), this._performDrag);
            this.removeHandler(this._leftButton, this._getEvent('click'), this._leftButtonHandler);
            this.removeHandler(this._rightButton, this._getEvent('click'), this._rightButtonHandler);
            this.removeHandler(this._track, this._getEvent('mousedown'), this._trackMouseDownHandler);
            this.element.onselectstart = null;
            this.removeHandler(this.host, this._getEvent('mousewheel'));
            this.removeHandler(this.host, this._getEvent('keydown'));
        },

        _rightButtonClick: function () {
            this.changeType = "mouse";

            if (this.orientation == 'horizontal' && !this.rtl) {
                this.incrementValue();
            }
            else {
                this.decrementValue();
            }
        },

        _leftButtonClick: function () {
            this.changeType = "mouse";

            if (this.orientation == 'horizontal' && !this.rtl) {
                this.decrementValue();
            }
            else this.incrementValue();
        },

        _rightButtonHandler: function (event) {
            var self = event.data.self;
            if (self.layout == 'normal') {
                self._rightButtonClick();
            } else self._leftButtonClick();
            return false;
        },

        _leftButtonHandler: function (event) {
            var self = event.data.self;
            if (self.layout == 'normal') {
                self._leftButtonClick();
            }
            else self._rightButtonClick();
            return false;
        },

        _startDrag: function (event) {
            var touches = $.jqx.mobile.getTouches(event);
            var touch = touches[0];

            var self = event.data.self;
            self.changeType = "mouse";

            self._capturedElement = $(event.target);
            self._startX = $(event.target).coord().left;
            self._startY = $(event.target).coord().top;

            var position = $.jqx.position(event);
            self._mouseStartX = position.left;
            self._mouseStartY = position.top;
            self._mouseDown = true;
            if (self.tooltip) {
                self._showTooltip(self._capturedElement, self.value);
            }
            //       self.focus();
            if (self._isTouchDevice) {
                return false;
            }
        },

        _stopDrag: function () {
            var self = this;
            if (self._slideStarted) {   //if the slideStart event have been triggered and the user is dropping the thumb we are firing a slideStop event
                self._raiseEvent(2, { value: self.getValue() });
            }
            if (!self._slideStarted || self._capturedElement == null) {
                self._capturedElement = null;
                return;
            }

            if (this.input) {
                $.jqx.aria(this, 'aria-valuenow', this.input.val());
            }
            self._slider.left.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));
            self._slider.right.removeClass(self.toThemeProperty('jqx-fill-state-pressed'));

            self._slideStarted = false;
            self._capturedElement = null;
            if (self.sliderTooltip) {
                self.sliderTooltip.fadeOut('fast');
            }
        },

        _performDrag: function (event) {
            var self = event.data.self;
            if (self._capturedElement !== null) {
                var touches = $.jqx.mobile.getTouches(event);
                var touch = touches[0];

                if (event.which === 0 && $.jqx.browser.msie && $.jqx.browser.version < 9) {
                    self._stopDrag();
                    return false;
                }
                var position = $.jqx.position(event);
                var p = self.orientation == "horizontal" ? position.left : position.top;
                //if the thumb is dragged more than 3 pixels we are firing an event
                self._isDragged(p)
                if (self._slideStarted || self._isTouchDevice) {
                    return self._dragHandler(p);
                }
            }
        },

        _isDragged: function (position) {
            if (Math.abs(position - this[this._getSetting('mouse')]) > 2 && !this._slideStarted) {
                this._slideStarted = true;
                if (this._valueChanged(3)) {
                    this._raiseEvent(3, { value: this.getValue() });
                }
            } else {
                if (this._capturedElement === null) {
                    this._slideStarted = false;
                }
            }
        },

        _dragHandler: function (position) {
            position = (position - this[this._getSetting('mouse')]) + this[this._getSetting('start')];
            var newvalue = this._getValueByPosition(position);
            if (this.rangeSlider) {
                var second = this._slider.right,
                     first = this._slider.left;
                var dimension = this._getSetting('left');

                if (this._capturedElement[0] === first[0]) {
                    if (parseFloat(position) > second.coord()[dimension]) {
                        position = second.coord()[dimension];
                    }
                } else {
                    if (parseFloat(position) < first.coord()[dimension]) {
                        position = first.coord()[dimension];
                    }
                }
            }
            this._setValue(newvalue, this._capturedElement, position);
            return false;
        },

        _getValueByPosition: function (position) {
            if (this.mode === 'default') {
                return this._getFloatingValueByPosition(position);
            } else {
                return this._getFixedValueByPosition(position);
            }
        },

        _getFloatingValueByPosition: function (position) {
            var relativePosition = position - this._track.coord()[this._getSetting('left')] + this._slider.left.width() / 2,
                ratio = relativePosition / this._track[this._getSetting('size')](),
                value;

            if (relativePosition < 0) {
                relativePosition = 0;
            }

            if (this.int64 === false) {
                value = (this.max - this.min) * ratio + this.min;
            } else {
                var size = new $.jqx.math().fromNumber(this._track[this._getSetting('size')](), 10);
                var minMaxRange = this._max64.subtract(this._min64);
                var coefficient = Math.round(this._divide64(minMaxRange, size) * relativePosition);
                value = new $.jqx.math().fromNumber(coefficient, 10).add(this._min64);
            }

            if (this.layout == 'normal') {
                if (this.orientation === 'horizontal' && !this.rtl) {
                    return value;
                } else {
                    return (this.max + this.min) - value;
                }
            }
            else {
                if (this.orientation === 'horizontal' && !this.rtl) {
                    if (this.int64 === false) {
                        return (this.max + this.min) - value;
                    } else {
                        return (this._max64.add(this._min64)).subtract(value);
                    }
                } else {
                    return value;
                }
            }
        },

        _getThumbSize: function () {
            if (this.__thumbSize)
                return this.__thumbSize;

            var __thumbSize = this._slider.left[this._getSetting('size')]();
            this.__thumbSize = __thumbSize;
            return __thumbSize;
        },


        _getTrackSize: function () {
            if (this.__trackSize)
                return this.__trackSize;

            var __trackSize = this._track[this._getSetting('size')]();
            this.__trackSize = __trackSize;
            return __trackSize;
        },

        _getFixedValueByPosition: function (position) {
            var trackSize = this._getTrackSize(),
                thumbSize = this._getThumbSize(),
                closestSector = { number: -1, distance: Number.MAX_VALUE },
                step, sectorSize, count, currentSectorPosition;
            //position -= this._track.coord()[this._getSetting('left')];

            if (this.int64 === false) {
                step = this.step;
                count = (this.max - this.min) / step;
                sectorSize = (trackSize) / count;
                currentSectorPosition = this._track.coord()[this._getSetting('left')] - thumbSize / 2;
                var max = this.max + this.step;
                if (this.mode == "fixedRange") {
                    max = this.max;
                }
                for (var sector = this.min; sector <= max; sector += this.step) {
                    if (Math.abs(closestSector.distance - position) > Math.abs(currentSectorPosition - position)) {
                        closestSector.distance = currentSectorPosition;
                        closestSector.number = sector;
                    }
                    currentSectorPosition += sectorSize;
                }
            } else {
                step = this._step64;
                count = (this._max64.subtract(this._min64)).div(this._step64);
                sectorSize = new $.jqx.math().fromNumber(trackSize, 10).div(count).toNumber();
                currentSectorPosition = this._track.coord()[this._getSetting('left')] - thumbSize / 2;
                closestSector = { number: new $.jqx.math().fromString(this._min64.toString(), 10), distance: currentSectorPosition };

                for (var sector64 = new $.jqx.math().fromString(this._min64.toString(), 10) ; this.mode != "fixedRange" ? sector64.lessThanOrEqual(this._max64.add(this._step64)) : sector64.lessThanOrEqual(this._max64) ; sector64 = sector64.add(this._step64)) {
                    if (Math.abs(closestSector.distance - position) > Math.abs(currentSectorPosition - position)) {
                        closestSector.distance = currentSectorPosition;
                        closestSector.number = new $.jqx.math().fromString(sector64.toString(), 10);
                    }
                    currentSectorPosition += sectorSize;
                }
            }

            if (this.layout == "normal") {
                if (this.orientation === 'horizontal' && !this.rtl) {
                    return closestSector.number;
                } else {
                    return (this.max + this.min) - closestSector.number;
                }
            }
            else {
                if (this.orientation === 'horizontal' && !this.rtl) {
                    return (this.max + this.min) - closestSector.number;
                } else {
                    return closestSector.number;
                }
            }
        },

        _setValue: function (value, slider, position) {
            if (!this._slideEvent || !this._slideEvent.args.cancel) {
                value = this._handleValue(value, slider);
                this._setSliderPosition(value, slider, position);
                this._fixZIndexes();
                if (this._valueChanged(1)) {
                    var event = this._raiseEvent(1, { value: this.getValue() });
                }
                if (this._valueChanged(0)) {
                    this._raiseEvent(0, { value: this.getValue() });
                }
                if (this.input) {
                    if (!this.rangeSlider) {
                        this.input.val(this.value.toString());
                    }
                    else {
                        if (this.values) {
                            if (this.value.rangeEnd != undefined && this.value.rangeStart != undefined) {
                                this.input.val(this.value.rangeStart.toString() + "-" + this.value.rangeEnd.toString());
                            }
                        }
                    }
                }
            }
        },

        _valueChanged: function (id) {
            var value = this.getValue();
            return (!this.rangeSlider && this._lastValue[id] !== value) ||
                    (this.rangeSlider && (typeof this._lastValue[id] !== 'object' ||
                     parseFloat(this._lastValue[id].rangeEnd) !== parseFloat(value.rangeEnd) || parseFloat(this._lastValue[id].rangeStart) !== parseFloat(value.rangeStart)));
        },

        _handleValue: function (value, slider) {
            value = this._validateValue(value, slider);
            if (slider[0] === this._slider.left[0]) {
                this.values[0] = this.int64 ? value.toString() : value;
                if (this.int64 === true) {
                    this._value64[0] = value;
                }
            }
            if (slider[0] === this._slider.right[0]) {
                this.values[1] = this.int64 ? value.toString() : value;
                if (this.int64 === true) {
                    this._values64[1] = value;
                }
            }
            if (this.rangeSlider) {
                this.value = { rangeStart: this.values[0], rangeEnd: this.values[1] };
                if (this.int64 === true) {
                    this._value64 = { rangeStart: this._values64[0], rangeEnd: this._values64[1] };
                }
            } else {
                if (this.int64 === false) {
                    this.value = value;
                } else {
                    this.value = value.toString();
                    this._value64 = value;
                }
            }
            return value;
        },

        _fixZIndexes: function () {
            if (this.values[1] - this.values[0] < 0.5 && this.max - this.values[0] < 0.5) {
                this._slider.left.css('z-index', 20);
                this._slider.right.css('z-index', 15);
            } else {
                this._slider.left.css('z-index', 15);
                this._slider.right.css('z-index', 20);
            }
        },

        _refreshRangeBar: function () {
            var _left = this._getSetting('left');
            var _size = this._getSetting('size');

            var isRTL = this.rtl && this.orientation == 'horizontal';

            if (this.layout == "normal") {
                var position = this._slider.left.position()[_left];
                if (this.orientation === 'vertical' || isRTL) {
                    position = this._slider.right.position()[_left];
                }
            }
            else {
                var position = this._slider.right.position()[_left];
                if (this.orientation === 'vertical' || isRTL) {
                    var position = this._slider.left.position()[_left];
                }
            }

            this._rangeBar.css(_left, position + this._slider.left[_size]() / 2);

            this._rangeBar[_size](Math.abs(
                this._slider.right.position()[_left] - this._slider.left.position()[_left]));
        },

        _validateValue: function (value, slider) {

            if (this.int64 === false) {
                if (value > this.max) {
                    value = this.max;
                }
                if (value < this.min) {
                    value = this.min;
                }

                if (this.rangeSlider) {
                    if (slider[0] === this._slider.left[0]) {
                        if (value >= this.values[1]) {
                            value = this.values[1];
                        }
                    } else {
                        if (value <= this.values[0]) {
                            value = this.values[0];
                        }
                    }
                }
            } else {
                if (value.greaterThan(this._max64)) {
                    value = this._max64;
                }
                if (value.lessThan(this._min64)) {
                    value = this._min64;
                }
            }

            return value;
        },

        _setSliderPosition: function (value, thumb, position) {
            var trackSize = this._track[this._getSetting('size')](), ratio, distance;
            if (position) {
                position -= this._track.coord()[this._getSetting('left')];
            }

            if (this.int64) {
                if (typeof value === 'number') {
                    value = new $.jqx.math().fromNumber(value, 10);
                } else if (typeof value === 'string') {
                    value = new $.jqx.math().fromString(value, 10);
                }

                if (value.greaterThan(this._max64)) {
                    value = new $.jqx.math().fromString(this._max64.toString(), 10);
                }
                if (value.lessThan(this._min64)) {
                    value = new $.jqx.math().fromString(this._min64.toString(), 10);
                }

                var ratio1 = this._divide64(value.subtract(this._min64), this._max64.subtract(this._min64));
                var ratio2 = 1 - ratio1;
                if (this.layout == "normal") {
                    var ratio = ratio1;

                    if (this.orientation != 'horizontal' || (this.orientation == 'horizontal' && this.rtl)) {
                        ratio = ratio2;
                    }
                }
                else {
                    var ratio = ratio2;
                    if (this.orientation != 'horizontal' || (this.orientation == 'horizontal' && this.rtl)) {
                        ratio = ratio1;
                    }
                }

                distance = trackSize * ratio - this._slider.left[this._getSetting('size')]() / 2;
                thumb.css(this._getSetting('left'), distance);
            } else {
                if (this.layout == "normal") {
                    var ratio = (value - this.min) / (this.max - this.min);

                    if (this.orientation != 'horizontal' || (this.orientation == 'horizontal' && this.rtl)) {
                        ratio = 1 - ((value - this.min) / (this.max - this.min));
                    }
                }
                else {
                    var ratio = 1 - ((value - this.min) / (this.max - this.min));
                    if (this.orientation != 'horizontal' || (this.orientation == 'horizontal' && this.rtl)) {
                        ratio = (value - this.min) / (this.max - this.min);
                    }
                }

                distance = trackSize * ratio - this._slider.left[this._getSetting('size')]() / 2;
                thumb.css(this._getSetting('left'), distance);
            }

            if (this.tooltip) {
                this._showTooltip(thumb, this.value);
            }

            this._refreshRangeBar();
        },

        // divides two long numbers and returns a float result
        _divide64: function (first, second) {
            var firstString,
                firstFloat,
                secondString,
                secondFloat,
                result;

            firstString = first.toString();
            secondString = second.toString();

            if (secondString.length > 15) {
                var floatOffset = secondString.length - 15;
                secondString = secondString.slice(0, 15) + '.' + secondString.slice(15);
                secondFloat = parseFloat(secondString);

                if (firstString.length > floatOffset) {
                    var firstOffset = firstString.length - floatOffset;
                    firstString = firstString.slice(0, firstOffset) + '.' + firstString.slice(firstOffset);
                } else if (firstString.length === floatOffset) {
                    firstString = '0.' + firstString;
                } else {
                    var prefix = '0.';
                    for (var i = 0; i < floatOffset - firstString.length; i++) {
                        prefix += '0';
                    }
                    firstString = prefix + '' + firstString;
                }
                firstFloat = parseFloat(firstString);
            } else {
                firstFloat = first.toNumber();
                secondFloat = second.toNumber();
            }

            result = firstFloat / secondFloat;

            return result;
        },

        _showTooltip: function (thumb, value) {
            var that = this;
            if (that._slideStarted || that._capturedElement != null || that._mouseDown) {

                if (that.tooltipFormatFunction) {
                    value = that.tooltipFormatFunction(value);
                }
                else if (that.mode === "default") {
                    value = new Number(value).toFixed(2);
                }

                if (!that.toolTipCreated) {
                    var newID = "tooltip" + that.element.id;
                    // appends the tooltip div to the body
                    var tooltipHTML = $('<div id="' + newID + '"><div id ="' + newID + 'Main"><div id="' + newID + 'Text"></div></div><div id="' + newID + 'Arrow"></div></div>');
                    tooltipHTML.css("visibility", "hidden");
                    tooltipHTML.css("display", "none");
                    tooltipHTML.css("z-index", 99999);
                    tooltipHTML.css("box-shadow", "none");
                    that.sliderTooltip = tooltipHTML;
                    that.sliderTooltip.appendTo($(document.body));
                    $("#" + newID + 'Text').html(value);
                    var id = "#" + newID;
                    var $main = $(id + 'Main');
                    var $text = $(id + 'Text');
                    var $arrow = $(id + 'Arrow');

                    $main.addClass(that.toThemeProperty("jqx-widget"));
                    $text.addClass(that.toThemeProperty("jqx-widget"));
                    $arrow.addClass(that.toThemeProperty("jqx-widget"));

                    $main.addClass(that.toThemeProperty("jqx-fill-state-normal"));
                    $text.addClass(that.toThemeProperty("jqx-fill-state-normal"));
                    $arrow.addClass(that.toThemeProperty("jqx-fill-state-normal"));

                    $(id).addClass(that.toThemeProperty("jqx-tooltip"));
                    $(id).addClass(that.toThemeProperty("jqx-popup"));
                    $main.addClass(that.toThemeProperty("jqx-tooltip-main"));
                    $text.addClass(that.toThemeProperty("jqx-tooltip-text"));
                    $arrow.addClass(that.toThemeProperty("jqx-tooltip-arrow"));
                    that.sliderTooltipContent = $text;
                    that.sliderTooltipArrow = $arrow;
                    that.sliderTooltipMain = $main;
                    that.arrow_size = 5;
                    that.toolTipCreated = true;
                    if (that.rangeSlider) {
                        that.sliderTooltipArrow.css('visibility', 'hidden');
                    }
                }

                var thumbPosition = thumb.coord();
                that.sliderTooltip[0].style.display = "block";
                that.sliderTooltip[0].style.visibility = "visible";


                var size = that.sliderButtonSize + that.tickSize;

                if (!that.rangeSlider) {
                    that.sliderTooltipContent[0].innerHTML = value;
                }
                else {
                    var from = that.value ? that.value.rangeStart : "";
                    var to = that.value ? that.value.rangeEnd : "";
                    if (from !== "") {
                        that.sliderTooltipContent[0].innerHTML = from + " - " + to;
                    }
                    else {
                        that.sliderTooltip[0].style.display = "none";
                        that.sliderTooltip[0].style.visibility = "hidden";
                    }
                }

                var tooltipWidth = that.sliderTooltip.width();

                if (that.orientation == "horizontal") {
                    var left = thumbPosition.left + that.sliderButtonSize / 2 - tooltipWidth / 2;
                    if (that.rangeSlider) {
                        var distance = (that._slider.right.coord().left - that._slider.left.coord().left - that._thumbSize) / 2;
                        left = that._slider.left.coord().left - tooltipWidth / 2 + distance + that._thumbSize;
                    }

                    switch (that.tooltipPosition) {
                        case "far":
                            var top = thumbPosition.top + size + that.arrow_size;
                            that.sliderTooltip.offset({ top: top, left: left });
                            that.sliderTooltipArrow.addClass(that.toThemeProperty("jqx-tooltip-arrow-t-b"));
                            that.sliderTooltipArrow.css({ "border-width": "0 " + that.arrow_size + "px " + that.arrow_size + "px" });
                            that.sliderTooltipArrow.offset({ top: top - that.arrow_size, left: left - that.arrow_size / 2 - 1 + tooltipWidth / 2 });
                            break;
                        case "near":
                            var top = thumbPosition.top - that.arrow_size - that.sliderTooltip.height() - 1;
                            that.sliderTooltip.offset({ top: top, left: left });
                            that.sliderTooltipArrow.addClass(that.toThemeProperty("jqx-tooltip-arrow-t-b"));
                            that.sliderTooltipArrow.css({ "border-width": that.arrow_size + "px " + that.arrow_size + "px  0px" });
                            that.sliderTooltipArrow.offset({ top: top + that.sliderTooltip.height(), left: left - that.arrow_size / 2 - 1 + tooltipWidth / 2 });
                            break;
                    }
                }
                else {
                    var tooltipHeight = that.sliderTooltip.height();
                    var left = thumbPosition.left - tooltipWidth - that.arrow_size - that.tickSize;
                    var top = thumbPosition.top + that._thumbSize / 2 - tooltipHeight / 2 - 1;
                    if (that.rangeSlider) {
                        var distance = (that._slider.right.coord().top - that._slider.left.coord().top - that._thumbSize) / 2;
                        top = that._slider.left.coord().top - tooltipHeight / 2 + distance + that._thumbSize;
                    }

                    switch (that.tooltipPosition) {
                        case "far":
                            var left = thumbPosition.left + that._thumbSize + that.arrow_size + that.tickSize;
                            that.sliderTooltip.offset({ top: top, left: left });
                            that.sliderTooltipArrow.addClass(that.toThemeProperty("jqx-tooltip-arrow-l-r"));
                            that.sliderTooltipArrow.css({ "border-width": that.arrow_size + "px " + that.arrow_size + "px " + that.arrow_size + "px 0px" });
                            that.sliderTooltipArrow.offset({ top: top + that.sliderTooltip.height() / 2 - that.arrow_size / 2 - 2, left: left - that.arrow_size });
                            break;
                        case "near":
                            that.sliderTooltip.offset({ top: top, left: left });
                            that.sliderTooltipArrow.addClass(that.toThemeProperty("jqx-tooltip-arrow-l-r"));
                            that.sliderTooltipArrow.css({ "border-width": that.arrow_size + "px 0px " + that.arrow_size + "px " + that.arrow_size + "px" });
                            that.sliderTooltipArrow.offset({ top: top + that.sliderTooltip.height() / 2 - that.arrow_size / 2 - 2, left: left + tooltipWidth + 2 });
                            break;
                    }
                }
            }
        },

        _validateDropPosition: function (distance, thumb) {
            var trackSize = this._track[this._getSetting('size')](),
                sliderWidth = thumb[this._getSetting('size')]();
            if (distance < -sliderWidth / 2) {
                distance = -sliderWidth / 2;
            }
            if (distance > trackSize - sliderWidth / 2) {
                distance = trackSize - sliderWidth / 2;
            }
            return Math.floor(distance);
        },

        propertyChangedHandler: function (object, key, oldvalue, value) {
            object.__trackSize = null;
            object.__thumbSize = null;
            switch (key) {
                case 'theme':
                    $.jqx.utilities.setTheme(oldvalue, value, object.host);
                    object._leftButton.jqxRepeatButton({ theme: value });
                    object._rightButton.jqxRepeatButton({ theme: value });
                    break;
                case 'disabled':
                    if (value) {
                        object.disabled = true;
                        object.disable();
                    } else {
                        object.disabled = false;
                        object.enable();
                    }
                    break;
                case 'width':
                case 'height':
                    object.__trackSize = null;
                    object.__thumbSize = null;
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'min':
                case 'max':
                    object._performLayout();
                    object.__trackSize = null;
                    object.__thumbSize = null;
                    if (object.int64 === true) {
                        object['_' + key + '64'] = new $.jqx.math().fromString(value.toString(), 10);
                    }
                    object._initialSettings();
                    break;
                case 'showTicks':
                case 'ticksPosition':
                case 'tickSize':
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'ticksFrequency':
                case 'minorTicksFrequency':
                    if (object.int64 === true) {
                        object['_' + key + '64'] = new $.jqx.math().fromString(value.toString(), 10);
                    }

                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'showRange':
                case 'showButtons':
                case 'orientation':
                case 'rtl':
                    object._render();
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'buttonsPosition':
                    object._refresh();
                    break;
                case 'rangeSlider':
                    if (!value) {
                        object.value = object.value.rangeEnd;
                    } else {
                        object.value = { rangeEnd: object.value, rangeStart: object.value };
                    }
                    object._render();
                    object._performLayout();
                    object._initialSettings();
                    break;
                case 'value':
                    var val = value;

                    if (object.int64 === true) {
                        val = new $.jqx.math().fromString(value.toString(), 10);
                        object._value64 = val;
                    } else {
                        if (!object.rangeSlider) {
                            object.value = parseFloat(value);
                        }
                    }

                    object.setValue(val);
                    break;
                case 'values':
                    var vals = value;
                    if (object.int64 === true) {
                        vals = [new $.jqx.math().fromString(value[0].toString(), 10), new $.jqx.math().fromString(value[1].toString(), 10)];
                        object._values64 = vals;
                    }
                    object.setValue(vals);
                    break;
                case 'tooltip':
                    break;
                case 'step':
                    object._step64 = new $.jqx.math().fromString(value.toString(), 10);
                    break;
                default: object._refresh();
            }
        },

        //Increment slider's value. If it's a range slider it's increment it's end range.
        incrementValue: function (step) {
            if (this.int64 === false) {
                if (step == undefined || isNaN(parseFloat(step))) {
                    step = this.step;
                }
                if (this.rangeSlider) {
                    if (this.values[1] < this.max) {
                        this._setValue(this.values[1] + step, this._slider.right);
                    }
                } else {
                    if (this.values[1] >= this.min && this.values[1] < this.max) {
                        this._setValue(this.values[1] + step, this._slider.right);
                    }
                }
            } else {
                if (step == undefined || isNaN(parseFloat(step))) {
                    step = this._step64;
                } else {
                    step = new $.jqx.math().fromString(step.toString(), 10);
                }

                var newValue = this._values64[1].add(step);
                if (newValue.lessThan(this._values64[1])) {
                    newValue = this._max64;
                }
                if (this.rangeSlider) {
                    if (this._values64[1].lessThan(this._max64)) {
                        this._setValue(newValue, this._slider.right);
                    }
                } else {
                    if (this._values64[1].greaterThanOrEqual(this._min64) && this._values64[1].lessThan(this._max64)) {
                        this._setValue(newValue, this._slider.right);
                    }
                }
            }

            if (this.input) {
                $.jqx.aria(this, 'aria-valuenow', this.input.val());
            }
        },

        //Decrementing slider's value. If it's range slider it's decrement it's start range.
        decrementValue: function (step) {
            if (this.int64 === false) {
                if (step == undefined || isNaN(parseFloat(step))) {
                    step = this.step;
                }
                if (this.rangeSlider) {
                    if (this.values[0] > this.min) {
                        this._setValue(this.values[0] - step, this._slider.left);
                    }
                } else {
                    if (this.values[1] <= this.max && this.values[1] > this.min) {
                        this._setValue(this.values[1] - step, this._slider.right);
                    }
                }
            } else {
                if (step == undefined || isNaN(parseFloat(step))) {
                    step = this._step64;
                } else {
                    step = new $.jqx.math().fromString(step.toString(), 10);
                }

                var newValue;
                if (this.rangeSlider) {
                    newValue = this._values64[0].subtract(step);
                    if (newValue.greaterThan(this._values64[0])) {
                        newValue = this._min64;
                    }
                    if (this._values64[0].greaterThan(this._min64)) {
                        this._setValue(newValue, this._slider.left);
                    }
                } else {
                    newValue = this._values64[1].subtract(step);
                    if (newValue.greaterThan(this._values64[1])) {
                        newValue = this._min64;
                    }
                    if (this._values64[1].lessThanOrEqual(this._max64) && this._values64[1].greaterThan(this._min64)) {
                        this._setValue(newValue, this._slider.right);
                    }
                }
            }

            if (this.input) {
                $.jqx.aria(this, 'aria-valuenow', this.input.val());
            }
        },

        val: function (value) {
            if (arguments.length == 0 || (!$.isArray(value) && typeof (value) == "object")) {
                return this.getValue();
            }
            if (this.int64 === false) {
                this.setValue(value);
            } else {
                value64 = new $.jqx.math().fromString(value.toString(), 10);
                this.setValue(value64);
            }
        },

        //Setting slider's value. Possible value types - array, one or two numbers.
        setValue: function (value) {
            if (this.rangeSlider) {
                var rangeLeft, rangeRight;
                if (arguments.length < 2) {
                    if (value instanceof Array) {
                        rangeLeft = value[0];
                        rangeRight = value[1];
                    } else if (typeof value === 'object' && typeof value.rangeStart !== 'undefined' && typeof value.rangeEnd !== 'undefined') {
                        rangeLeft = value.rangeStart;
                        rangeRight = value.rangeEnd;
                    }
                } else {
                    rangeLeft = arguments[0];
                    rangeRight = arguments[1];
                }
                this._triggerEvents = false;
                this._setValue(rangeRight, this._slider.right);
                this._triggerEvents = true;
                this._setValue(rangeLeft, this._slider.left);
            } else {
                this._triggerEvents = false;
                var min = this.int64 ? this._min64 : this.min;
                this._setValue(min, this._slider.left);
                this._triggerEvents = true;
                this._setValue(value, this._slider.right);
            }
            if (this.input) {
                $.jqx.aria(this, 'aria-valuenow', this.input.val());
            }
        },

        getValue: function () {
            var value = this.value;

            if (this.int64 === true) {
                value = this._value64.toString();
            }

            return value;
        },

        _enable: function (state) {
            if (state) {
                this._addEventHandlers();
                this.disabled = false;
                this.host.removeClass(this.toThemeProperty('jqx-fill-state-disabled'));
            }
            else {
                this._removeEventHandlers();
                this.disabled = true;
                this.host.addClass(this.toThemeProperty('jqx-fill-state-disabled'));
            }
            this._leftButton.jqxRepeatButton({ disabled: this.disabled });
            this._rightButton.jqxRepeatButton({ disabled: this.disabled });
        },

        disable: function () {
            this._enable(false);
            $.jqx.aria(this, 'aria-disabled', true);
        },

        enable: function () {
            this._enable(true);
            $.jqx.aria(this, 'aria-disabled', false);
        }
    });
})(jqxBaseFramework);
