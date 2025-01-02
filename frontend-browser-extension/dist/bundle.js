/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/localCache/dataIdentification.ts":
/*!**********************************************!*\
  !*** ./src/localCache/dataIdentification.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataIdentifier = void 0;
const fastq_1 = __importDefault(__webpack_require__(/*! fastq */ "../node_modules/fastq/queue.js"));
class DataIdentifier {
    constructor() {
        this.queue = (0, fastq_1.default)(this.handleData.bind(this), 1); // Concurrency set to 1
    }
    /**
     * Primary entry point for external calls to process data.
     */
    identifyAndProcess(data) {
        const transformedData = this.normalizeData(data);
        this.queue.push(transformedData, (err) => {
            if (err) {
                console.error('Error processing data:', err);
            }
        });
    }
    /**
     * Allows an external module (e.g., local cache or encryption)
     * to receive the finalized CapturedData once processed.
     */
    setCallback(callback) {
        this.onProcessedCallback = callback;
    }
    /**
     * The internal function that runs for each item in the queue.
     */
    handleData(data, callback) {
        try {
            // After final transformation/detection, pass data forward
            console.log('DataIdentifier handling data:', data);
            if (this.onProcessedCallback) {
                this.onProcessedCallback(data);
            }
            callback(null); // Explicitly pass null when there's no error
        }
        catch (error) {
            callback(error);
        }
    }
    normalizeData(data) {
        return Object.assign(Object.assign({}, data), { id: this.generateUniqueId(data), sensitiveData: this.detectSensitiveData(data) });
    }
    generateUniqueId(data) {
        return `${data.url}-${data.timestamp}`; // Example unique ID generation
    }
    detectSensitiveData(data) {
        let bodyString = '';
        try {
            // data.body might be FormData, an ArrayBuffer, or something else that JSON.stringify won't handle well.
            // Convert safely, or skip if it fails.
            if (data.body !== undefined) {
                bodyString = JSON.stringify(data.body);
            }
        }
        catch (e) {
            console.warn('Failed to stringify request body in detectSensitiveData()', e);
            // If stringification fails, just skip checking for sensitive data:
            bodyString = '';
        }
        const sensitiveKeywords = ["password", "credit card"];
        return sensitiveKeywords.some(keyword => bodyString.includes(keyword));
    }
}
exports.DataIdentifier = DataIdentifier;


/***/ }),

/***/ "./src/services/dataMonitor.ts":
/*!*************************************!*\
  !*** ./src/services/dataMonitor.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.monitorAPIRequests = monitorAPIRequests;
const dataIdentification_1 = __webpack_require__(/*! ../localCache/dataIdentification */ "./src/localCache/dataIdentification.ts");
// src/services/dataMonitor.ts
function monitorAPIRequests() {
    // Listen for outgoing requests
    chrome.webRequest.onBeforeRequest.addListener((details) => {
        console.log("Intercepted Request:", details);
        storeRequestData({
            requestHeaders: {},
            url: details.url,
            method: details.method,
            requestBody: details.requestBody,
            timeStamp: details.timeStamp,
            initiator: details.initiator,
            requestId: details.requestId
        });
    }, {
        urls: ["<all_urls>"]
    }, ["requestBody"]);
    // Inject content script to capture full response body
    chrome.webRequest.onCompleted.addListener((details) => {
        injectContentScript(details.tabId, details.url);
    }, {
        urls: ["<all_urls>"]
    });
}
function storeRequestData(details) {
    let safeRequestBody = null;
    try {
        // Attempt to clone/JSON-ify it safely
        safeRequestBody = JSON.parse(JSON.stringify(details.requestBody));
    }
    catch (err) {
        console.warn('Could not stringify or store requestBody; storing null instead.', err);
        safeRequestBody = null;
    }
    const requestData = {
        url: details.url,
        method: details.method,
        requestBody: safeRequestBody,
        timeStamp: details.timeStamp,
        initiator: details.initiator || "unknown",
    };
    chrome.storage.local.set({ [`request_${details.requestId}`]: requestData }, () => {
        const error = chrome.runtime.lastError;
        if (error) {
            console.warn('Error setting request data:', error);
        }
        else {
            console.log("Request data saved:", requestData);
            // READ BACK EVERYTHING for debugging:
            chrome.storage.local.get(null, (items) => {
                console.log('All items in chrome.storage.local:', items);
            });
        }
    });
    // Pass the same "cleaned" body to DataIdentifier if you wish
    const dataIdentifier = new dataIdentification_1.DataIdentifier();
    dataIdentifier.identifyAndProcess({
        id: '',
        url: details.url,
        headers: details.requestHeaders || {},
        body: safeRequestBody, // pass the cleaned body
        timestamp: details.timeStamp,
        sensitiveData: false,
    });
}
function injectContentScript(tabId, detailsUrl) {
    // If the URL starts with chrome:// or chrome-extension://, skip injection
    if (detailsUrl.startsWith('chrome://') || detailsUrl.startsWith('chrome-extension://')) {
        return;
    }
    if (tabId <= 0) {
        return;
    }
    chrome.scripting.executeScript({
        target: { tabId },
        files: ["contentScript.js"]
    }, () => {
        console.log("Content script injected into tab", tabId);
    });
}


/***/ }),

/***/ "../node_modules/fastq/queue.js":
/*!**************************************!*\
  !*** ../node_modules/fastq/queue.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* eslint-disable no-var */

var reusify = __webpack_require__(/*! reusify */ "../node_modules/reusify/reusify.js")

