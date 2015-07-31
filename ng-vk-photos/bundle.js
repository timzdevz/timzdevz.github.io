/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);

	angular.module("vkphotos", ['ui.router', 'vkphotos.main']).config([
	  '$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
	    $stateProvider.state('home', {
	      url: '/',
	      templateUrl: 'main.html',
	      controller: 'MainCtrl'
	    }).state('user', {
	      url: 'user',
	      parent: 'home',
	      abstract: true,
	      templateUrl: 'photo-list.html',
	      controller: function($scope, $state) {
	        var offset, photoId;
	        offset = parseInt($state.params.offset);
	        photoId = parseInt($state.params.photo);
	        $scope.getPhotos($state.params.id).then(function() {
	          if (offset === +$state.params.offset) {
	            return $scope.getNextPhotos(offset);
	          }
	        }).then(function() {
	          if (photoId === +$state.params.photo) {
	            return $scope.openPopup(photoId);
	          }
	        });
	        $scope.$parent.$on('popupClosed', function() {
	          return $state.go('user.params', {
	            photo: ''
	          }, {
	            location: 'replace'
	          });
	        });
	        return $scope.$parent.$on('popupPhotoChanged', function(event, photoId) {
	          return $state.go('user.params', {
	            photo: photoId
	          }, {
	            location: 'replace'
	          });
	        });
	      }
	    }).state('user.params', {
	      url: '/{id:[^/]+}?offset?photo'
	    });
	    $urlRouterProvider.otherwise('/');
	    return $locationProvider.html5Mode(true);
	  }
	]);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var MainCtrl;

	MainCtrl = __webpack_require__(2);

	__webpack_require__(3);

	__webpack_require__(5);

	__webpack_require__(13);

	__webpack_require__(15);

	__webpack_require__(16);

	__webpack_require__(18);

	module.exports = angular.module("vkphotos.main", ['infinite-scroll', 'vkphotos.vkapi', 'vkphotos.popup']).controller("MainCtrl", ['$scope', '$state', '$q', 'VKApi', 'PhotoPopup', 'orderByFilter', MainCtrl]);


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = function($scope, $state, $q, VKApi, PhotoPopup, orderByFilter) {
	  var PHOTOS_PER_PAGE;
	  PHOTOS_PER_PAGE = 50;
	  $scope.userIdInput = '';
	  $scope.ownerId = 0;
	  $scope.statusMessage = '';
	  $scope.userPhotos = null;
	  $scope.sortBy = '-created';
	  $scope.loadingNext = $scope.loadedAll = false;
	  $scope.$on('popupOpened', function() {
	    return $scope.popupOpened = true;
	  });
	  $scope.$on('popupClosed', function() {
	    return $scope.popupOpened = false;
	  });
	  $scope.sortPhotos = function(sortBy) {
	    return $scope.userPhotos = orderByFilter($scope.userPhotos, sortBy);
	  };
	  $scope.getPhotos = function(userId) {
	    var deferred;
	    deferred = $q.defer();
	    $scope.userPhotos = [];
	    $scope.ownerId = 0;
	    $scope.loadingNext = $scope.loadedAll = false;
	    $scope.statusMessage = 'Loading data...';
	    VKApi.auth().then(function() {
	      return VKApi.getUser(userId).then(function(ownerId) {
	        if (ownerId != null) {
	          $scope.ownerId = ownerId;
	          VKApi.getWallPhotos($scope.ownerId, PHOTOS_PER_PAGE).then(function(response) {
	            if (response.length === 0) {
	              $scope.statusMessage = 'Photos not found.';
	              return deferred.reject();
	            } else {
	              deferred.resolve();
	              $scope.userPhotos = response;
	              return $scope.statusMessage = '';
	            }
	          });
	        } else {
	          deferred.reject();
	          $scope.statusMessage = 'User not found.';
	          $scope.userIdInput = '';
	        }
	      });
	    }, function() {
	      return $scope.statusMessage = 'You have to login to use VK API.';
	    });
	    return deferred.promise;
	  };
	  $scope.getNextPhotos = function(photoCount, offset) {
	    if (photoCount == null) {
	      photoCount = PHOTOS_PER_PAGE;
	    }
	    if (offset == null) {
	      offset = $scope.userPhotos.length;
	    }
	    if (photoCount <= 0) {
	      return;
	    }
	    if ($scope.userPhotos.length < PHOTOS_PER_PAGE) {
	      $scope.loadedAll = true;
	      $state.go('user.params', {
	        offset: ''
	      }, {
	        location: 'replace'
	      });
	      return;
	    }
	    $scope.loadingNext = true;
	    return VKApi.getWallPhotos($scope.ownerId, photoCount, offset).then(function(response) {
	      if (response.length !== 0) {
	        $scope.userPhotos = $scope.userPhotos.concat(response);
	      } else if (response.length < PHOTOS_PER_PAGE || response.length === 0) {
	        $scope.loadedAll = true;
	      }
	      $scope.loadingNext = false;
	      if (!($scope.loadedAll && $scope.userPhotos.length === PHOTOS_PER_PAGE)) {
	        return $state.go('user.params', {
	          offset: $scope.userPhotos.length - PHOTOS_PER_PAGE
	        }, {
	          location: 'replace'
	        });
	      }
	    });
	  };
	  $scope.openPopup = function(photoId, photoIndex) {
	    if (photoIndex == null) {
	      $scope.userPhotos.every(function(element, index) {
	        if (element.pid === photoId) {
	          photoIndex = index;
	          return false;
	        }
	        return true;
	      });
	    }
	    if (photoIndex >= 0) {
	      $state.go('user.params', {
	        photo: photoId
	      }, {
	        location: 'replace'
	      });
	      return PhotoPopup.open($scope, photoIndex);
	    } else {
	      return $state.go('user.params', {
	        photo: ''
	      }, {
	        location: 'replace'
	      });
	    }
	  };
	  return $scope.formSubmit = function() {
	    var $stateParams;
	    $stateParams = {
	      location: 'replace',
	      inherit: false
	    };
	    if ($state.current.name === 'user.params') {
	      $scope.getPhotos($scope.userIdInput);
	    }
	    return $state.go('user.params', {
	      id: $scope.userIdInput
	    }, $stateParams);
	  };
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var VKApiService;

	VKApiService = __webpack_require__(4);

	module.exports = angular.module('vkphotos.vkapi', []).constant('VK_API_KEY', 4784531).factory('VKApi', ['$q', 'VK_API_KEY', VKApiService]);


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function($q, VK_API_KEY) {
	  var PHOTO_REQUEST_LIMIT, auth, authed, getUser, getWallPhotos, isAuth;
	  PHOTO_REQUEST_LIMIT = 1000;
	  VK.init({
	    apiId: VK_API_KEY
	  });
	  authed = false;
	  auth = function() {
	    var deferred;
	    deferred = $q.defer();
	    isAuth().then(function() {
	      return deferred.resolve();
	    }, function() {
	      return VK.Auth.login(function(response) {
	        if (response.session) {
	          return deferred.resolve();
	        } else {
	          return deferred.reject();
	        }
	      });
	    });
	    return deferred.promise;
	  };
	  isAuth = function() {
	    var deferred;
	    deferred = $q.defer();
	    if (authed) {
	      deferred.resolve();
	    }
	    VK.Auth.getLoginStatus(function(response) {
	      if (response.session) {
	        authed = true;
	        return deferred.resolve();
	      } else {
	        return deferred.reject();
	      }
	    });
	    return deferred.promise;
	  };
	  getUser = function(userId) {
	    var deferred;
	    deferred = $q.defer();
	    VK.Api.call('users.get', {
	      user_ids: userId
	    }, function(data) {
	      var ownerId;
	      if (data.error && data.error['error_code'] === 113 || data.response && data.response[0].deactivated) {
	        ownerId = null;
	      } else {
	        ownerId = data.response[0].uid;
	      }
	      return deferred.resolve(ownerId);
	    });
	    return deferred.promise;
	  };
	  getWallPhotos = function(userId, count, offset) {
	    var deferred;
	    if (offset == null) {
	      offset = 0;
	    }
	    deferred = $q.defer();
	    if (count > PHOTO_REQUEST_LIMIT) {
	      console.info('Requests are limited to ' + PHOTO_REQUEST_LIMIT + 'photos!');
	      count = PHOTO_REQUEST_LIMIT;
	    }
	    VK.Api.call('photos.get', {
	      owner_id: userId,
	      album_id: 'wall',
	      count: count,
	      rev: 1,
	      extended: 1,
	      photo_sizes: 1,
	      offset: offset
	    }, function(data) {
	      return deferred.resolve(data.response);
	    });
	    return deferred.promise;
	  };
	  return {
	    auth: auth,
	    getUser: getUser,
	    getWallPhotos: getWallPhotos
	  };
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var photoPopupDirective, photoPopupService;

	photoPopupDirective = __webpack_require__(6);

	photoPopupService = __webpack_require__(7);

	__webpack_require__(8);

	__webpack_require__(9);

	module.exports = angular.module('vkphotos.popup', []).service('PhotoPopup', ['$compile', photoPopupService]).directive('popup', photoPopupDirective);


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function() {
	  return {
	    templateUrl: 'popup.html',
	    restrict: 'E',
	    replace: true,
	    scope: true,
	    link: function(scope, elem, attrs) {
	      var body, popupElem, scrollTop;
	      scope.elem = elem;
	      scope.currentPhotoIndex = +attrs.photoIndex;
	      scope.photo = scope.userPhotos[scope.currentPhotoIndex];
	      scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	      popupElem = angular.element(elem[0].querySelector('.popup-photo'));
	      popupElem.css('top', scrollTop + 'px');
	      scope.onKeyDown = function(event) {
	        if (event.which === 27) {
	          return scope.close();
	        } else if (event.which === 37) {
	          return scope.prevPhoto();
	        } else if (event.which === 39) {
	          return scope.nextPhoto();
	        }
	      };
	      body = angular.element(document.body);
	      body.bind('keydown', scope.onKeyDown);
	      body.append(elem[0]);
	      return scope.$emit('popupOpened');
	    },
	    controller: [
	      '$scope', function($scope) {
	        $scope.close = function() {
	          angular.element(document.body).unbind('keydown', $scope.onKeyDown);
	          $scope.elem.remove();
	          $scope.$emit('popupClosed');
	        };
	        $scope.nextPhoto = function() {
	          if (++$scope.currentPhotoIndex > $scope.userPhotos.length - 1) {
	            $scope.currentPhotoIndex = 0;
	          }
	          $scope.photo = $scope.userPhotos[$scope.currentPhotoIndex];
	          $scope.$emit('popupPhotoChanged', $scope.photo.pid);
	          if (!$scope.$$phase) {
	            return $scope.$apply();
	          }
	        };
	        return $scope.prevPhoto = function() {
	          if (--$scope.currentPhotoIndex < 0) {
	            $scope.currentPhotoIndex = $scope.userPhotos.length - 1;
	          }
	          $scope.photo = $scope.userPhotos[$scope.currentPhotoIndex];
	          $scope.$emit('popupPhotoChanged', $scope.photo.pid);
	          if (!$scope.$$phase) {
	            return $scope.$apply();
	          }
	        };
	      }
	    ]
	  };
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = function($compile) {
	  return {
	    open: function(scope, photoIndex) {
	      $compile(angular.element('<popup photo-index="' + photoIndex + '"></popup>'))(scope);
	    }
	  };
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	var v1="<div class=\"popup-container\"> <div class=\"popup-wrapper\" ng-click=\"close()\"></div> <div class=\"popup-photo\"> <div class=\"popup-photo-item\"> <img ng-src=\"{{ photo.sizes[photo.sizes.length-1].src }}\" ng-click=\"nextPhoto()\"/> <div class=\"popup-photo-meta\"> <div>Likes: {{ photo.likes.count }}</div> <div>Comments: {{ photo.comments.count }}</div> <div>Publish date: {{ photo.created * 1000 | date:'yyyy-MM-dd' }}</div> </div> </div> </div> </div>";
	window.angular.module(["ng"]).run(["$templateCache",function(c){c.put("popup.html", v1)}]);
	module.exports=v1;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(10);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(12)(content, {});
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		module.hot.accept("!!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\css-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\less-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\src\\components\\popup\\popup.less", function() {
			var newContent = require("!!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\css-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\less-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\src\\components\\popup\\popup.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(11)();
	exports.push([module.id, ".popup-wrapper {\n  position: fixed;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  z-index: 5;\n  background-color: rgba(0, 0, 0, 0.3);\n}\n.popup-photo {\n  width: 650px;\n  padding: 10px;\n  position: absolute;\n  left: 50%;\n  margin-left: -325px;\n  margin-bottom: 10px;\n  margin-top: 10px;\n  background-color: #fff;\n  z-index: 10;\n  text-align: center;\n}\n.popup-photo img {\n  max-width: 100%;\n  max-height: 100%;\n}\n", ""]);

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = function() {
		var list = [];
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
		return list;
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isIE9 = memoize(function() {
			return /msie 9\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isIE9();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function () {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	function replaceText(source, id, replacement) {
		var boundaries = ["/** >>" + id + " **/", "/** " + id + "<< **/"];
		var start = source.lastIndexOf(boundaries[0]);
		var wrappedReplacement = replacement
			? (boundaries[0] + replacement + boundaries[1])
			: "";
		if (source.lastIndexOf(boundaries[0]) >= 0) {
			var end = source.lastIndexOf(boundaries[1]) + boundaries[1].length;
			return source.slice(0, start) + wrappedReplacement + source.slice(end);
		} else {
			return source + wrappedReplacement;
		}
	}

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(styleElement.styleSheet.cssText, index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap && typeof btoa === "function") {
			try {
				css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(JSON.stringify(sourceMap)) + " */";
				css = "@import url(\"data:text/css;base64," + btoa(css) + "\")";
			} catch(e) {}
		}

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(14);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(12)(content, {});
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		module.hot.accept("!!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\css-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\bower_components\\normalize.css\\normalize.css", function() {
			var newContent = require("!!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\css-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\bower_components\\normalize.css\\normalize.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(11)();
	exports.push([module.id, "/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */\n\n/**\n * 1. Set default font family to sans-serif.\n * 2. Prevent iOS and IE text size adjust after device orientation change,\n *    without disabling user zoom.\n */\n\nhtml {\n  font-family: sans-serif; /* 1 */\n  -ms-text-size-adjust: 100%; /* 2 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n}\n\n/**\n * Remove default margin.\n */\n\nbody {\n  margin: 0;\n}\n\n/* HTML5 display definitions\n   ========================================================================== */\n\n/**\n * Correct `block` display not defined for any HTML5 element in IE 8/9.\n * Correct `block` display not defined for `details` or `summary` in IE 10/11\n * and Firefox.\n * Correct `block` display not defined for `main` in IE 11.\n */\n\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block;\n}\n\n/**\n * 1. Correct `inline-block` display not defined in IE 8/9.\n * 2. Normalize vertical alignment of `progress` in Chrome, Firefox, and Opera.\n */\n\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block; /* 1 */\n  vertical-align: baseline; /* 2 */\n}\n\n/**\n * Prevent modern browsers from displaying `audio` without controls.\n * Remove excess height in iOS 5 devices.\n */\n\naudio:not([controls]) {\n  display: none;\n  height: 0;\n}\n\n/**\n * Address `[hidden]` styling not present in IE 8/9/10.\n * Hide the `template` element in IE 8/9/10/11, Safari, and Firefox < 22.\n */\n\n[hidden],\ntemplate {\n  display: none;\n}\n\n/* Links\n   ========================================================================== */\n\n/**\n * Remove the gray background color from active links in IE 10.\n */\n\na {\n  background-color: transparent;\n}\n\n/**\n * Improve readability of focused elements when they are also in an\n * active/hover state.\n */\n\na:active,\na:hover {\n  outline: 0;\n}\n\n/* Text-level semantics\n   ========================================================================== */\n\n/**\n * Address styling not present in IE 8/9/10/11, Safari, and Chrome.\n */\n\nabbr[title] {\n  border-bottom: 1px dotted;\n}\n\n/**\n * Address style set to `bolder` in Firefox 4+, Safari, and Chrome.\n */\n\nb,\nstrong {\n  font-weight: bold;\n}\n\n/**\n * Address styling not present in Safari and Chrome.\n */\n\ndfn {\n  font-style: italic;\n}\n\n/**\n * Address variable `h1` font-size and margin within `section` and `article`\n * contexts in Firefox 4+, Safari, and Chrome.\n */\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}\n\n/**\n * Address styling not present in IE 8/9.\n */\n\nmark {\n  background: #ff0;\n  color: #000;\n}\n\n/**\n * Address inconsistent and variable font size in all browsers.\n */\n\nsmall {\n  font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` affecting `line-height` in all browsers.\n */\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsup {\n  top: -0.5em;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\n/* Embedded content\n   ========================================================================== */\n\n/**\n * Remove border when inside `a` element in IE 8/9/10.\n */\n\nimg {\n  border: 0;\n}\n\n/**\n * Correct overflow not hidden in IE 9/10/11.\n */\n\nsvg:not(:root) {\n  overflow: hidden;\n}\n\n/* Grouping content\n   ========================================================================== */\n\n/**\n * Address margin not present in IE 8/9 and Safari.\n */\n\nfigure {\n  margin: 1em 40px;\n}\n\n/**\n * Address differences between Firefox and other browsers.\n */\n\nhr {\n  box-sizing: content-box;\n  height: 0;\n}\n\n/**\n * Contain overflow in all browsers.\n */\n\npre {\n  overflow: auto;\n}\n\n/**\n * Address odd `em`-unit font size rendering in all browsers.\n */\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em;\n}\n\n/* Forms\n   ========================================================================== */\n\n/**\n * Known limitation: by default, Chrome and Safari on OS X allow very limited\n * styling of `select`, unless a `border` property is set.\n */\n\n/**\n * 1. Correct color not being inherited.\n *    Known issue: affects color of disabled elements.\n * 2. Correct font properties not being inherited.\n * 3. Address margins set differently in Firefox 4+, Safari, and Chrome.\n */\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  color: inherit; /* 1 */\n  font: inherit; /* 2 */\n  margin: 0; /* 3 */\n}\n\n/**\n * Address `overflow` set to `hidden` in IE 8/9/10/11.\n */\n\nbutton {\n  overflow: visible;\n}\n\n/**\n * Address inconsistent `text-transform` inheritance for `button` and `select`.\n * All other form control elements do not inherit `text-transform` values.\n * Correct `button` style inheritance in Firefox, IE 8/9/10/11, and Opera.\n * Correct `select` style inheritance in Firefox.\n */\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/**\n * 1. Avoid the WebKit bug in Android 4.0.* where (2) destroys native `audio`\n *    and `video` controls.\n * 2. Correct inability to style clickable `input` types in iOS.\n * 3. Improve usability and consistency of cursor style between image-type\n *    `input` and others.\n */\n\nbutton,\nhtml input[type=\"button\"], /* 1 */\ninput[type=\"reset\"],\ninput[type=\"submit\"] {\n  -webkit-appearance: button; /* 2 */\n  cursor: pointer; /* 3 */\n}\n\n/**\n * Re-set default cursor for disabled elements.\n */\n\nbutton[disabled],\nhtml input[disabled] {\n  cursor: default;\n}\n\n/**\n * Remove inner padding and border in Firefox 4+.\n */\n\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  border: 0;\n  padding: 0;\n}\n\n/**\n * Address Firefox 4+ setting `line-height` on `input` using `!important` in\n * the UA stylesheet.\n */\n\ninput {\n  line-height: normal;\n}\n\n/**\n * It's recommended that you don't attempt to style these elements.\n * Firefox's implementation doesn't respect box-sizing, padding, or width.\n *\n * 1. Address box sizing set to `content-box` in IE 8/9/10.\n * 2. Remove excess padding in IE 8/9/10.\n */\n\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  box-sizing: border-box; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Fix the cursor style for Chrome's increment/decrement buttons. For certain\n * `font-size` values of the `input`, it causes the cursor style of the\n * decrement button to change from `default` to `text`.\n */\n\ninput[type=\"number\"]::-webkit-inner-spin-button,\ninput[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/**\n * 1. Address `appearance` set to `searchfield` in Safari and Chrome.\n * 2. Address `box-sizing` set to `border-box` in Safari and Chrome.\n */\n\ninput[type=\"search\"] {\n  -webkit-appearance: textfield; /* 1 */\n  box-sizing: content-box; /* 2 */\n}\n\n/**\n * Remove inner padding and search cancel button in Safari and Chrome on OS X.\n * Safari (but not Chrome) clips the cancel button when the search input has\n * padding (and `textfield` appearance).\n */\n\ninput[type=\"search\"]::-webkit-search-cancel-button,\ninput[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/**\n * Define consistent border, margin, and padding.\n */\n\nfieldset {\n  border: 1px solid #c0c0c0;\n  margin: 0 2px;\n  padding: 0.35em 0.625em 0.75em;\n}\n\n/**\n * 1. Correct `color` not being inherited in IE 8/9/10/11.\n * 2. Remove padding so people aren't caught out if they zero out fieldsets.\n */\n\nlegend {\n  border: 0; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Remove default vertical scrollbar in IE 8/9/10/11.\n */\n\ntextarea {\n  overflow: auto;\n}\n\n/**\n * Don't inherit the `font-weight` (applied by a rule above).\n * NOTE: the default cannot safely be changed in Chrome and Safari on OS X.\n */\n\noptgroup {\n  font-weight: bold;\n}\n\n/* Tables\n   ========================================================================== */\n\n/**\n * Remove most spacing between table cells.\n */\n\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n\ntd,\nth {\n  padding: 0;\n}\n", ""]);

/***/ },
/* 15 */
/***/ function(module, exports) {

	var v1="<div class=\"container\"> <form name=\"userIdForm\" ng-submit=\"formSubmit()\"> <div> User Id / nickname: <input type=\"text\" ng-model=\"userIdInput\" name=\"userIdInput\" required/>\n<button type=\"submit\" ng-disabled=\"userIdForm.$invalid\">Submit</button> </div> </form> <div ui-view></div> </div>";
	window.angular.module(["ng"]).run(["$templateCache",function(c){c.put("main.html", v1)}]);
	module.exports=v1;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(17);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(12)(content, {});
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		module.hot.accept("!!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\css-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\less-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\src\\app\\main\\main.less", function() {
			var newContent = require("!!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\css-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\node_modules\\less-loader\\index.js!C:\\Users\\copman33\\Development\\timzdevz.github.io\\ng-vk-photos\\src\\app\\main\\main.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(11)();
	exports.push([module.id, ".container {\n  width: 960px;\n  margin: 0 auto;\n}\n.container form {\n  margin-top: 10px;\n  text-align: center;\n}\n.photos-container {\n  margin-top: 20px;\n}\n.photos-container .photos-list {\n  overflow: hidden;\n}\n.photos-container .photos-list .photo-item {\n  width: 76px;\n  padding: 10px;\n  float: left;\n}\n.photos-container .photos-list .photo-item .img-container {\n  height: 75px;\n}\n.photos-container .photos-list .photo-item .img-container img {\n  cursor: pointer;\n  max-width: 100%;\n}\n.photos-container .photos-list .photo-item:nth-child(10n + 1) {\n  clear: both;\n}\n.photos-container .photos-list .photo-item .photo-meta {\n  font-size: 12px;\n  padding-top: 5px;\n}\n.status-message {\n  padding: 10px 0;\n  text-align: center;\n}\nbutton[disabled] {\n  color: gray;\n}\n.clearfix {\n  display: block;\n  zoom: 1;\n}\n.clearfix:after {\n  content: \" \";\n  display: block;\n  font-size: 0;\n  height: 0;\n  clear: both;\n  visibility: hidden;\n}\n", ""]);

/***/ },
/* 18 */
/***/ function(module, exports) {

	var v1="<div class=\"status-message\">{{ statusMessage }}</div> <div class=\"photos-container\" ng-if=\"userPhotos.length\"> Sort by: <select ng-model=\"sortBy\" ng-change=\"sortPhotos(sortBy)\"> <option value=\"-created\">Publish date</option> <option value=\"-likes.count\">Likes</option> <option value=\"-comments.count\">Comments</option> </select> <div class=\"clearfix\"></div> <div class=\"photos-list\" infinite-scroll=\"getNextPhotos()\" infinite-scroll-disabled=\"loadingNext || loadedAll || popupOpened\"> <div ng-repeat=\"photo in userPhotos\" class=\"photo-item\"> <div class=\"img-container\"> <img ng-src=\"{{ photo.sizes[0].src }}\" ng-click=\"openPopup(photo.pid, $index)\"/> </div> <div class=\"photo-meta\"> <div>Likes: {{ photo.likes.count }}</div> <div>Comments: {{ photo.comments.count }}</div> </div> </div> </div> </div> <div ng-show=\"loadingNext\" class=\"status-message\">Loading data...</div>";
	window.angular.module(["ng"]).run(["$templateCache",function(c){c.put("photo-list.html", v1)}]);
	module.exports=v1;

/***/ }
/******/ ]);