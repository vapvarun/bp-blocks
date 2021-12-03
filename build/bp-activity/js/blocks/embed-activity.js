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
})({"bp-activity/js/blocks/embed-activity/edit.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * WordPress dependencies.
 */
const {
  element: {
    createElement,
    Fragment,
    useState
  },
  i18n: {
    __
  },
  components: {
    Placeholder,
    Disabled,
    SandBox,
    Button,
    ExternalLink,
    Spinner,
    ToolbarGroup,
    ToolbarButton
  },
  compose: {
    compose
  },
  data: {
    withSelect
  },
  blockEditor: {
    RichText,
    BlockControls
  }
} = wp;
/**
 * BuddyPress dependencies.
 */

const {
  blockData: {
    embedScriptURL
  }
} = bp;

const EditEmbedActivity = ({
  attributes,
  setAttributes,
  isSelected,
  preview,
  fetching
}) => {
  const {
    url,
    caption
  } = attributes;

  const label = __('BuddyPress Activity URL', 'buddypress');

  const [value, setURL] = useState(url);
  const [isEditingURL, setIsEditingURL] = useState(!url);

  const onSubmit = event => {
    if (event) {
      event.preventDefault();
    }

    setIsEditingURL(false);
    setAttributes({
      url: value
    });
  };

  const switchBackToURLInput = event => {
    if (event) {
      event.preventDefault();
    }

    setIsEditingURL(true);
  };

  const editToolbar = createElement(BlockControls, null, createElement(ToolbarGroup, null, createElement(ToolbarButton, {
    icon: "edit",
    title: __('Edit URL', 'buddypress'),
    onClick: switchBackToURLInput
  })));

  if (isEditingURL) {
    return createElement(Placeholder, {
      icon: "buddicons-activity",
      label: label,
      className: "wp-block-embed",
      instructions: __('Paste the link to the activity content you want to display on your site.', 'buddypress')
    }, createElement("form", {
      onSubmit: onSubmit
    }, createElement("input", {
      type: "url",
      value: value || '',
      className: "components-placeholder__input",
      "aria-label": label,
      placeholder: __('Enter URL to embed here…', 'buddypress'),
      onChange: event => setURL(event.target.value)
    }), createElement(Button, {
      isPrimary: true,
      type: "submit"
    }, __('Embed', 'buddypress'))), createElement("div", {
      className: "components-placeholder__learn-more"
    }, createElement(ExternalLink, {
      href: __('https://codex.buddypress.org/activity-embeds/')
    }, __('Learn more about activity embeds', 'buddypress'))));
  }

  if (fetching) {
    return createElement("div", {
      className: "wp-block-embed is-loading"
    }, createElement(Spinner, null), createElement("p", null, __('Embedding…', 'buddypress')));
  }

  if (!preview || !preview['x_buddypress'] || 'activity' !== preview['x_buddypress']) {
    return createElement(Fragment, null, editToolbar, createElement(Placeholder, {
      icon: "buddicons-activity",
      label: label
    }, createElement("p", {
      className: "components-placeholder__error"
    }, __('The URL you provided is not a permalink to a public BuddyPress Activity. Please use another URL.', 'buddypress'))));
  }

  return createElement(Fragment, null, !isEditingURL && editToolbar, createElement("figure", {
    className: "wp-block-embed is-type-bp-activity"
  }, createElement("div", {
    className: "wp-block-embed__wrapper"
  }, createElement(Disabled, null, createElement(SandBox, {
    html: preview && preview.html ? preview.html : '',
    scripts: [embedScriptURL]
  }))), (!RichText.isEmpty(caption) || isSelected) && createElement(RichText, {
    tagName: "figcaption",
    placeholder: __('Write caption…', 'buddypress'),
    value: caption,
    onChange: value => setAttributes({
      caption: value
    }),
    inlineToolbar: true
  })));
};

const editEmbedActivityBlock = compose([withSelect((select, ownProps) => {
  const {
    url
  } = ownProps.attributes;
  const {
    getEmbedPreview,
    isRequestingEmbedPreview
  } = select('core');
  const preview = !!url && getEmbedPreview(url);
  const fetching = !!url && isRequestingEmbedPreview(url);
  return {
    preview: preview,
    fetching: fetching
  };
})])(EditEmbedActivity);
var _default = editEmbedActivityBlock;
exports.default = _default;
},{}],"bp-activity/js/blocks/embed-activity/save.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * WordPress dependencies.
 */
const {
  blockEditor: {
    RichText
  },
  element: {
    createElement
  }
} = wp;

const saveEmbedActivityBlock = ({
  attributes
}) => {
  const {
    url,
    caption
  } = attributes;

  if (!url) {
    return null;
  }

  return createElement("figure", {
    className: "wp-block-embed is-type-bp-activity"
  }, createElement("div", {
    className: "wp-block-embed__wrapper"
  }, `\n${url}\n`
  /* URL needs to be on its own line. */
  ), !RichText.isEmpty(caption) && createElement(RichText.Content, {
    tagName: "figcaption",
    value: caption
  }));
};

var _default = saveEmbedActivityBlock;
exports.default = _default;
},{}],"bp-activity/js/blocks/embed-activity.js":[function(require,module,exports) {
"use strict";

var _edit = _interopRequireDefault(require("./embed-activity/edit"));

var _save = _interopRequireDefault(require("./embed-activity/save"));

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

registerBlockType('bp/embed-activity', {
  title: __('Embed an activity', 'buddypress'),
  description: __('Add a block that displays the activity content pulled from this or other community sites.', 'buddypress'),
  icon: {
    background: '#fff',
    foreground: '#d84800',
    src: 'buddicons-activity'
  },
  category: 'buddypress',
  attributes: {
    url: {
      type: 'string'
    },
    caption: {
      type: 'string',
      source: 'html',
      selector: 'figcaption'
    }
  },
  supports: {
    align: true
  },
  edit: _edit.default,
  save: _save.default
});
},{"./embed-activity/edit":"bp-activity/js/blocks/embed-activity/edit.js","./embed-activity/save":"bp-activity/js/blocks/embed-activity/save.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","bp-activity/js/blocks/embed-activity.js"], null)