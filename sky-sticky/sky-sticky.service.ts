(function() {
	"use strict";

	angular.module('skySticky').service('skySticky', skyStickyService);

	skyStickyService.$inject = ['skyVisible'];

	function skyStickyService(skyVisible) {
		var _this = this;

		var offsets = [];

		this.removeOffset = (element) => {
			var node = element.length ? element[0] : element;

			for(var i = 0; i < offsets.length; i++) {
				if(offsets[i].node == node) {
					offsets.splice(i,1);
					break;
				}
			}
		};

		this.setOffset = (element, value) => {
			var node = element.length ? element[0] : element;
			var found = false;

			offsets.forEach((offset) => {
				if(offset.node == node) {
					offset.offset = value || 0;
					found = true;

				} else {
					skyVisible.checkViews(offset.node, false);
				}
			});

			if(!found) {
				addElement(element, value);
			}
		};

		this.getOffset = (element?) => {
			var node = !element ? false : element.length ? element[0] : element;
			var value = 0;

			for(var i = 0; i < offsets.length; i++) {
				if(node && node == offsets[i].node) {
					break;
				}

				value += offsets[i].offset;
			}

			return value;
		};

		function addElement(element, value) {
			offsets.push({node:element, offset:value});
			angular.element(element).on('$destroy', _this.removeOffset.bind(undefined, element));
		}
	}
})();
