/**
 * Plugins libaray
 */
// Avoid `console` errors in browsers that lack a console.
(function() {
    'use strict';
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

var UTILS = (function () {
    'use strict';
    return {
        qs: function (selector) {
            return document.querySelector(selector);
        },

        qsa: function (selector) {
            return document.querySelectorAll(selector);
        },

        // Validate enter or space keypress, and activate a function.
        isEnterOrSpace: function(e) {
            if (e.which === 13 || e.keyCode === 13 || e.which === 32 || e.keyCode === 32) {
                return true;
            }
            else {
                return false;
            }
        },

        hasClass: function(tab,className) {
            var classes = tab.getAttribute('class').split(' ');
            for (var i = 0; i < classes.length; i++) {
                if (classes[i] === className){
                    return true;
                }
            }
            return false;
        },

        addClass: function(node,clsName){
            var classes = node.getAttribute('class');
            if(classes === undefined){
                node.setAttribute('class','');
            }
            if (classes ===''){
                node.className = clsName;
            }
            else{
                node.className = node.className +' '+ clsName;
            }
        },

        removeClass: function(node, clsName) {
          var regex = new RegExp('\\b' + clsName + '\\b');
          node.className = node.className.replace(regex,'');
        },

        /**
         * Cross browser even handler
         *
         * @param {Object}   elm     Element on which the event will be bound
         * @param {string}   type    Event type or types (e.g. 'click', 'click input')
         * @param {Function} handler Callback function to run when event is fired
         */
        addEvent: function (elm, type, handler) {
            var types = type.split(' '),
                ieHandler;

            // Recurse if multiple event types were given
            if (types.length > 1) {
                // On each iteration, remove the first value in the array
                while (types.length) {
                    UTILS.addEvent(elm, types.shift(), handler);
                }

                return;
            }

            if (window.addEventListener) {
                // Modern browsers
                elm.addEventListener(type, handler, false);
            } else if (window.attachEvent) {
                // IE8 and below
                // Required for normalizing the "event" object
                ieHandler = function (e) {
                    e.target = e.target || e.srcElement;
                    e.currentTarget = elm;

                    e.stopPropagation = e.stopPropagation || function () {
                        e.cancelBubble = true;
                    };

                    e.preventDefault = e.preventDefault || function () {
                        e.returnValue = false;
                    };

                    return handler.call(elm, e);
                };

                // Save a reference to the handler as a unique key
                elm[type + handler] = ieHandler;
                elm.attachEvent('on' + type, ieHandler);
            }
        },

        /**
         * Cross browser event removal
         *
         * @param {Object}   elm     Element on which the event should be unbound
         * @param {string}   type    Event type to unbind
         * @param {Function} handler Reference to the original callback function
         */
        removeEvent: function (elm, type, handler) {
            var handlerRef;

            if (window.removeEventListener) {
                // Modern browsers
                elm.removeEventListener(type, handler, false);
            } else if (window.detachEvent) {
                // IE8 and below
                handlerRef = elm[type + handler];

                // Make sure the handler key exists
                if (handlerRef) {
                    elm.detachEvent('on' + type, handlerRef);
                    // Remove the key from the object, prevent memory leaks
                    delete elm[type + handler];
                }
            }
        },

        /**
         * Check if a given value is a plain Object
         *
         * @param  {*}       o Any value to be checked
         * @return {Boolean}   true if it's an Object
         */
        isObject: function (o) {
            var toString = Object.prototype.toString;
            return (toString.call(o) === toString.call({}));
        },

        /**
         * Check if Event constructors are supported
         *
         * @return {Boolean}
         */
        isModernEvent: function () {
            try {
                if (new Event('submit', {bubbles: false}).bubbles !== false) {
                    return false;
                } else if (new Event('submit', {bubbles: true}).bubbles !== true) {
                    return false;
                } else {
                    return true;
                }
            } catch (e) {
                return false;
            }
        },

        /**
         * Trigger an event on a specific element
         *
         * Note:
         * - bubbles/cancelable - `false` by default (not supported in IE8)
         *
         * @param  {Object} elm      DOM Node
         * @param  {string} type     Event type (e.g. 'click', 'customEvent')
         * @param  {Object} options  Options object (e.g. bubbles, cancelable)
         */
        emitEvent: function (elm, type, options) {
            var evt,
                bubbles,
                cancelable,
                // Will be used as a fallback event object for IE8
                eFallback;

            // Support Event options
            options = options || {};
            bubbles = options.bubbles !== undefined ? options.bubbles : false;
            cancelable = options.cancelable !== undefined ? options.cancelable : false;

            // Create an event object
            // Modern browsers (except IE Any)
            if (UTILS.isModernEvent()) {
                evt = new Event(type, {
                    bubbles: bubbles,
                    cancelable: cancelable
                });
            // IE 9+
            } else if (document.createEvent) {
                evt = document.createEvent('Event');
                evt.initEvent(type, bubbles, cancelable);
            // IE 8
            } else {
                evt = document.createEventObject();
            }

            // Trigger the event
            // Modern browsers and IE9+
            if (elm.dispatchEvent) {
                elm.dispatchEvent(evt);
            // IE8
            } else if (elm.fireEvent) {
                // `fireEvent` will fail on non real events (i.e. custom events)
                try {
                    elm.fireEvent('on' + type, evt);
                } catch (e) {
                    // If we have any event handlers saved during `addEvent`
                    if (elm._events && elm._events[type]) {
                        // Support minimal Event properties
                        eFallback = {
                            target: elm,
                            currentTarget: elm
                        };

                        // Trigger all event handlers for this event type
                        for (var i = 0; i < elm._events[type].length; i++) {
                            elm._events[type][i].call(elm, eFallback);
                        }
                    }
                }
            }
        },

        /**
         * AJAX helper function (similar to jQuery, but far from it!)
         *
         * @param {string} url     URL for the ajax request
         * @param {Object} options AJAX settings
         */
        ajax: function (url, options) {
            var xhr = new XMLHttpRequest(),
                method = 'GET';
                options = UTILS.isObject(options) ? options : {};

            // Check if "method" was supplied
            if (options.method) {
                method = options.method;
            }

            // Setup the request
            xhr.open(method.toUpperCase(), url);

            xhr.onreadystatechange = function () {
                var status;

                // If request finished
                if (xhr.readyState === 4) {
                    status = xhr.status;

                    // If response is OK or fetched from cache
                    if ((status >= 200 && status < 300) || status === 304) {
                        var res = xhr.responseText,
                            contentType = xhr.getResponseHeader('Content-Type');

                        // If server sent a content type header, handle formats
                        if (contentType) {
                            // Handle JSON format
                            if (contentType === 'text/json' ||
                                contentType === 'application/json') {

                                // JSON throws an exception on invalid JSON
                                try {
                                    res = JSON.parse(res);
                                } catch (err) {
                                    // Trigger "fail" callback if set
                                    if (options.fail) {
                                        options.fail.call(xhr, err);
                                        return;
                                    }
                                }
                            // Handle XML format
                            } else if (contentType === 'text/xml' ||
                                contentType === 'application/xml') {
                                // responseXML returns a document object
                                res = xhr.responseXML;

                                // if XML was invalid, trigger fail callback
                                if (res === null && options.fail) {
                                    options.fail.call(xhr, 'Bad XML file');
                                    return;
                                }
                            }
                        }

                        // Trigger done callback with the proper response
                        if (options.done) {
                            options.done.call(xhr, res);
                        }
                    }

                }
            };

            // Fire the request
            xhr.send(null);
        }
    };
}());
