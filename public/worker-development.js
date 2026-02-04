/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./worker/index.ts":
/*!*************************!*\
  !*** ./worker/index.ts ***!
  \*************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/// <reference lib=\"webworker\" />\n// Обработчик push-уведомлений\nself.addEventListener('push', (event)=>{\n    if (!event.data) {\n        console.log('[SW] Push received but no data');\n        return;\n    }\n    try {\n        const payload = event.data.json();\n        const options = {\n            body: payload.body || 'Расписание было обновлено',\n            icon: payload.icon || '/favicon.png',\n            badge: payload.badge || '/favicon.png',\n            tag: payload.tag || 'schedule-update',\n            data: payload.data || {},\n            requireInteraction: false\n        };\n        event.waitUntil(self.registration.showNotification(payload.title || 'Расписание РГСУ', options));\n    } catch (error) {\n        console.error('[SW] Error processing push:', error);\n    }\n});\n// Обработчик клика по уведомлению\nself.addEventListener('notificationclick', (event)=>{\n    event.notification.close();\n    if (event.action === 'dismiss') {\n        return;\n    }\n    const urlToOpen = event.notification.data?.url || '/';\n    event.waitUntil(self.clients.matchAll({\n        type: 'window',\n        includeUncontrolled: true\n    }).then((clientList)=>{\n        for (const client of clientList){\n            if (client.url.includes(self.location.origin) && 'focus' in client) {\n                client.focus();\n                client.postMessage({\n                    type: 'SCHEDULE_UPDATE',\n                    data: event.notification.data\n                });\n                return;\n            }\n        }\n        if (self.clients.openWindow) {\n            return self.clients.openWindow(urlToOpen);\n        }\n    }));\n});\n// Обработчик закрытия уведомления\nself.addEventListener('notificationclose', (event)=>{\n    console.log('[SW] Notification closed:', event.notification.tag);\n});\n\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi93b3JrZXIvaW5kZXgudHMiLCJtYXBwaW5ncyI6IjtBQUFBLGlDQUFpQztBQUlqQyw4QkFBOEI7QUFDOUJBLEtBQUtDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQ0M7SUFDM0IsSUFBSSxDQUFDQSxNQUFNQyxJQUFJLEVBQUU7UUFDYkMsUUFBUUMsR0FBRyxDQUFDO1FBQ1o7SUFDSjtJQUVBLElBQUk7UUFDQSxNQUFNQyxVQUFVSixNQUFNQyxJQUFJLENBQUNJLElBQUk7UUFFL0IsTUFBTUMsVUFBK0I7WUFDakNDLE1BQU1ILFFBQVFHLElBQUksSUFBSTtZQUN0QkMsTUFBTUosUUFBUUksSUFBSSxJQUFJO1lBQ3RCQyxPQUFPTCxRQUFRSyxLQUFLLElBQUk7WUFDeEJDLEtBQUtOLFFBQVFNLEdBQUcsSUFBSTtZQUNwQlQsTUFBTUcsUUFBUUgsSUFBSSxJQUFJLENBQUM7WUFDdkJVLG9CQUFvQjtRQUN4QjtRQUVBWCxNQUFNWSxTQUFTLENBQ1hkLEtBQUtlLFlBQVksQ0FBQ0MsZ0JBQWdCLENBQzlCVixRQUFRVyxLQUFLLElBQUksbUJBQ2pCVDtJQUdaLEVBQUUsT0FBT1UsT0FBTztRQUNaZCxRQUFRYyxLQUFLLENBQUMsK0JBQStCQTtJQUNqRDtBQUNKO0FBRUEsa0NBQWtDO0FBQ2xDbEIsS0FBS0MsZ0JBQWdCLENBQUMscUJBQXFCLENBQUNDO0lBQ3hDQSxNQUFNaUIsWUFBWSxDQUFDQyxLQUFLO0lBRXhCLElBQUlsQixNQUFNbUIsTUFBTSxLQUFLLFdBQVc7UUFDNUI7SUFDSjtJQUVBLE1BQU1DLFlBQVlwQixNQUFNaUIsWUFBWSxDQUFDaEIsSUFBSSxFQUFFb0IsT0FBTztJQUVsRHJCLE1BQU1ZLFNBQVMsQ0FDWGQsS0FBS3dCLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDO1FBQUVDLE1BQU07UUFBVUMscUJBQXFCO0lBQUssR0FBR0MsSUFBSSxDQUFDLENBQUNDO1FBQ3ZFLEtBQUssTUFBTUMsVUFBVUQsV0FBWTtZQUM3QixJQUFJQyxPQUFPUCxHQUFHLENBQUNRLFFBQVEsQ0FBQy9CLEtBQUtnQyxRQUFRLENBQUNDLE1BQU0sS0FBSyxXQUFXSCxRQUFRO2dCQUMvREEsT0FBd0JJLEtBQUs7Z0JBQzlCSixPQUFPSyxXQUFXLENBQUM7b0JBQ2ZULE1BQU07b0JBQ052QixNQUFNRCxNQUFNaUIsWUFBWSxDQUFDaEIsSUFBSTtnQkFDakM7Z0JBQ0E7WUFDSjtRQUNKO1FBQ0EsSUFBSUgsS0FBS3dCLE9BQU8sQ0FBQ1ksVUFBVSxFQUFFO1lBQ3pCLE9BQU9wQyxLQUFLd0IsT0FBTyxDQUFDWSxVQUFVLENBQUNkO1FBQ25DO0lBQ0o7QUFFUjtBQUVBLGtDQUFrQztBQUNsQ3RCLEtBQUtDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDQztJQUN4Q0UsUUFBUUMsR0FBRyxDQUFDLDZCQUE2QkgsTUFBTWlCLFlBQVksQ0FBQ1AsR0FBRztBQUNuRTtBQUVXIiwic291cmNlcyI6WyJDOlxcaHRtbFxcX19SR1NVX19cXDA0LjAyLjI2XFxzaGVkdWxlXFx3b3JrZXJcXGluZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIGxpYj1cIndlYndvcmtlclwiIC8+XHJcblxyXG5kZWNsYXJlIGNvbnN0IHNlbGY6IFNlcnZpY2VXb3JrZXJHbG9iYWxTY29wZTtcclxuXHJcbi8vINCe0LHRgNCw0LHQvtGC0YfQuNC6IHB1c2gt0YPQstC10LTQvtC80LvQtdC90LjQuVxyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ3B1c2gnLCAoZXZlbnQpID0+IHtcclxuICAgIGlmICghZXZlbnQuZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdbU1ddIFB1c2ggcmVjZWl2ZWQgYnV0IG5vIGRhdGEnKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXlsb2FkID0gZXZlbnQuZGF0YS5qc29uKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE5vdGlmaWNhdGlvbk9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGJvZHk6IHBheWxvYWQuYm9keSB8fCAn0KDQsNGB0L/QuNGB0LDQvdC40LUg0LHRi9C70L4g0L7QsdC90L7QstC70LXQvdC+JyxcclxuICAgICAgICAgICAgaWNvbjogcGF5bG9hZC5pY29uIHx8ICcvZmF2aWNvbi5wbmcnLFxyXG4gICAgICAgICAgICBiYWRnZTogcGF5bG9hZC5iYWRnZSB8fCAnL2Zhdmljb24ucG5nJyxcclxuICAgICAgICAgICAgdGFnOiBwYXlsb2FkLnRhZyB8fCAnc2NoZWR1bGUtdXBkYXRlJyxcclxuICAgICAgICAgICAgZGF0YTogcGF5bG9hZC5kYXRhIHx8IHt9LFxyXG4gICAgICAgICAgICByZXF1aXJlSW50ZXJhY3Rpb246IGZhbHNlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGV2ZW50LndhaXRVbnRpbChcclxuICAgICAgICAgICAgc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbihcclxuICAgICAgICAgICAgICAgIHBheWxvYWQudGl0bGUgfHwgJ9Cg0LDRgdC/0LjRgdCw0L3QuNC1INCg0JPQodCjJyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTV10gRXJyb3IgcHJvY2Vzc2luZyBwdXNoOicsIGVycm9yKTtcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyDQntCx0YDQsNCx0L7RgtGH0LjQuiDQutC70LjQutCwINC/0L4g0YPQstC10LTQvtC80LvQtdC90LjRjlxyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ25vdGlmaWNhdGlvbmNsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICBldmVudC5ub3RpZmljYXRpb24uY2xvc2UoKTtcclxuXHJcbiAgICBpZiAoZXZlbnQuYWN0aW9uID09PSAnZGlzbWlzcycpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXJsVG9PcGVuID0gZXZlbnQubm90aWZpY2F0aW9uLmRhdGE/LnVybCB8fCAnLyc7XHJcblxyXG4gICAgZXZlbnQud2FpdFVudGlsKFxyXG4gICAgICAgIHNlbGYuY2xpZW50cy5tYXRjaEFsbCh7IHR5cGU6ICd3aW5kb3cnLCBpbmNsdWRlVW5jb250cm9sbGVkOiB0cnVlIH0pLnRoZW4oKGNsaWVudExpc3QpID0+IHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBjbGllbnQgb2YgY2xpZW50TGlzdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsaWVudC51cmwuaW5jbHVkZXMoc2VsZi5sb2NhdGlvbi5vcmlnaW4pICYmICdmb2N1cycgaW4gY2xpZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKGNsaWVudCBhcyBXaW5kb3dDbGllbnQpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50LnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1NDSEVEVUxFX1VQREFURScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGV2ZW50Lm5vdGlmaWNhdGlvbi5kYXRhLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoc2VsZi5jbGllbnRzLm9wZW5XaW5kb3cpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNsaWVudHMub3BlbldpbmRvdyh1cmxUb09wZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICk7XHJcbn0pO1xyXG5cclxuLy8g0J7QsdGA0LDQsdC+0YLRh9C40Log0LfQsNC60YDRi9GC0LjRjyDRg9Cy0LXQtNC+0LzQu9C10L3QuNGPXHJcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbm90aWZpY2F0aW9uY2xvc2UnLCAoZXZlbnQpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdbU1ddIE5vdGlmaWNhdGlvbiBjbG9zZWQ6JywgZXZlbnQubm90aWZpY2F0aW9uLnRhZyk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IHsgfTtcclxuIl0sIm5hbWVzIjpbInNlbGYiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJkYXRhIiwiY29uc29sZSIsImxvZyIsInBheWxvYWQiLCJqc29uIiwib3B0aW9ucyIsImJvZHkiLCJpY29uIiwiYmFkZ2UiLCJ0YWciLCJyZXF1aXJlSW50ZXJhY3Rpb24iLCJ3YWl0VW50aWwiLCJyZWdpc3RyYXRpb24iLCJzaG93Tm90aWZpY2F0aW9uIiwidGl0bGUiLCJlcnJvciIsIm5vdGlmaWNhdGlvbiIsImNsb3NlIiwiYWN0aW9uIiwidXJsVG9PcGVuIiwidXJsIiwiY2xpZW50cyIsIm1hdGNoQWxsIiwidHlwZSIsImluY2x1ZGVVbmNvbnRyb2xsZWQiLCJ0aGVuIiwiY2xpZW50TGlzdCIsImNsaWVudCIsImluY2x1ZGVzIiwibG9jYXRpb24iLCJvcmlnaW4iLCJmb2N1cyIsInBvc3RNZXNzYWdlIiwib3BlbldpbmRvdyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./worker/index.ts\n"));

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
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				if (!originalFactory) {
/******/ 					document.location.reload();
/******/ 					return;
/******/ 				}
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./worker/index.ts");
/******/ 	
/******/ })()
;