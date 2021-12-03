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
})({"bp-groups/js/blocks/groups/constants.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EXTRA_INFO = exports.GROUP_STATI = exports.AVATAR_SIZES = void 0;

/**
 * WordPress dependencies.
 */
const {
  i18n: {
    __
  }
} = wp;
/**
 * Avatar sizes.
 *
 * @type {Array}
 */

const AVATAR_SIZES = [{
  label: __('None', 'buddypress'),
  value: 'none'
}, {
  label: __('Thumb', 'buddypress'),
  value: 'thumb'
}, {
  label: __('Full', 'buddypress'),
  value: 'full'
}];
/**
 * Group stati.
 *
 * @type {Object}
 */

exports.AVATAR_SIZES = AVATAR_SIZES;
const GROUP_STATI = {
  public: __('Public', 'buddypress'),
  private: __('Private', 'buddypress'),
  hidden: __('Hidden', 'buddypress')
};
/**
 * Group Extra data.
 *
 * @type {Array}
 */

exports.GROUP_STATI = GROUP_STATI;
const EXTRA_INFO = [{
  label: __('None', 'buddypress'),
  value: 'none'
}, {
  label: __('Group\'s description', 'buddypress'),
  value: 'description'
}, {
  label: __('Last time the group was active', 'buddypress'),
  value: 'active'
}, {
  label: __('Amount of group members', 'buddypress'),
  value: 'popular'
}];
exports.EXTRA_INFO = EXTRA_INFO;
},{}],"bp-groups/js/blocks/groups/edit.js":[function(require,module,exports) {
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
  blockEditor: {
    InspectorControls,
    BlockControls
  },
  components: {
    Placeholder,
    PanelBody,
    SelectControl,
    ToggleControl,
    Button,
    Dashicon,
    Tooltip,
    ToolbarGroup,
    RangeControl
  },
  element: {
    createElement,
    Fragment,
    useState
  },
  i18n: {
    __,
    sprintf,
    _n
  },
  apiFetch,
  url: {
    addQueryArgs
  }
} = wp;
/**
 * BuddyPress dependencies.
 */

const {
  blockComponents: {
    AutoCompleter
  },
  blockData: {
    isActive
  }
} = bp;
/**
 * Internal dependencies.
 */

/**
 * External dependencies.
 */
const {
  reject,
  remove,
  sortBy
} = lodash;

const getSlugValue = item => {
  if (item && item.status && _constants.GROUP_STATI[item.status]) {
    return _constants.GROUP_STATI[item.status];
  }

  return null;
};

const editGroupsBlock = ({
  attributes,
  setAttributes,
  isSelected
}) => {
  const isAvatarEnabled = isActive('groups', 'avatar');
  const {
    itemIDs,
    avatarSize,
    displayGroupName,
    extraInfo,
    layoutPreference,
    columns
  } = attributes;
  const hasGroups = 0 !== itemIDs.length;
  const [groups, setGroups] = useState([]);
  const layoutControls = [{
    icon: 'text',
    title: __('List view', 'buddypress'),
    onClick: () => setAttributes({
      layoutPreference: 'list'
    }),
    isActive: layoutPreference === 'list'
  }, {
    icon: 'screenoptions',
    title: __('Grid view', 'buddypress'),
    onClick: () => setAttributes({
      layoutPreference: 'grid'
    }),
    isActive: layoutPreference === 'grid'
  }];
  let groupsList;
  let containerClasses = 'bp-block-groups avatar-' + avatarSize;
  let extraInfoOptions = _constants.EXTRA_INFO;

  if (layoutPreference === 'grid') {
    containerClasses += ' is-grid columns-' + columns;
    extraInfoOptions = _constants.EXTRA_INFO.filter(extra => {
      return 'description' !== extra.value;
    });
  }

  const onSelectedGroup = ({
    itemID
  }) => {
    if (itemID && -1 === itemIDs.indexOf(itemID)) {
      setAttributes({
        itemIDs: [...itemIDs, parseInt(itemID, 10)]
      });
    }
  };

  const onRemoveGroup = itemID => {
    if (itemID && -1 !== itemIDs.indexOf(itemID)) {
      setGroups(reject(groups, ['id', itemID]));
      setAttributes({
        itemIDs: remove(itemIDs, value => {
          return value !== itemID;
        })
      });
    }
  };

  if (hasGroups && itemIDs.length !== groups.length) {
    apiFetch({
      path: addQueryArgs(`/buddypress/v1/groups`, {
        populate_extras: true,
        include: itemIDs
      })
    }).then(items => {
      setGroups(sortBy(items, [item => {
        return itemIDs.indexOf(item.id);
      }]));
    });
  }

  if (groups.length) {
    groupsList = groups.map(group => {
      let hasDescription = false;
      let groupItemClasses = 'group-content';

      if (layoutPreference === 'list' && 'description' === extraInfo && group.description && group.description.rendered) {
        hasDescription = true;
        groupItemClasses = 'group-content has-description';
      }

      return createElement("div", {
        key: 'bp-group-' + group.id,
        className: groupItemClasses
      }, isSelected && createElement(Tooltip, {
        text: __('Remove group', 'buddypress')
      }, createElement(Button, {
        className: "is-right",
        onClick: () => onRemoveGroup(group.id),
        label: __('Remove group', 'buddypress')
      }, createElement(Dashicon, {
        icon: "no"
      }))), isAvatarEnabled && 'none' !== avatarSize && createElement("div", {
        className: "item-header-avatar"
      }, createElement("a", {
        href: group.link,
        target: "_blank"
      }, createElement("img", {
        key: 'avatar-' + group.id,
        className: "avatar",
        alt: sprintf(__('Profile photo of %s', 'buddypress'), group.name),
        src: group.avatar_urls[avatarSize]
      }))), createElement("div", {
        className: "group-description"
      }, displayGroupName && createElement("strong", null, createElement("a", {
        href: group.link,
        target: "_blank"
      }, group.name)), hasDescription && createElement("div", {
        className: "group-description-content",
        dangerouslySetInnerHTML: {
          __html: group.description.rendered
        }
      }), 'active' === extraInfo && group.last_activity && group.last_activity_diff && createElement("time", {
        dateTime: group.last_activity
      }, sprintf(__('Active %s', 'buddypress'), group.last_activity_diff)), 'popular' === extraInfo && group.total_member_count && createElement("div", {
        className: "group-meta"
      }, sprintf(
      /* translators: 1: number of group memberss. */
      _n('%1$d member', '%1$d members', group.total_member_count, 'buddypress'), group.total_member_count))));
    });
  }

  return createElement(Fragment, null, createElement(InspectorControls, null, createElement(PanelBody, {
    title: __('Settings', 'buddypress'),
    initialOpen: true
  }, createElement(ToggleControl, {
    label: __('Display the group\'s name', 'buddypress'),
    checked: !!displayGroupName,
    onChange: () => {
      setAttributes({
        displayGroupName: !displayGroupName
      });
    },
    help: displayGroupName ? __('Include the group\'s name.', 'buddypress') : __('Toggle to include group\'s name.', 'buddypress')
  }), isAvatarEnabled && createElement(SelectControl, {
    label: __('Avatar size', 'buddypress'),
    value: avatarSize,
    options: _constants.AVATAR_SIZES,
    help: __('Select "None" to disable the avatar.', 'buddypress'),
    onChange: option => {
      setAttributes({
        avatarSize: option
      });
    }
  }), createElement(SelectControl, {
    label: __('Group extra information', 'buddypress'),
    value: extraInfo,
    options: extraInfoOptions,
    help: __('Select "None" to show no extra information.', 'buddypress'),
    onChange: option => {
      setAttributes({
        extraInfo: option
      });
    }
  }), layoutPreference === 'grid' && createElement(RangeControl, {
    label: __('Columns', 'buddypress'),
    value: columns,
    onChange: value => setAttributes({
      columns: value
    }),
    min: 2,
    max: 4,
    required: true
  }))), createElement(BlockControls, null, createElement(ToolbarGroup, {
    controls: layoutControls
  })), hasGroups && createElement("div", {
    className: containerClasses
  }, groupsList), (isSelected || 0 === itemIDs.length) && createElement(Placeholder, {
    icon: hasGroups ? '' : 'groups',
    label: hasGroups ? '' : __('BuddyPress Groups', 'buddypress'),
    instructions: __('Start typing the name of the group you want to add to the groups list.', 'buddypress'),
    className: 0 !== itemIDs.length ? 'is-appender' : 'is-large'
  }, createElement(AutoCompleter, {
    component: "groups",
    objectQueryArgs: {
      'show_hidden': false,
      exclude: itemIDs
    },
    slugValue: getSlugValue,
    ariaLabel: __('Group\'s name', 'buddypress'),
    placeholder: __('Enter Group\'s name here…', 'buddypress'),
    onSelectItem: onSelectedGroup,
    useAvatar: isAvatarEnabled
  })));
};

var _default = editGroupsBlock;
exports.default = _default;
},{"./constants":"bp-groups/js/blocks/groups/constants.js"}],"bp-groups/js/blocks/groups.js":[function(require,module,exports) {
"use strict";

var _edit = _interopRequireDefault(require("./groups/edit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * WordPress dependencies.
 */
const {
  blocks: {
    registerBlockType
  },
  i18n: {
    __
  }
} = wp;
/**
 * Internal dependencies.
 */

registerBlockType('bp/groups', {
  title: __('Groups', 'buddypress'),
  description: __('BuddyPress Groups.', 'buddypress'),
  icon: {
    background: '#fff',
    foreground: '#d84800',
    src: 'buddicons-groups'
  },
  category: 'buddypress',
  attributes: {
    itemIDs: {
      type: 'array',
      items: {
        type: 'integer'
      },
      default: []
    },
    avatarSize: {
      type: 'string',
      default: 'full'
    },
    displayGroupName: {
      type: 'boolean',
      default: true
    },
    extraInfo: {
      type: 'string',
      default: 'none'
    },
    layoutPreference: {
      type: 'string',
      default: 'list'
    },
    columns: {
      type: 'number',
      default: 2
    }
  },
  edit: _edit.default
});
},{"./groups/edit":"bp-groups/js/blocks/groups/edit.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","bp-groups/js/blocks/groups.js"], null)