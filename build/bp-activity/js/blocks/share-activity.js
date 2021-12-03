// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"bp-activity/js/blocks/share-activity/constants.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MAX_BORDER_RADIUS_VALUE = exports.MIN_BORDER_RADIUS_VALUE = exports.INITIAL_BORDER_RADIUS_POSITION = void 0;

/**
 * Identifier for the initial border radius position.
 *
 * @type {integer}
 */
const INITIAL_BORDER_RADIUS_POSITION = 5;
/**
 * Identifier for the min border radius value.
 *
 * @type {integer}
 */

exports.INITIAL_BORDER_RADIUS_POSITION = INITIAL_BORDER_RADIUS_POSITION;
const MIN_BORDER_RADIUS_VALUE = 0;
/**
 * Identifier for the max border radius value.
 *
 * @type {integer}
 */

exports.MIN_BORDER_RADIUS_VALUE = MIN_BORDER_RADIUS_VALUE;
const MAX_BORDER_RADIUS_VALUE = 50;
exports.MAX_BORDER_RADIUS_VALUE = MAX_BORDER_RADIUS_VALUE;
},{}],"bp-activity/js/blocks/share-activity/edit.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _constants = require("./constants");

/**
 * WordPress dependencies.
 */
const {
  element: {
    Fragment,
    createElement
  },
  i18n: {
    __
  },
  blockEditor: {
    RichText,
    getColorClassName,
    InspectorControls,
    getColorObjectByColorValue,
    getColorObjectByAttributeValues,
    PanelColorSettings
  },
  data: {
    useSelect
  },
  components: {
    PanelBody,
    RangeControl,
    ToggleControl
  }
} = wp;
/**
 * External dependencies.
 */

const {
  identity,
  isEqual,
  isObject,
  pickBy,
  mapValues
} = lodash;
/**
 * Internal dependencies.
 */

const cleanEmptyObject = object => {
  if (!isObject(object)) {
    return object;
  }

  const cleanedNestedObjects = pickBy(mapValues(object, cleanEmptyObject), identity);
  return isEqual(cleanedNestedObjects, {}) ? undefined : cleanedNestedObjects;
};

const ShareActivityEdit = ({
  attributes,
  setAttributes
}) => {
  const {
    text,
    backgroundColor,
    textColor,
    borderRadius,
    style,
    wpLoginLinkFallback
  } = attributes;
  const backgroundClass = getColorClassName('background-color', backgroundColor);
  const textClass = getColorClassName('color', textColor);
  const {
    colors
  } = useSelect(select => {
    return select('core/block-editor').getSettings();
  }, []);
  let className = 'wp-block-button__link';
  let styleProps = {};
  let styleColors = {
    text: '',
    background: ''
  };

  if (style) {
    if (style.color.text) {
      styleColors.text = style.color.text;
      styleProps.color = style.color.text;
    }

    if (style.color.background) {
      styleColors.background = style.color.background;
      styleProps.backgroundColor = style.color.background;
    }
  }

  if (!!backgroundClass || styleColors.background) {
    className += ' has-background';

    if (!!backgroundClass) {
      className += ' ' + backgroundClass;
    }
  }

  if (!!textClass || styleColors.text) {
    className += ' has-text-color';

    if (!!textClass) {
      className += ' ' + textClass;
    }
  }

  const onChangeColor = name => value => {
    const colorObject = getColorObjectByColorValue(colors, value);
    const attributeName = name + 'Color';
    const colorSlug = colorObject && colorObject.slug ? colorObject.slug : undefined;
    const newStyle = { ...style,
      color: { ...styleColors,
        [name]: value
      }
    };
    const newNamedColor = colorSlug ? colorSlug : undefined;
    const newAttributes = {
      style: cleanEmptyObject(newStyle),
      [attributeName]: newNamedColor
    };
    setAttributes(newAttributes);
  };

  return createElement(Fragment, null, createElement("div", {
    className: "wp-block-button"
  }, createElement(RichText, {
    placeholder: __('Add text', 'buddypress'),
    value: text,
    allowedFormats: ['core/bold', 'core/italic'],
    onChange: value => setAttributes({
      text: value
    }),
    className: className,
    style: {
      borderRadius: borderRadius ? borderRadius + 'px' : 0,
      ...styleProps
    }
  })), createElement(InspectorControls, null, createElement(PanelBody, {
    title: __('Unconnected users Settings', 'buddypress'),
    initialOpen: true
  }, createElement(ToggleControl, {
    label: __('Fallback to the WordPress login link', 'buddypress'),
    checked: !!wpLoginLinkFallback,
    onChange: () => {
      setAttributes({
        wpLoginLinkFallback: !wpLoginLinkFallback
      });
    },
    help: wpLoginLinkFallback ? __('Toggle to hide the button to unconnected users.', 'buddypress') : __('Toggle to use the WordPress login link for unconnected users.', 'buddypress')
  })), createElement(PanelBody, {
    title: __('Border settings', 'buddypress'),
    initialOpen: false
  }, createElement(RangeControl, {
    value: borderRadius,
    label: __('Border radius', 'buddypress'),
    min: _constants.MIN_BORDER_RADIUS_VALUE,
    max: _constants.MAX_BORDER_RADIUS_VALUE,
    initialPosition: _constants.INITIAL_BORDER_RADIUS_POSITION,
    allowReset: true,
    onChange: value => setAttributes({
      borderRadius: value
    })
  })), createElement(PanelColorSettings, {
    title: __('Color Settings', 'buddypress'),
    initialOpen: false,
    colorSettings: [{
      label: __('Text Color', 'buddypress'),
      onChange: onChangeColor('text'),
      value: getColorObjectByAttributeValues(colors, textColor, styleColors.text).color
    }, {
      label: __('Background Color', 'buddypress'),
      onChange: onChangeColor('background'),
      value: getColorObjectByAttributeValues(colors, backgroundColor, styleColors.background).color
    }]
  })));
};

var _default = ShareActivityEdit;
exports.default = _default;
},{"./constants":"bp-activity/js/blocks/share-activity/constants.js"}],"bp-activity/js/blocks/share-activity.js":[function(require,module,exports) {
"use strict";

var _edit = _interopRequireDefault(require("./share-activity/edit"));

var _constants = require("./share-activity/constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * WordPress dependencies.
 */
const {
  i18n: {
    __
  },
  blocks: {
    registerBlockType
  }
} = wp;
/**
 * Internal dependencies.
 */

registerBlockType('bp/share-activity', {
  title: __('Share into activities', 'buddypress'),
  description: __('Action button to share the displayed post/page into user’s activity stream.', 'buddypress'),
  icon: {
    background: '#fff',
    foreground: '#d84800',
    src: 'buddicons-activity'
  },
  category: 'buddypress',
  attributes: {
    text: {
      type: 'string',
      default: __('Share into my Activities', 'buddypress')
    },
    borderRadius: {
      type: 'number',
      default: _constants.INITIAL_BORDER_RADIUS_POSITION
    },
    style: {
      type: 'object'
    },
    backgroundColor: {
      type: 'string'
    },
    textColor: {
      type: 'string'
    },
    wpLoginLinkFallback: {
      type: 'boolean',
      default: true
    }
  },
  supports: {
    multiple: false,
    align: true
  },
  edit: _edit.default
});
},{"./share-activity/edit":"bp-activity/js/blocks/share-activity/edit.js","./share-activity/constants":"bp-activity/js/blocks/share-activity/constants.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "38293" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","bp-activity/js/blocks/share-activity.js"], null)