function fastqueue (context, worker, _concurrency) {
  if (typeof context === 'function') {
    _concurrency = worker
    worker = context
    context = null
  }

  if (!(_concurrency >= 1)) {
    throw new Error('fastqueue concurrency must be equal to or greater than 1')
  }

  var cache = reusify(Task)
  var queueHead = null
  var queueTail = null
  var _running = 0
  var errorHandler = null

  var self = {
    push: push,
    drain: noop,
    saturated: noop,
    pause: pause,
    paused: false,

    get concurrency () {
      return _concurrency
    },
    set concurrency (value) {
      if (!(value >= 1)) {
        throw new Error('fastqueue concurrency must be equal to or greater than 1')
      }
      _concurrency = value

      if (self.paused) return
      for (; queueHead && _running < _concurrency;) {
        _running++
        release()
      }
    },

    running: running,
    resume: resume,
    idle: idle,
    length: length,
    getQueue: getQueue,
    unshift: unshift,
    empty: noop,
    kill: kill,
    killAndDrain: killAndDrain,
    error: error
  }

  return self

  function running () {
    return _running
  }

  function pause () {
    self.paused = true
  }

  function length () {
    var current = queueHead
    var counter = 0

    while (current) {
      current = current.next
      counter++
    }

    return counter
  }

  function getQueue () {
    var current = queueHead
    var tasks = []

    while (current) {
      tasks.push(current.value)
      current = current.next
    }

    return tasks
  }

  function resume () {
    if (!self.paused) return
    self.paused = false
    if (queueHead === null) {
      _running++
      release()
      return
    }
    for (; queueHead && _running < _concurrency;) {
      _running++
      release()
    }
  }

  function idle () {
    return _running === 0 && self.length() === 0
  }

  function push (value, done) {
    var current = cache.get()

    current.context = context
    current.release = release
    current.value = value
    current.callback = done || noop
    current.errorHandler = errorHandler

    if (_running >= _concurrency || self.paused) {
      if (queueTail) {
        queueTail.next = current
        queueTail = current
      } else {
        queueHead = current
        queueTail = current
        self.saturated()
      }
    } else {
      _running++
      worker.call(context, current.value, current.worked)
    }
  }

  function unshift (value, done) {
    var current = cache.get()

    current.context = context
    current.release = release
    current.value = value
    current.callback = done || noop
    current.errorHandler = errorHandler

    if (_running >= _concurrency || self.paused) {
      if (queueHead) {
        current.next = queueHead
        queueHead = current
      } else {
        queueHead = current
        queueTail = current
        self.saturated()
      }
    } else {
      _running++
      worker.call(context, current.value, current.worked)
    }
  }

  function release (holder) {
    if (holder) {
      cache.release(holder)
    }
    var next = queueHead
    if (next && _running <= _concurrency) {
      if (!self.paused) {
        if (queueTail === queueHead) {
          queueTail = null
        }
        queueHead = next.next
        next.next = null
        worker.call(context, next.value, next.worked)
        if (queueTail === null) {
          self.empty()
        }
      } else {
        _running--
      }
    } else if (--_running === 0) {
      self.drain()
    }
  }

  function kill () {
    queueHead = null
    queueTail = null
    self.drain = noop
  }

  function killAndDrain () {
    queueHead = null
    queueTail = null
    self.drain()
    self.drain = noop
  }

  function error (handler) {
    errorHandler = handler
  }
}

function noop () {}

function Task () {
  this.value = null
  this.callback = noop
  this.next = null
  this.release = noop
  this.context = null
  this.errorHandler = null

  var self = this

  this.worked = function worked (err, result) {
    var callback = self.callback
    var errorHandler = self.errorHandler
    var val = self.value
    self.value = null
    self.callback = noop
    if (self.errorHandler) {
      errorHandler(err, val)
    }
    callback.call(self.context, err, result)
    self.release(self)
  }
}

function queueAsPromised (context, worker, _concurrency) {
  if (typeof context === 'function') {
    _concurrency = worker
    worker = context
    context = null
  }

  function asyncWrapper (arg, cb) {
    worker.call(this, arg)
      .then(function (res) {
        cb(null, res)
      }, cb)
  }

  var queue = fastqueue(context, asyncWrapper, _concurrency)

  var pushCb = queue.push
  var unshiftCb = queue.unshift

  queue.push = push
  queue.unshift = unshift
  queue.drained = drained

  return queue

  function push (value) {
    var p = new Promise(function (resolve, reject) {
      pushCb(value, function (err, result) {
        if (err) {
          reject(err)
          return
        }
        resolve(result)
      })
    })

    // Let's fork the promise chain to
    // make the error bubble up to the user but
    // not lead to a unhandledRejection
    p.catch(noop)

    return p
  }

  function unshift (value) {
    var p = new Promise(function (resolve, reject) {
      unshiftCb(value, function (err, result) {
        if (err) {
          reject(err)
          return
        }
        resolve(result)
      })
    })

    // Let's fork the promise chain to
    // make the error bubble up to the user but
    // not lead to a unhandledRejection
    p.catch(noop)

    return p
  }

  function drained () {
    var p = new Promise(function (resolve) {
      process.nextTick(function () {
        if (queue.idle()) {
          resolve()
        } else {
          var previousDrain = queue.drain
          queue.drain = function () {
            if (typeof previousDrain === 'function') previousDrain()
            resolve()
            queue.drain = previousDrain
          }
        }
      })
    })

    return p
  }
}

module.exports = fastqueue
module.exports.promise = queueAsPromised


/***/ }),

/***/ "../node_modules/reusify/reusify.js":
/*!******************************************!*\
  !*** ../node_modules/reusify/reusify.js ***!
  \******************************************/
