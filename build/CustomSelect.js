(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20150312
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

// Full polyfill for browsers with no classList support
if (!("classList" in document.createElement("_"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (index !== -1) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	testElement = null;
}());

}

}


},{}],2:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

require("classlist-shim");

var Utils = _interopRequireWildcard(require("./utils.js"));

var CustomSelect = (function () {
  function CustomSelect(elements) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, CustomSelect);

    if (typeof elements === "string") elements = Array.prototype.slice.call(document.querySelectorAll(elements));else if (typeof elements !== "array") elements = [elements];

    this.elements = elements;

    var defaults = {
      customID: "", // String   - Custom id
      customClass: "", // String   - Custom Class
      placeholder: "", // String   - Value if non empty string, else first
      loop: false, // Boolean  - Should keyboard navigation loop ?
      size: 0, // Integer  - If not 0, number of displayed items
      onChange: null // Function - Callback after change
    };

    Utils.defaultify(options, defaults);

    this.settings = options;

    for (var i = this.elements.length - 1; i >= 0; --i) {
      this.replaceDOMelement(this.elements[i]);
    }this.blurCallback = this.blurFocus.bind(this);
    document.querySelector("html").addEventListener("click", this.blurCallback);
  }

  _createClass(CustomSelect, {
    replaceDOMelement: {
      value: function replaceDOMelement(element) {
        var _this = this;

        var scopeSettings = Utils.clone(this.settings);

        var keys = Object.keys(this.settings),
            i = keys.length;
        while (i--) {
          var key = keys[i],
              data = element.getAttribute("data-" + Utils.fileCase(key));

          if (data != null) scopeSettings[key] = data;
        }

        var options = element.children;

        if (!scopeSettings.placeholder) {
          var first = options[0];

          if (first.tagName === "OPTGROUP") first = first.children[0];

          scopeSettings.placeholder = first.innerText;
        }

        var select = document.createElement("div");
        if (scopeSettings.customID) select.setAttribute("id", scopeSettings.customID);
        select.classList.add("cs-select");
        if (scopeSettings.customClass) select.classList.add(scopeSettings.customClass);

        if (element.disabled) select.classList.add("disabled");

        element.parentNode.insertBefore(select, element);

        var wrapper = document.createElement("div");
        wrapper.classList.add("cs-wrapper");
        select.appendChild(wrapper);

        var list = document.createElement("ul");
        list.classList.add("cs-list");
        wrapper.appendChild(list);

        this.populateList(list, options);

        var label = document.createElement("div");
        label.classList.add("cs-label");
        var labelTxt = document.createElement("span");
        labelTxt.innerText = scopeSettings.placeholder;
        label.appendChild(labelTxt);
        select.appendChild(label);

        select.appendChild(element);

        select.focusCallback = function (event) {
          _this.triggerSelect(event, select);
        };
        select.addEventListener("click", select.focusCallback);
      }
    },
    update: {
      value: function update() {
        if (!this.elements) {
          return;
        }var i = this.elements.length,
            elem = undefined;
        while (i--) {
          elem = this.elements[i];

          this.destroy(elem);

          var wrapper = elem.parentNode,
              _parent = wrapper.parentNode;
          _parent.insertBefore(elem, wrapper);
          _parent.removeChild(wrapper);

          this.replaceDOMelement(elem);
        }
      }
    },
    populateList: {
      value: function populateList(list, options) {
        for (var i = 0, len = options.length; i < len; ++i) {
          var item = options[i];

          var option = document.createElement("li");
          option.classList.add("cs-option");

          if (item.tagName === "OPTION") {
            option.setAttribute("data-value", item.value);
            option.innerText = item.innerText;

            if (item.disabled) option.classList.add("disabled");

            if (item.selected) option.classList.add("selected");

            list.appendChild(option);
          } else {
            option.classList.add("cs-optgroup");
            option.innerText = item.innerText;

            list.appendChild(option);

            var optgroup = document.createElement("ul");
            optgroup.classList.add("cs-optgroup-list");

            option.appendChild(optgroup);

            this.populateList(optgroup, item.children);
          }

          option.clickCallback = this.optionClick.bind(this);
          option.addEventListener("click", option.clickCallback);

          option.overCallback = this.optionHover;
          option.addEventListener("mousemove", option.overCallback);
        }
      }
    },
    destroy: {
      value: function destroy(elem) {
        var destroyElements = elem ? [elem] : this.elements;

        var i = destroyElements.length,
            select = undefined;
        while (i--) {
          select = destroyElements[i];

          select.removeEventListener("click", select.focusCallback);

          var options = select.querySelectorAll("li.cs-option");

          var j = options.length,
              option = undefined;
          while (j--) {
            option = options[j];

            option.removeEventListener("click", option.clickCallback);
            option.removeEventListener("mousemove", option.overCallback);
          }
        }

        if (!elem) {
          document.querySelector("html").removeEventListener("click", this.blurCallback);
        } else {
          this.elements.splice(this.elements.indexOf(elem), 1);
        }
      }
    },
    blurFocus: {
      value: function blurFocus(event) {

        var i = this.elements.length,
            el = undefined,
            parent = undefined,
            bounding = undefined;
        while (--i) {
          el = this.elements[i];
          parent = el.parentNode;
          bounding = parent.getBoundingClientRect();

          if (parent.classList.contains("open")) {
            if (event.clientX < bounding.left || event.clientX > bounding.left + bounding.width || (event.clientY < bounding.top || event.clientY > bounding.top + bounding.height)) {
              parent.classList.remove("open");
            }
          }
        }
      }
    },
    triggerSelect: {
      value: function triggerSelect(event, select) {
        event.preventDefault();

        if (!select.classList.contains("disabled")) {
          this.checkViewport(select);
          select.classList.add("open");
        }
      }
    },
    optionHover: {
      value: function optionHover(event) {
        var option = event.currentTarget;
        var list = option.parentNode;
        var options = list.querySelectorAll("li.cs-option");

        if (!option.classList.contains("disabled") || option.classList.contains("cs-optgroup")) {

          var i = options.length;
          while (i--) {
            options[i].classList.remove("active");
          }

          option.classList.add("active");
        }
      }
    },
    optionClick: {
      value: function optionClick(event) {
        event.stopPropagation();

        var option = event.currentTarget;
        var select = option.parentNode.parentNode.parentNode;
        var options = select.querySelectorAll("li.cs-option");
        var index = Utils.indexInParent(option);

        if (!option.classList.contains("disabled") || option.classList.contains("cs-optgroup")) {

          select.querySelector(".cs-option.selected").classList.remove("selected");
          option.classList.add("selected");

          var realSelect = select.querySelector("select");

          var realOptions = realSelect.querySelectorAll("option");

          var i = realOptions.length;
          while (i--) {
            realOptions[i].selected = false;
          }

          realOptions[index].selected = true;

          select.querySelector(".cs-label").innerText = option.innerText;

          var event = document.createEvent("HTMLEvents");
          event.initEvent("change", true, false);
          realSelect.dispatchEvent(event);
        }

        select.classList.remove("open");
      }
    },
    checkViewport: {
      value: function checkViewport(select) {
        var bounding = select.getBoundingClientRect();
        var listHeight = select.querySelector(".cs-list").offsetHeight;

        if (bounding.bottom + listHeight + 10 > window.innerHeight && bounding.top - listHeight > 10) {
          select.classList.add("above");
        } else {
          select.classList.remove("above");
        }
      }
    }
  });

  return CustomSelect;
})();

module.exports = CustomSelect;

},{"./utils.js":3,"classlist-shim":1}],3:[function(require,module,exports){
"use strict";

exports.defaultify = defaultify;
exports.fileCase = fileCase;
exports.clone = clone;
exports.indexInParent = indexInParent;
Object.defineProperty(exports, "__esModule", {
  value: true
});

function defaultify(options, defaults) {
  var keys = Object.keys(defaults);

  for (var i = keys.length - 1; i >= 0; --i) {
    var key = keys[i];

    if (typeof options[key] === "undefined") options[key] = defaults[key];
  }
}

function fileCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

function indexInParent(node) {
  var children = node.parentNode.childNodes;
  var num = 0;
  for (var i = 0; i < children.length; i++) {
    if (children[i] == node) {
      return num;
    }if (children[i].nodeType == 1) num++;
  }
  return -1;
}

},{}]},{},[2]);
