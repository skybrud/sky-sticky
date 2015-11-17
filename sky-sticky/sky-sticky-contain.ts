(function() {
	"use strict";

	angular.module('skySticky').directive('skyStickyContain', skyStickyContainDirective);

	function skyStickyContainDirective() {
		var directive = {
			restrict:'AE',
			controller:controller
		};

		controller.$inject = ['$element', 'skyVisible'];

		function controller($element, skySticky) {
			var _this = this;

			this.dimensions = {};

			skySticky.bind($element, binding);

			// Make sure binding happens only once
			function binding(values, dimensions) {
				_this.dimensions = dimensions;
				skySticky.unbind($element, binding);
			}
		}

		return directive;
	}

})();