/***/ ((module) => {



function reusify (Constructor) {
  var head = new Constructor()
  var tail = head

  function get () {
    var current = head

    if (current.next) {
      head = current.next
    } else {
      head = new Constructor()
      tail = head
    }

    current.next = null

    return current
  }

  function release (obj) {
    tail.next = obj
    tail = obj
  }

  return {
    get: get,
    release: release
  }
}

module.exports = reusify


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*******************************!*\
  !*** ./src/mainController.ts ***!
  \*******************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const dataIdentification_1 = __webpack_require__(/*! ./localCache/dataIdentification */ "./src/localCache/dataIdentification.ts");
const dataMonitor_1 = __webpack_require__(/*! ./services/dataMonitor */ "./src/services/dataMonitor.ts");
// This background script is our single entry point
console.log('Background script is loading...');
// Create your DataIdentifier instance
const dataIdentifier = new dataIdentification_1.DataIdentifier();
// If you have other references, e.g. LocalCache, do so here as well
// Option A: Use the dataMonitor approach
(0, dataMonitor_1.monitorAPIRequests)();
// This sets up chrome.webRequest.onBeforeRequest + onCompleted to store request data and inject the content script.
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background got a message:', message);
    if (message.type === "FETCH_RESPONSE" || message.type === "XHR_RESPONSE") {
        console.log("Received response data from content script:", message);
        // e.g. store them in dataIdentifier or localCache
    }
    sendResponse({ status: "ok" });
    return true; // Keep the message channel open if needed for async
});
console.log('Background script finished loading.');

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0I7Ozs7Ozs7Ozs7O0FDdFRWOztBQUVaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztVQ2hDQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7O0FDdEJhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELDZCQUE2QixtQkFBTyxDQUFDLCtFQUFpQztBQUN0RSxzQkFBc0IsbUJBQU8sQ0FBQyw2REFBd0I7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGNBQWM7QUFDakMsaUJBQWlCO0FBQ2pCLENBQUM7QUFDRCIsInNvdXJjZXMiOlsid2VicGFjazovL2Zyb250ZW5kLWJyb3dzZXItZXh0ZW5zaW9uLy4vc3JjL2xvY2FsQ2FjaGUvZGF0YUlkZW50aWZpY2F0aW9uLnRzIiwid2VicGFjazovL2Zyb250ZW5kLWJyb3dzZXItZXh0ZW5zaW9uLy4vc3JjL3NlcnZpY2VzL2RhdGFNb25pdG9yLnRzIiwid2VicGFjazovL2Zyb250ZW5kLWJyb3dzZXItZXh0ZW5zaW9uLy4uL25vZGVfbW9kdWxlcy9mYXN0cS9xdWV1ZS5qcyIsIndlYnBhY2s6Ly9mcm9udGVuZC1icm93c2VyLWV4dGVuc2lvbi8uLi9ub2RlX21vZHVsZXMvcmV1c2lmeS9yZXVzaWZ5LmpzIiwid2VicGFjazovL2Zyb250ZW5kLWJyb3dzZXItZXh0ZW5zaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Zyb250ZW5kLWJyb3dzZXItZXh0ZW5zaW9uLy4vc3JjL21haW5Db250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5EYXRhSWRlbnRpZmllciA9IHZvaWQgMDtcbmNvbnN0IGZhc3RxXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImZhc3RxXCIpKTtcbmNsYXNzIERhdGFJZGVudGlmaWVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5xdWV1ZSA9ICgwLCBmYXN0cV8xLmRlZmF1bHQpKHRoaXMuaGFuZGxlRGF0YS5iaW5kKHRoaXMpLCAxKTsgLy8gQ29uY3VycmVuY3kgc2V0IHRvIDFcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJpbWFyeSBlbnRyeSBwb2ludCBmb3IgZXh0ZXJuYWwgY2FsbHMgdG8gcHJvY2VzcyBkYXRhLlxuICAgICAqL1xuICAgIGlkZW50aWZ5QW5kUHJvY2VzcyhkYXRhKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YSA9IHRoaXMubm9ybWFsaXplRGF0YShkYXRhKTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHRyYW5zZm9ybWVkRGF0YSwgKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHByb2Nlc3NpbmcgZGF0YTonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWxsb3dzIGFuIGV4dGVybmFsIG1vZHVsZSAoZS5nLiwgbG9jYWwgY2FjaGUgb3IgZW5jcnlwdGlvbilcbiAgICAgKiB0byByZWNlaXZlIHRoZSBmaW5hbGl6ZWQgQ2FwdHVyZWREYXRhIG9uY2UgcHJvY2Vzc2VkLlxuICAgICAqL1xuICAgIHNldENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMub25Qcm9jZXNzZWRDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGUgaW50ZXJuYWwgZnVuY3Rpb24gdGhhdCBydW5zIGZvciBlYWNoIGl0ZW0gaW4gdGhlIHF1ZXVlLlxuICAgICAqL1xuICAgIGhhbmRsZURhdGEoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEFmdGVyIGZpbmFsIHRyYW5zZm9ybWF0aW9uL2RldGVjdGlvbiwgcGFzcyBkYXRhIGZvcndhcmRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEYXRhSWRlbnRpZmllciBoYW5kbGluZyBkYXRhOicsIGRhdGEpO1xuICAgICAgICAgICAgaWYgKHRoaXMub25Qcm9jZXNzZWRDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHRoaXMub25Qcm9jZXNzZWRDYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpOyAvLyBFeHBsaWNpdGx5IHBhc3MgbnVsbCB3aGVuIHRoZXJlJ3Mgbm8gZXJyb3JcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBub3JtYWxpemVEYXRhKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgZGF0YSksIHsgaWQ6IHRoaXMuZ2VuZXJhdGVVbmlxdWVJZChkYXRhKSwgc2Vuc2l0aXZlRGF0YTogdGhpcy5kZXRlY3RTZW5zaXRpdmVEYXRhKGRhdGEpIH0pO1xuICAgIH1cbiAgICBnZW5lcmF0ZVVuaXF1ZUlkKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGAke2RhdGEudXJsfS0ke2RhdGEudGltZXN0YW1wfWA7IC8vIEV4YW1wbGUgdW5pcXVlIElEIGdlbmVyYXRpb25cbiAgICB9XG4gICAgZGV0ZWN0U2Vuc2l0aXZlRGF0YShkYXRhKSB7XG4gICAgICAgIGxldCBib2R5U3RyaW5nID0gJyc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBkYXRhLmJvZHkgbWlnaHQgYmUgRm9ybURhdGEsIGFuIEFycmF5QnVmZmVyLCBvciBzb21ldGhpbmcgZWxzZSB0aGF0IEpTT04uc3RyaW5naWZ5IHdvbid0IGhhbmRsZSB3ZWxsLlxuICAgICAgICAgICAgLy8gQ29udmVydCBzYWZlbHksIG9yIHNraXAgaWYgaXQgZmFpbHMuXG4gICAgICAgICAgICBpZiAoZGF0YS5ib2R5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBib2R5U3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoZGF0YS5ib2R5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gc3RyaW5naWZ5IHJlcXVlc3QgYm9keSBpbiBkZXRlY3RTZW5zaXRpdmVEYXRhKCknLCBlKTtcbiAgICAgICAgICAgIC8vIElmIHN0cmluZ2lmaWNhdGlvbiBmYWlscywganVzdCBza2lwIGNoZWNraW5nIGZvciBzZW5zaXRpdmUgZGF0YTpcbiAgICAgICAgICAgIGJvZHlTdHJpbmcgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZW5zaXRpdmVLZXl3b3JkcyA9IFtcInBhc3N3b3JkXCIsIFwiY3JlZGl0IGNhcmRcIl07XG4gICAgICAgIHJldHVybiBzZW5zaXRpdmVLZXl3b3Jkcy5zb21lKGtleXdvcmQgPT4gYm9keVN0cmluZy5pbmNsdWRlcyhrZXl3b3JkKSk7XG4gICAgfVxufVxuZXhwb3J0cy5EYXRhSWRlbnRpZmllciA9IERhdGFJZGVudGlmaWVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1vbml0b3JBUElSZXF1ZXN0cyA9IG1vbml0b3JBUElSZXF1ZXN0cztcbmNvbnN0IGRhdGFJZGVudGlmaWNhdGlvbl8xID0gcmVxdWlyZShcIi4uL2xvY2FsQ2FjaGUvZGF0YUlkZW50aWZpY2F0aW9uXCIpO1xuLy8gc3JjL3NlcnZpY2VzL2RhdGFNb25pdG9yLnRzXG5mdW5jdGlvbiBtb25pdG9yQVBJUmVxdWVzdHMoKSB7XG4gICAgLy8gTGlzdGVuIGZvciBvdXRnb2luZyByZXF1ZXN0c1xuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdC5hZGRMaXN0ZW5lcigoZGV0YWlscykgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkludGVyY2VwdGVkIFJlcXVlc3Q6XCIsIGRldGFpbHMpO1xuICAgICAgICBzdG9yZVJlcXVlc3REYXRhKHtcbiAgICAgICAgICAgIHJlcXVlc3RIZWFkZXJzOiB7fSxcbiAgICAgICAgICAgIHVybDogZGV0YWlscy51cmwsXG4gICAgICAgICAgICBtZXRob2Q6IGRldGFpbHMubWV0aG9kLFxuICAgICAgICAgICAgcmVxdWVzdEJvZHk6IGRldGFpbHMucmVxdWVzdEJvZHksXG4gICAgICAgICAgICB0aW1lU3RhbXA6IGRldGFpbHMudGltZVN0YW1wLFxuICAgICAgICAgICAgaW5pdGlhdG9yOiBkZXRhaWxzLmluaXRpYXRvcixcbiAgICAgICAgICAgIHJlcXVlc3RJZDogZGV0YWlscy5yZXF1ZXN0SWRcbiAgICAgICAgfSk7XG4gICAgfSwge1xuICAgICAgICB1cmxzOiBbXCI8YWxsX3VybHM+XCJdXG4gICAgfSwgW1wicmVxdWVzdEJvZHlcIl0pO1xuICAgIC8vIEluamVjdCBjb250ZW50IHNjcmlwdCB0byBjYXB0dXJlIGZ1bGwgcmVzcG9uc2UgYm9keVxuICAgIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQ29tcGxldGVkLmFkZExpc3RlbmVyKChkZXRhaWxzKSA9PiB7XG4gICAgICAgIGluamVjdENvbnRlbnRTY3JpcHQoZGV0YWlscy50YWJJZCwgZGV0YWlscy51cmwpO1xuICAgIH0sIHtcbiAgICAgICAgdXJsczogW1wiPGFsbF91cmxzPlwiXVxuICAgIH0pO1xufVxuZnVuY3Rpb24gc3RvcmVSZXF1ZXN0RGF0YShkZXRhaWxzKSB7XG4gICAgbGV0IHNhZmVSZXF1ZXN0Qm9keSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gQXR0ZW1wdCB0byBjbG9uZS9KU09OLWlmeSBpdCBzYWZlbHlcbiAgICAgICAgc2FmZVJlcXVlc3RCb2R5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZXRhaWxzLnJlcXVlc3RCb2R5KSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdDb3VsZCBub3Qgc3RyaW5naWZ5IG9yIHN0b3JlIHJlcXVlc3RCb2R5OyBzdG9yaW5nIG51bGwgaW5zdGVhZC4nLCBlcnIpO1xuICAgICAgICBzYWZlUmVxdWVzdEJvZHkgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgdXJsOiBkZXRhaWxzLnVybCxcbiAgICAgICAgbWV0aG9kOiBkZXRhaWxzLm1ldGhvZCxcbiAgICAgICAgcmVxdWVzdEJvZHk6IHNhZmVSZXF1ZXN0Qm9keSxcbiAgICAgICAgdGltZVN0YW1wOiBkZXRhaWxzLnRpbWVTdGFtcCxcbiAgICAgICAgaW5pdGlhdG9yOiBkZXRhaWxzLmluaXRpYXRvciB8fCBcInVua25vd25cIixcbiAgICB9O1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtgcmVxdWVzdF8ke2RldGFpbHMucmVxdWVzdElkfWBdOiByZXF1ZXN0RGF0YSB9LCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignRXJyb3Igc2V0dGluZyByZXF1ZXN0IGRhdGE6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZXF1ZXN0IGRhdGEgc2F2ZWQ6XCIsIHJlcXVlc3REYXRhKTtcbiAgICAgICAgICAgIC8vIFJFQUQgQkFDSyBFVkVSWVRISU5HIGZvciBkZWJ1Z2dpbmc6XG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQobnVsbCwgKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0FsbCBpdGVtcyBpbiBjaHJvbWUuc3RvcmFnZS5sb2NhbDonLCBpdGVtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIC8vIFBhc3MgdGhlIHNhbWUgXCJjbGVhbmVkXCIgYm9keSB0byBEYXRhSWRlbnRpZmllciBpZiB5b3Ugd2lzaFxuICAgIGNvbnN0IGRhdGFJZGVudGlmaWVyID0gbmV3IGRhdGFJZGVudGlmaWNhdGlvbl8xLkRhdGFJZGVudGlmaWVyKCk7XG4gICAgZGF0YUlkZW50aWZpZXIuaWRlbnRpZnlBbmRQcm9jZXNzKHtcbiAgICAgICAgaWQ6ICcnLFxuICAgICAgICB1cmw6IGRldGFpbHMudXJsLFxuICAgICAgICBoZWFkZXJzOiBkZXRhaWxzLnJlcXVlc3RIZWFkZXJzIHx8IHt9LFxuICAgICAgICBib2R5OiBzYWZlUmVxdWVzdEJvZHksIC8vIHBhc3MgdGhlIGNsZWFuZWQgYm9keVxuICAgICAgICB0aW1lc3RhbXA6IGRldGFpbHMudGltZVN0YW1wLFxuICAgICAgICBzZW5zaXRpdmVEYXRhOiBmYWxzZSxcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGluamVjdENvbnRlbnRTY3JpcHQodGFiSWQsIGRldGFpbHNVcmwpIHtcbiAgICAvLyBJZiB0aGUgVVJMIHN0YXJ0cyB3aXRoIGNocm9tZTovLyBvciBjaHJvbWUtZXh0ZW5zaW9uOi8vLCBza2lwIGluamVjdGlvblxuICAgIGlmIChkZXRhaWxzVXJsLnN0YXJ0c1dpdGgoJ2Nocm9tZTovLycpIHx8IGRldGFpbHNVcmwuc3RhcnRzV2l0aCgnY2hyb21lLWV4dGVuc2lvbjovLycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRhYklkIDw9IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICB0YXJnZXQ6IHsgdGFiSWQgfSxcbiAgICAgICAgZmlsZXM6IFtcImNvbnRlbnRTY3JpcHQuanNcIl1cbiAgICB9LCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ29udGVudCBzY3JpcHQgaW5qZWN0ZWQgaW50byB0YWJcIiwgdGFiSWQpO1xuICAgIH0pO1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXZhciAqL1xuXG52YXIgcmV1c2lmeSA9IHJlcXVpcmUoJ3JldXNpZnknKVxuXG5mdW5jdGlvbiBmYXN0cXVldWUgKGNvbnRleHQsIHdvcmtlciwgX2NvbmN1cnJlbmN5KSB7XG4gIGlmICh0eXBlb2YgY29udGV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIF9jb25jdXJyZW5jeSA9IHdvcmtlclxuICAgIHdvcmtlciA9IGNvbnRleHRcbiAgICBjb250ZXh0ID0gbnVsbFxuICB9XG5cbiAgaWYgKCEoX2NvbmN1cnJlbmN5ID49IDEpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmYXN0cXVldWUgY29uY3VycmVuY3kgbXVzdCBiZSBlcXVhbCB0byBvciBncmVhdGVyIHRoYW4gMScpXG4gIH1cblxuICB2YXIgY2FjaGUgPSByZXVzaWZ5KFRhc2spXG4gIHZhciBxdWV1ZUhlYWQgPSBudWxsXG4gIHZhciBxdWV1ZVRhaWwgPSBudWxsXG4gIHZhciBfcnVubmluZyA9IDBcbiAgdmFyIGVycm9ySGFuZGxlciA9IG51bGxcblxuICB2YXIgc2VsZiA9IHtcbiAgICBwdXNoOiBwdXNoLFxuICAgIGRyYWluOiBub29wLFxuICAgIHNhdHVyYXRlZDogbm9vcCxcbiAgICBwYXVzZTogcGF1c2UsXG4gICAgcGF1c2VkOiBmYWxzZSxcblxuICAgIGdldCBjb25jdXJyZW5jeSAoKSB7XG4gICAgICByZXR1cm4gX2NvbmN1cnJlbmN5XG4gICAgfSxcbiAgICBzZXQgY29uY3VycmVuY3kgKHZhbHVlKSB7XG4gICAgICBpZiAoISh2YWx1ZSA+PSAxKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Zhc3RxdWV1ZSBjb25jdXJyZW5jeSBtdXN0IGJlIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiAxJylcbiAgICAgIH1cbiAgICAgIF9jb25jdXJyZW5jeSA9IHZhbHVlXG5cbiAgICAgIGlmIChzZWxmLnBhdXNlZCkgcmV0dXJuXG4gICAgICBmb3IgKDsgcXVldWVIZWFkICYmIF9ydW5uaW5nIDwgX2NvbmN1cnJlbmN5Oykge1xuICAgICAgICBfcnVubmluZysrXG4gICAgICAgIHJlbGVhc2UoKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBydW5uaW5nOiBydW5uaW5nLFxuICAgIHJlc3VtZTogcmVzdW1lLFxuICAgIGlkbGU6IGlkbGUsXG4gICAgbGVuZ3RoOiBsZW5ndGgsXG4gICAgZ2V0UXVldWU6IGdldFF1ZXVlLFxuICAgIHVuc2hpZnQ6IHVuc2hpZnQsXG4gICAgZW1wdHk6IG5vb3AsXG4gICAga2lsbDoga2lsbCxcbiAgICBraWxsQW5kRHJhaW46IGtpbGxBbmREcmFpbixcbiAgICBlcnJvcjogZXJyb3JcbiAgfVxuXG4gIHJldHVybiBzZWxmXG5cbiAgZnVuY3Rpb24gcnVubmluZyAoKSB7XG4gICAgcmV0dXJuIF9ydW5uaW5nXG4gIH1cblxuICBmdW5jdGlvbiBwYXVzZSAoKSB7XG4gICAgc2VsZi5wYXVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBsZW5ndGggKCkge1xuICAgIHZhciBjdXJyZW50ID0gcXVldWVIZWFkXG4gICAgdmFyIGNvdW50ZXIgPSAwXG5cbiAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxuICAgICAgY291bnRlcisrXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvdW50ZXJcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFF1ZXVlICgpIHtcbiAgICB2YXIgY3VycmVudCA9IHF1ZXVlSGVhZFxuICAgIHZhciB0YXNrcyA9IFtdXG5cbiAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgdGFza3MucHVzaChjdXJyZW50LnZhbHVlKVxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFxuICAgIH1cblxuICAgIHJldHVybiB0YXNrc1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzdW1lICgpIHtcbiAgICBpZiAoIXNlbGYucGF1c2VkKSByZXR1cm5cbiAgICBzZWxmLnBhdXNlZCA9IGZhbHNlXG4gICAgaWYgKHF1ZXVlSGVhZCA9PT0gbnVsbCkge1xuICAgICAgX3J1bm5pbmcrK1xuICAgICAgcmVsZWFzZSgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZm9yICg7IHF1ZXVlSGVhZCAmJiBfcnVubmluZyA8IF9jb25jdXJyZW5jeTspIHtcbiAgICAgIF9ydW5uaW5nKytcbiAgICAgIHJlbGVhc2UoKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlkbGUgKCkge1xuICAgIHJldHVybiBfcnVubmluZyA9PT0gMCAmJiBzZWxmLmxlbmd0aCgpID09PSAwXG4gIH1cblxuICBmdW5jdGlvbiBwdXNoICh2YWx1ZSwgZG9uZSkge1xuICAgIHZhciBjdXJyZW50ID0gY2FjaGUuZ2V0KClcblxuICAgIGN1cnJlbnQuY29udGV4dCA9IGNvbnRleHRcbiAgICBjdXJyZW50LnJlbGVhc2UgPSByZWxlYXNlXG4gICAgY3VycmVudC52YWx1ZSA9IHZhbHVlXG4gICAgY3VycmVudC5jYWxsYmFjayA9IGRvbmUgfHwgbm9vcFxuICAgIGN1cnJlbnQuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyXG5cbiAgICBpZiAoX3J1bm5pbmcgPj0gX2NvbmN1cnJlbmN5IHx8IHNlbGYucGF1c2VkKSB7XG4gICAgICBpZiAocXVldWVUYWlsKSB7XG4gICAgICAgIHF1ZXVlVGFpbC5uZXh0ID0gY3VycmVudFxuICAgICAgICBxdWV1ZVRhaWwgPSBjdXJyZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUhlYWQgPSBjdXJyZW50XG4gICAgICAgIHF1ZXVlVGFpbCA9IGN1cnJlbnRcbiAgICAgICAgc2VsZi5zYXR1cmF0ZWQoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfcnVubmluZysrXG4gICAgICB3b3JrZXIuY2FsbChjb250ZXh0LCBjdXJyZW50LnZhbHVlLCBjdXJyZW50LndvcmtlZClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1bnNoaWZ0ICh2YWx1ZSwgZG9uZSkge1xuICAgIHZhciBjdXJyZW50ID0gY2FjaGUuZ2V0KClcblxuICAgIGN1cnJlbnQuY29udGV4dCA9IGNvbnRleHRcbiAgICBjdXJyZW50LnJlbGVhc2UgPSByZWxlYXNlXG4gICAgY3VycmVudC52YWx1ZSA9IHZhbHVlXG4gICAgY3VycmVudC5jYWxsYmFjayA9IGRvbmUgfHwgbm9vcFxuICAgIGN1cnJlbnQuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyXG5cbiAgICBpZiAoX3J1bm5pbmcgPj0gX2NvbmN1cnJlbmN5IHx8IHNlbGYucGF1c2VkKSB7XG4gICAgICBpZiAocXVldWVIZWFkKSB7XG4gICAgICAgIGN1cnJlbnQubmV4dCA9IHF1ZXVlSGVhZFxuICAgICAgICBxdWV1ZUhlYWQgPSBjdXJyZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUhlYWQgPSBjdXJyZW50XG4gICAgICAgIHF1ZXVlVGFpbCA9IGN1cnJlbnRcbiAgICAgICAgc2VsZi5zYXR1cmF0ZWQoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfcnVubmluZysrXG4gICAgICB3b3JrZXIuY2FsbChjb250ZXh0LCBjdXJyZW50LnZhbHVlLCBjdXJyZW50LndvcmtlZClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWxlYXNlIChob2xkZXIpIHtcbiAgICBpZiAoaG9sZGVyKSB7XG4gICAgICBjYWNoZS5yZWxlYXNlKGhvbGRlcilcbiAgICB9XG4gICAgdmFyIG5leHQgPSBxdWV1ZUhlYWRcbiAgICBpZiAobmV4dCAmJiBfcnVubmluZyA8PSBfY29uY3VycmVuY3kpIHtcbiAgICAgIGlmICghc2VsZi5wYXVzZWQpIHtcbiAgICAgICAgaWYgKHF1ZXVlVGFpbCA9PT0gcXVldWVIZWFkKSB7XG4gICAgICAgICAgcXVldWVUYWlsID0gbnVsbFxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSGVhZCA9IG5leHQubmV4dFxuICAgICAgICBuZXh0Lm5leHQgPSBudWxsXG4gICAgICAgIHdvcmtlci5jYWxsKGNvbnRleHQsIG5leHQudmFsdWUsIG5leHQud29ya2VkKVxuICAgICAgICBpZiAocXVldWVUYWlsID09PSBudWxsKSB7XG4gICAgICAgICAgc2VsZi5lbXB0eSgpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9ydW5uaW5nLS1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKC0tX3J1bm5pbmcgPT09IDApIHtcbiAgICAgIHNlbGYuZHJhaW4oKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGtpbGwgKCkge1xuICAgIHF1ZXVlSGVhZCA9IG51bGxcbiAgICBxdWV1ZVRhaWwgPSBudWxsXG4gICAgc2VsZi5kcmFpbiA9IG5vb3BcbiAgfVxuXG4gIGZ1bmN0aW9uIGtpbGxBbmREcmFpbiAoKSB7XG4gICAgcXVldWVIZWFkID0gbnVsbFxuICAgIHF1ZXVlVGFpbCA9IG51bGxcbiAgICBzZWxmLmRyYWluKClcbiAgICBzZWxmLmRyYWluID0gbm9vcFxuICB9XG5cbiAgZnVuY3Rpb24gZXJyb3IgKGhhbmRsZXIpIHtcbiAgICBlcnJvckhhbmRsZXIgPSBoYW5kbGVyXG4gIH1cbn1cblxuZnVuY3Rpb24gbm9vcCAoKSB7fVxuXG5mdW5jdGlvbiBUYXNrICgpIHtcbiAgdGhpcy52YWx1ZSA9IG51bGxcbiAgdGhpcy5jYWxsYmFjayA9IG5vb3BcbiAgdGhpcy5uZXh0ID0gbnVsbFxuICB0aGlzLnJlbGVhc2UgPSBub29wXG4gIHRoaXMuY29udGV4dCA9IG51bGxcbiAgdGhpcy5lcnJvckhhbmRsZXIgPSBudWxsXG5cbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgdGhpcy53b3JrZWQgPSBmdW5jdGlvbiB3b3JrZWQgKGVyciwgcmVzdWx0KSB7XG4gICAgdmFyIGNhbGxiYWNrID0gc2VsZi5jYWxsYmFja1xuICAgIHZhciBlcnJvckhhbmRsZXIgPSBzZWxmLmVycm9ySGFuZGxlclxuICAgIHZhciB2YWwgPSBzZWxmLnZhbHVlXG4gICAgc2VsZi52YWx1ZSA9IG51bGxcbiAgICBzZWxmLmNhbGxiYWNrID0gbm9vcFxuICAgIGlmIChzZWxmLmVycm9ySGFuZGxlcikge1xuICAgICAgZXJyb3JIYW5kbGVyKGVyciwgdmFsKVxuICAgIH1cbiAgICBjYWxsYmFjay5jYWxsKHNlbGYuY29udGV4dCwgZXJyLCByZXN1bHQpXG4gICAgc2VsZi5yZWxlYXNlKHNlbGYpXG4gIH1cbn1cblxuZnVuY3Rpb24gcXVldWVBc1Byb21pc2VkIChjb250ZXh0LCB3b3JrZXIsIF9jb25jdXJyZW5jeSkge1xuICBpZiAodHlwZW9mIGNvbnRleHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBfY29uY3VycmVuY3kgPSB3b3JrZXJcbiAgICB3b3JrZXIgPSBjb250ZXh0XG4gICAgY29udGV4dCA9IG51bGxcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzeW5jV3JhcHBlciAoYXJnLCBjYikge1xuICAgIHdvcmtlci5jYWxsKHRoaXMsIGFyZylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgY2IobnVsbCwgcmVzKVxuICAgICAgfSwgY2IpXG4gIH1cblxuICB2YXIgcXVldWUgPSBmYXN0cXVldWUoY29udGV4dCwgYXN5bmNXcmFwcGVyLCBfY29uY3VycmVuY3kpXG5cbiAgdmFyIHB1c2hDYiA9IHF1ZXVlLnB1c2hcbiAgdmFyIHVuc2hpZnRDYiA9IHF1ZXVlLnVuc2hpZnRcblxuICBxdWV1ZS5wdXNoID0gcHVzaFxuICBxdWV1ZS51bnNoaWZ0ID0gdW5zaGlmdFxuICBxdWV1ZS5kcmFpbmVkID0gZHJhaW5lZFxuXG4gIHJldHVybiBxdWV1ZVxuXG4gIGZ1bmN0aW9uIHB1c2ggKHZhbHVlKSB7XG4gICAgdmFyIHAgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBwdXNoQ2IodmFsdWUsIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlKHJlc3VsdClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vIExldCdzIGZvcmsgdGhlIHByb21pc2UgY2hhaW4gdG9cbiAgICAvLyBtYWtlIHRoZSBlcnJvciBidWJibGUgdXAgdG8gdGhlIHVzZXIgYnV0XG4gICAgLy8gbm90IGxlYWQgdG8gYSB1bmhhbmRsZWRSZWplY3Rpb25cbiAgICBwLmNhdGNoKG5vb3ApXG5cbiAgICByZXR1cm4gcFxuICB9XG5cbiAgZnVuY3Rpb24gdW5zaGlmdCAodmFsdWUpIHtcbiAgICB2YXIgcCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHVuc2hpZnRDYih2YWx1ZSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUocmVzdWx0KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8gTGV0J3MgZm9yayB0aGUgcHJvbWlzZSBjaGFpbiB0b1xuICAgIC8vIG1ha2UgdGhlIGVycm9yIGJ1YmJsZSB1cCB0byB0aGUgdXNlciBidXRcbiAgICAvLyBub3QgbGVhZCB0byBhIHVuaGFuZGxlZFJlamVjdGlvblxuICAgIHAuY2F0Y2gobm9vcClcblxuICAgIHJldHVybiBwXG4gIH1cblxuICBmdW5jdGlvbiBkcmFpbmVkICgpIHtcbiAgICB2YXIgcCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHF1ZXVlLmlkbGUoKSkge1xuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBwcmV2aW91c0RyYWluID0gcXVldWUuZHJhaW5cbiAgICAgICAgICBxdWV1ZS5kcmFpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJldmlvdXNEcmFpbiA9PT0gJ2Z1bmN0aW9uJykgcHJldmlvdXNEcmFpbigpXG4gICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgIHF1ZXVlLmRyYWluID0gcHJldmlvdXNEcmFpblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZhc3RxdWV1ZVxubW9kdWxlLmV4cG9ydHMucHJvbWlzZSA9IHF1ZXVlQXNQcm9taXNlZFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIHJldXNpZnkgKENvbnN0cnVjdG9yKSB7XG4gIHZhciBoZWFkID0gbmV3IENvbnN0cnVjdG9yKClcbiAgdmFyIHRhaWwgPSBoZWFkXG5cbiAgZnVuY3Rpb24gZ2V0ICgpIHtcbiAgICB2YXIgY3VycmVudCA9IGhlYWRcblxuICAgIGlmIChjdXJyZW50Lm5leHQpIHtcbiAgICAgIGhlYWQgPSBjdXJyZW50Lm5leHRcbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZCA9IG5ldyBDb25zdHJ1Y3RvcigpXG4gICAgICB0YWlsID0gaGVhZFxuICAgIH1cblxuICAgIGN1cnJlbnQubmV4dCA9IG51bGxcblxuICAgIHJldHVybiBjdXJyZW50XG4gIH1cblxuICBmdW5jdGlvbiByZWxlYXNlIChvYmopIHtcbiAgICB0YWlsLm5leHQgPSBvYmpcbiAgICB0YWlsID0gb2JqXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldDogZ2V0LFxuICAgIHJlbGVhc2U6IHJlbGVhc2VcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJldXNpZnlcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGRhdGFJZGVudGlmaWNhdGlvbl8xID0gcmVxdWlyZShcIi4vbG9jYWxDYWNoZS9kYXRhSWRlbnRpZmljYXRpb25cIik7XG5jb25zdCBkYXRhTW9uaXRvcl8xID0gcmVxdWlyZShcIi4vc2VydmljZXMvZGF0YU1vbml0b3JcIik7XG4vLyBUaGlzIGJhY2tncm91bmQgc2NyaXB0IGlzIG91ciBzaW5nbGUgZW50cnkgcG9pbnRcbmNvbnNvbGUubG9nKCdCYWNrZ3JvdW5kIHNjcmlwdCBpcyBsb2FkaW5nLi4uJyk7XG4vLyBDcmVhdGUgeW91ciBEYXRhSWRlbnRpZmllciBpbnN0YW5jZVxuY29uc3QgZGF0YUlkZW50aWZpZXIgPSBuZXcgZGF0YUlkZW50aWZpY2F0aW9uXzEuRGF0YUlkZW50aWZpZXIoKTtcbi8vIElmIHlvdSBoYXZlIG90aGVyIHJlZmVyZW5jZXMsIGUuZy4gTG9jYWxDYWNoZSwgZG8gc28gaGVyZSBhcyB3ZWxsXG4vLyBPcHRpb24gQTogVXNlIHRoZSBkYXRhTW9uaXRvciBhcHByb2FjaFxuKDAsIGRhdGFNb25pdG9yXzEubW9uaXRvckFQSVJlcXVlc3RzKSgpO1xuLy8gVGhpcyBzZXRzIHVwIGNocm9tZS53ZWJSZXF1ZXN0Lm9uQmVmb3JlUmVxdWVzdCArIG9uQ29tcGxldGVkIHRvIHN0b3JlIHJlcXVlc3QgZGF0YSBhbmQgaW5qZWN0IHRoZSBjb250ZW50IHNjcmlwdC5cbi8vIExpc3RlbiBmb3IgbWVzc2FnZXMgZnJvbSBjb250ZW50IHNjcmlwdHNcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBjb25zb2xlLmxvZygnQmFja2dyb3VuZCBnb3QgYSBtZXNzYWdlOicsIG1lc3NhZ2UpO1xuICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwiRkVUQ0hfUkVTUE9OU0VcIiB8fCBtZXNzYWdlLnR5cGUgPT09IFwiWEhSX1JFU1BPTlNFXCIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZWNlaXZlZCByZXNwb25zZSBkYXRhIGZyb20gY29udGVudCBzY3JpcHQ6XCIsIG1lc3NhZ2UpO1xuICAgICAgICAvLyBlLmcuIHN0b3JlIHRoZW0gaW4gZGF0YUlkZW50aWZpZXIgb3IgbG9jYWxDYWNoZVxuICAgIH1cbiAgICBzZW5kUmVzcG9uc2UoeyBzdGF0dXM6IFwib2tcIiB9KTtcbiAgICByZXR1cm4gdHJ1ZTsgLy8gS2VlcCB0aGUgbWVzc2FnZSBjaGFubmVsIG9wZW4gaWYgbmVlZGVkIGZvciBhc3luY1xufSk7XG5jb25zb2xlLmxvZygnQmFja2dyb3VuZCBzY3JpcHQgZmluaXNoZWQgbG9hZGluZy4nKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==