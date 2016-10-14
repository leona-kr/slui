/*
jQWidgets v4.0.0 (2016-Jan)
Copyright (c) 2011-2016 jQWidgets.
License: http://jqwidgets.com/license/
*/


(function ($) {
    $.jqx.cssroundedcorners = function (value) {
        var cssMap = {
            'all': 'jqx-rc-all',
            'top': 'jqx-rc-t',
            'bottom': 'jqx-rc-b',
            'left': 'jqx-rc-l',
            'right': 'jqx-rc-r',
            'top-right': 'jqx-rc-tr',
            'top-left': 'jqx-rc-tl',
            'bottom-right': 'jqx-rc-br',
            'bottom-left': 'jqx-rc-bl'
        };

        for (prop in cssMap) {
            if (!cssMap.hasOwnProperty(prop))
                continue;

            if (value == prop)
                return cssMap[prop];
        }
    }

    $.jqx.jqxWidget("jqxButton", "", {});

    $.extend($.jqx._jqxButton.prototype, {
        defineInstance: function () {
            var settings = {
                cursor: 'arrow',
                // rounds the button corners.
                roundedCorners: 'all',
                // enables / disables the button
                disabled: false,
                // sets height to the button.
                height: null,
                // sets width to the button.
                width: null,
                overrideTheme: false,
                enableHover: true,
                enableDefault: true,
                enablePressed: true,
                rtl: false,
                _ariaDisabled: false,
                _scrollAreaButton: false,
                // "primary", "inverse", "danger", "info", "success", "warning", "link"
                template: "default",
                aria:
                {
                    "aria-disabled": { name: "disabled", type: "boolean" }
                }
           }
            $.extend(true, this, settings);
            return settings;
        },

        createInstance: function (args) {
            var self = this;
            self._setSize();

            if (!self._ariaDisabled) {
                self.host.attr('role', 'button');
            }
            if (!self.overrideTheme) {
                self.host.addClass(self.toThemeProperty($.jqx.cssroundedcorners(self.roundedCorners)));
                if (self.enableDefault) {
                    self.host.addClass(self.toThemeProperty('jqx-button'));
                }
                self.host.addClass(self.toThemeProperty('jqx-widget'));
            }

            self.isTouchDevice = $.jqx.mobile.isTouchDevice();
            if (!self._ariaDisabled) {
                $.jqx.aria(this);
            }

            if (self.cursor != 'arrow') {
                if (!self.disabled) {
                    self.host.css({ cursor: self.cursor });
                }
                else {
                    self.host.css({ cursor: 'arrow' });
                }
            }

            var eventNames = 'mouseenter mouseleave mousedown focus blur';
            if (self._scrollAreaButton) {
                var eventNames = 'mousedown';
            }

            if (self.isTouchDevice) {
                self.addHandler(self.host, $.jqx.mobile.getTouchEventName('touchstart'), function (event) {
                    self.isPressed = true;
                    self.refresh();
                });
                self.addHandler($(document), $.jqx.mobile.getTouchEventName('touchend') + "." + self.element.id, function (event) {
                    self.isPressed = false;
                    self.refresh();
                });
            }

            self.addHandler(self.host, eventNames, function (event) {
                switch (event.type) {
                    case 'mouseenter':
                        if (!self.isTouchDevice) {
                            if (!self.disabled && self.enableHover) {
                                self.isMouseOver = true;
                                self.refresh();
                            }
                        }
                        break;
                    case 'mouseleave':
                        if (!self.isTouchDevice) {
                            if (!self.disabled && self.enableHover) {
                                self.isMouseOver = false;
                                self.refresh();
                            }
                        }
                        break;
                    case 'mousedown':
                        if (!self.disabled) {
                            self.isPressed = true;
                            self.refresh();
                        }
                        break;
                    case 'focus':
                        if (!self.disabled) {
                            self.isFocused = true;
                            self.refresh();
                        }
                        break;
                    case 'blur':
                        if (!self.disabled) {
                            self.isFocused = false;
                            self.refresh();
                        }
                        break;
                }
            });

            self.mouseupfunc = function (event) {
                if (!self.disabled) {
                    if (self.isPressed || self.isMouseOver) {
                        self.isPressed = false;
                        self.refresh();
                    }
                }
            }

            self.addHandler($(document), 'mouseup.button' + self.element.id, self.mouseupfunc);

            try {
                if (document.referrer != "" || window.frameElement) {
                    if (window.top != null && window.top != window.self) {
                        var parentLocation = '';
                        if (window.parent && document.referrer) {
                            parentLocation = document.referrer;
                        }

                        if (parentLocation.indexOf(document.location.host) != -1) {
                            var eventHandle = function (event) {
                                self.isPressed = false;
                                self.refresh();
                            };

                            if (window.top.document) {
                                self.addHandler($(window.top.document), 'mouseup', eventHandle);
                            }
                        }
                    }
                }
            }
            catch (error) {
            }
            
            self.propertyChangeMap['roundedCorners'] = function (instance, key, oldVal, value) {
                instance.host.removeClass(instance.toThemeProperty($.jqx.cssroundedcorners(oldVal)));
                instance.host.addClass(instance.toThemeProperty($.jqx.cssroundedcorners(value)));
            };
            self.propertyChangeMap['width'] = function (instance, key, oldVal, value) {
                instance._setSize();
                instance.refresh();
            };
            self.propertyChangeMap['height'] = function (instance, key, oldVal, value) {
                instance._setSize();
                instance.refresh();
            };
            self.propertyChangeMap['disabled'] = function (instance, key, oldVal, value) {
                if (oldVal != value) {
                    instance.host[0].disabled = value;
                    instance.host.attr('disabled', value);
                    instance.refresh();
                    if (!value) {
                        instance.host.css({ cursor: instance.cursor });
                    }
                    else {
                        instance.host.css({ cursor: 'default' });
                    }

                    $.jqx.aria(instance, "aria-disabled", instance.disabled);
                }
            };
            self.propertyChangeMap['rtl'] = function (instance, key, oldVal, value) {
                if (oldVal != value) {
                    instance.refresh();
                }
            };
            self.propertyChangeMap['template'] = function (instance, key, oldVal, value) {
                if (oldVal != value) {
                    instance.host.removeClass("jqx-" + oldVal);
                    instance.refresh();
                }
            };
            self.propertyChangeMap['theme'] = function (instance, key, oldVal, value) {
                instance.host.removeClass();

                if (instance.enableDefault) {
                    instance.host.addClass(instance.toThemeProperty('jqx-button'));
                }
                instance.host.addClass(instance.toThemeProperty('jqx-widget'));
                if (!instance.overrideTheme) {
                    instance.host.addClass(instance.toThemeProperty($.jqx.cssroundedcorners(instance.roundedCorners)));
                }
                instance._oldCSSCurrent = null;
                instance.refresh();
            };
            if (self.disabled) {
                self.element.disabled = true;
                self.host.attr('disabled', true);
            }
        }, // createInstance

        resize: function (width, height) {
            this.width = width;
            this.height = height;
            this._setSize();
        },

        val: function () {
            var self = this;
            var input = self.host.find('input');
            if (input.length > 0) {
                if (arguments.length == 0 || typeof (value) == "object") {
                    return input.val();
                }
                input.val(value);
                self.refresh();
                return input.val();
            }

            if (arguments.length == 0 || typeof (value) == "object") {
                if (self.element.nodeName.toLowerCase() == "button") {
                    return $(self.element).text();
                }
                return self.element.value;
            }
            self.element.value = arguments[0];
            if (self.element.nodeName.toLowerCase() == "button") {
                $(self.element).text(arguments[0]);
            }

            self.refresh();
        },

        _setSize: function () {
            var self = this;
            if (self.width != null && (self.width.toString().indexOf("px") != -1 || self.width.toString().indexOf("%") != -1)) {
                self.host.css('width', self.width);
            }
            else {
                if (self.width != undefined && !isNaN(self.width)) {
                    self.host.css('width', self.width);
                }
            }
            if (self.height != null && (self.height.toString().indexOf("px") != -1 || self.height.toString().indexOf("%") != -1)) {
                self.host.css('height', self.height);
            }
            else if (self.height != undefined && !isNaN(self.height)) {
                self.host.css('height', parseInt(self.height));
            }
        },

        _removeHandlers: function () {
            var self = this;
            self.removeHandler(self.host, 'selectstart');
            self.removeHandler(self.host, 'click');
            self.removeHandler(self.host, 'focus');
            self.removeHandler(self.host, 'blur');
            self.removeHandler(self.host, 'mouseenter');
            self.removeHandler(self.host, 'mouseleave');
            self.removeHandler(self.host, 'mousedown');
            self.removeHandler($(document), 'mouseup.button' + self.element.id, self.mouseupfunc);
            if (self.isTouchDevice) {
                self.removeHandler(self.host, $.jqx.mobile.getTouchEventName('touchstart'));
                self.removeHandler($(document), $.jqx.mobile.getTouchEventName('touchend') + "." + self.element.id);
            }
            self.mouseupfunc = null;
            delete self.mouseupfunc;
        },

        focus: function()
        {
            this.host.focus();
        },

        destroy: function () {
            var self = this;
            self._removeHandlers();
            var vars = $.data(self.element, "jqxButton");
            if (vars) {
                delete vars.instance;
            }
            self.host.removeClass();
            self.host.removeData();
            self.host.remove();
            delete self.set;
            delete self.get;
            delete self.call;
            delete self.element;
            delete self.host;
        },

        render: function()
        {
            this.refresh();
        },

        refresh: function () {
            var self = this;
            if (self.overrideTheme)
                return;

            var cssFocused = self.toThemeProperty('jqx-fill-state-focus');
            var cssDisabled = self.toThemeProperty('jqx-fill-state-disabled');
            var cssNormal = self.toThemeProperty('jqx-fill-state-normal');

            if (!self.enableDefault) {
                cssNormal = "";
            }

            var cssHover = self.toThemeProperty('jqx-fill-state-hover');
            var cssPressed = self.toThemeProperty('jqx-fill-state-pressed');
            var cssPressedHover = self.toThemeProperty('jqx-fill-state-pressed');
            if (!self.enablePressed) {
                cssPressed = "";
            }
            var cssCurrent = '';

            if (!self.host) {
                return;
            }

            self.host[0].disabled = self.disabled;

            if (self.disabled) {
                cssCurrent = cssNormal + " " + cssDisabled;
                if (self.template !== "default" && self.template !== "") {
                    cssCurrent += " " + "jqx-" + self.template;
                }
                self.host.addClass(cssCurrent);
                self._oldCSSCurrent = cssCurrent;
                return;
            }
            else {
                if (self.isMouseOver && !self.isTouchDevice) {
                    if (self.isPressed)
                        cssCurrent = cssPressedHover;
                    else
                        cssCurrent = cssHover;
                }
                else {
                    if (self.isPressed)
                        cssCurrent = cssPressed;
                    else
                        cssCurrent = cssNormal;
                }
            }

            if (self.isFocused) {
                cssCurrent += " " + cssFocused;
            }

            if (self.template !== "default" && self.template !== "") {
                cssCurrent += " " + "jqx-" + self.template;
            }

            if (cssCurrent != self._oldCSSCurrent) {
                if (self._oldCSSCurrent) {
                    self.host.removeClass(self._oldCSSCurrent);
                }
                self.host.addClass(cssCurrent);
                self._oldCSSCurrent = cssCurrent;
            }
            if (self.rtl) {
                self.host.addClass(self.toThemeProperty('jqx-rtl'));
                self.host.css('direction', 'rtl');
            }
        }
    });

    //// LinkButton
    $.jqx.jqxWidget("jqxLinkButton", "", {});

    $.extend($.jqx._jqxLinkButton.prototype, {
        defineInstance: function () {
            // enables / disables the button
            this.disabled = false;
            // sets height to the button.
            this.height = null;
            // sets width to the button.
            this.width = null;
            this.rtl = false;
            this.href = null;
        },

        createInstance: function (args) {
            var self = this;
            this.host.onselectstart = function () { return false; };
            this.host.attr('role', 'button');

            var height = this.height || this.host.height();
            var width = this.width || this.host.width();
            this.href = this.host.attr('href');
            this.target = this.host.attr('target');
            this.content = this.host.text();
            this.element.innerHTML = "";
            this.host.append("<input type='button' class='jqx-wrapper'/>");
            var wrapElement = this.host.find('input');
            wrapElement.addClass(this.toThemeProperty('jqx-reset'));
            wrapElement.width(width);
            wrapElement.height(height);
            wrapElement.val(this.content);
            this.host.find('tr').addClass(this.toThemeProperty('jqx-reset'));
            this.host.find('td').addClass(this.toThemeProperty('jqx-reset'));
            this.host.find('tbody').addClass(this.toThemeProperty('jqx-reset'));
            this.host.css('color', 'inherit');
            this.host.addClass(this.toThemeProperty('jqx-link'));

            wrapElement.css({ width: width });
            wrapElement.css({ height: height });
            var param = args == undefined ? {} : args[0] || {};
            wrapElement.jqxButton(param);

            if (this.disabled) {
                this.host[0].disabled = true;
            }

            this.propertyChangeMap['disabled'] = function (instance, key, oldVal, value) {
                instance.host[0].disabled = value;
                instance.host.find('input').jqxButton({ disabled: value });
            }

            this.addHandler(wrapElement, 'click', function (event) {
                if (!this.disabled) {
                    self.onclick(event);
                }
                return false;
            });
        },

        onclick: function (event) {
            if (this.target != null) {
                window.open(this.href, this.target);
            }
            else {
                window.location = this.href;
            }
        }
    });
    //// End of LinkButton

    //// RepeatButton
    $.jqx.jqxWidget("jqxRepeatButton", "jqxButton", {});

    $.extend($.jqx._jqxRepeatButton.prototype, {
        defineInstance: function () {
            this.delay = 50;
        },

        createInstance: function (args) {
            var self = this;

            var isTouchDevice = $.jqx.mobile.isTouchDevice();

            var up = !isTouchDevice ? 'mouseup.' + this.base.element.id : 'touchend.' + this.base.element.id;
            var down = !isTouchDevice ? 'mousedown.' + this.base.element.id : 'touchstart.' + this.base.element.id;

            this.addHandler($(document), up, function (event) {
                if (self.timeout != null) {
                    clearTimeout(self.timeout);
                    self.timeout = null;
                    self.refresh();
                }
                if (self.timer != undefined) {
                    clearInterval(self.timer);
                    self.timer = null;
                    self.refresh();
                }
            });

            this.addHandler(this.base.host, down, function (event) {
                if (self.timer != null) {
                    clearInterval(self.timer);
                }
 
                self.timeout = setTimeout(function () {
                    clearInterval(self.timer);
                    self.timer = setInterval(function (event) { self.ontimer(event); }, self.delay);
                }, 150);
            });

            this.mousemovefunc = function (event) {
                if (!isTouchDevice) {
                    if (event.which == 0) {
                        if (self.timer != null) {
                            clearInterval(self.timer);
                            self.timer = null;
                        }
                    }
                }
            }

            this.addHandler(this.base.host, 'mousemove', this.mousemovefunc);
        },

        destroy: function()
        {
            var isTouchDevice = $.jqx.mobile.isTouchDevice();
            var up = !isTouchDevice ? 'mouseup.' + this.base.element.id : 'touchend.' + this.base.element.id;
            var down = !isTouchDevice ? 'mousedown.' + this.base.element.id : 'touchstart.' + this.base.element.id;
            this.removeHandler(this.base.host, 'mousemove', this.mousemovefunc);
            this.removeHandler(this.base.host, down);
            this.removeHandler($(document), up);
            this.timer = null;
            delete this.mousemovefunc;
            delete this.timer;
            var vars = $.data(this.base.element, "jqxRepeatButton");
            if (vars) {
                delete vars.instance;
            }
            $(this.base.element).removeData();
            this.base.destroy();
            delete this.base;

        },

        stop: function () {
            clearInterval(this.timer);
            this.timer = null;
        },

        ontimer: function (event) {
            var event = new $.Event('click');
            if (this.base != null && this.base.host != null) {
                this.base.host.trigger(event);
            }
        }
    });
    //// End of RepeatButton
    //// ToggleButton
    $.jqx.jqxWidget("jqxToggleButton", "jqxButton", {});

    $.extend($.jqx._jqxToggleButton.prototype, {
        defineInstance: function () {
            this.toggled = false;
            this.uiToggle = true;
            this.aria =
            {
                "aria-checked": { name: "toggled", type: "boolean" },
                "aria-disabled": { name: "disabled", type: "boolean" }
            };
        },

        createInstance: function (args) {
            var self = this;
            self.base.overrideTheme = true;
            self.isTouchDevice = $.jqx.mobile.isTouchDevice();
            $.jqx.aria(this);

            self.propertyChangeMap['roundedCorners'] = function (instance, key, oldVal, value) {
                instance.base.host.removeClass(instance.toThemeProperty($.jqx.cssroundedcorners(oldVal)));
                instance.base.host.addClass(instance.toThemeProperty($.jqx.cssroundedcorners(value)));
            };

            self.propertyChangeMap['toggled'] = function (instance, key, oldVal, value) {
                instance.refresh();
            };
            self.propertyChangeMap['disabled'] = function (instance, key, oldVal, value) {
                instance.base.disabled = value;
                instance.refresh();
            };

            self.addHandler(self.base.host, 'click', function (event) {
                if (!self.base.disabled && self.uiToggle) {
                    self.toggle();
                }
            });

            if (!self.isTouchDevice) {
                self.addHandler(self.base.host, 'mouseenter', function (event) {
                    if (!self.base.disabled) {
                        self.refresh();
                    }
                });

                self.addHandler(self.base.host, 'mouseleave', function (event) {
                    if (!self.base.disabled) {
                        self.refresh();
                    }
                });
            }

            self.addHandler(self.base.host, 'mousedown', function (event) {
                if (!self.base.disabled) {
                    self.refresh();
                }
            });

            self.addHandler($(document), 'mouseup.togglebutton' + self.base.element.id, function (event) {
                if (!self.base.disabled) {
                    self.refresh();
                }
            });
        },

        destroy: function()
        {
            this._removeHandlers();
            this.base.destroy();
        },

        _removeHandlers: function () {
            this.removeHandler(this.base.host, 'click');
            this.removeHandler(this.base.host, 'mouseenter');
            this.removeHandler(this.base.host, 'mouseleave');
            this.removeHandler(this.base.host, 'mousedown');
            this.removeHandler($(document), 'mouseup.togglebutton' + this.base.element.id);
        },

        toggle: function () {
            this.toggled = !this.toggled;
            this.refresh();
            $.jqx.aria(this, "aria-checked", this.toggled);
        },

        unCheck: function () {
            this.toggled = false;
            this.refresh();
        },

        check: function () {
            this.toggled = true;
            this.refresh();
        },

        refresh: function () {
            var self = this;
            var cssDisabled = self.base.toThemeProperty('jqx-fill-state-disabled');
            var cssNormal = self.base.toThemeProperty('jqx-fill-state-normal');
            if (!self.base.enableDefault) {
                cssNormal = "";
            }
            var cssHover = self.base.toThemeProperty('jqx-fill-state-hover');
            var cssPressed = self.base.toThemeProperty('jqx-fill-state-pressed');
            var cssPressedHover = self.base.toThemeProperty('jqx-fill-state-pressed');
            var cssCurrent = '';
            self.base.host[0].disabled = self.base.disabled;

            if (self.base.disabled) {
                cssCurrent = cssNormal + " " + cssDisabled;
                self.base.host.addClass(cssCurrent);
                return;
            }
            else {
                if (self.base.isMouseOver && !self.isTouchDevice) {
                    if (self.base.isPressed || self.toggled)
                        cssCurrent = cssPressedHover;
                    else
                        cssCurrent = cssHover;
                }
                else {
                    if (self.base.isPressed || self.toggled)
                        cssCurrent = cssPressed;
                    else
                        cssCurrent = cssNormal;
                }
            }

            if (self.base.template !== "default" && self.base.template !== "") {
                cssCurrent += " " + "jqx-" + self.base.template;
            }

            if (self.base.host.hasClass(cssDisabled) && cssDisabled != cssCurrent)
                self.base.host.removeClass(cssDisabled);

            if (self.base.host.hasClass(cssNormal) && cssNormal != cssCurrent)
                self.base.host.removeClass(cssNormal);

            if (self.base.host.hasClass(cssHover) && cssHover != cssCurrent)
                self.base.host.removeClass(cssHover);

            if (self.base.host.hasClass(cssPressed) && cssPressed != cssCurrent)
                self.base.host.removeClass(cssPressed);

            if (self.base.host.hasClass(cssPressedHover) && cssPressedHover != cssCurrent)
                self.base.host.removeClass(cssPressedHover);

            if (!self.base.host.hasClass(cssCurrent))
                self.base.host.addClass(cssCurrent);
        }
    });
    //// End of ToggleButton

})(jqxBaseFramework);
