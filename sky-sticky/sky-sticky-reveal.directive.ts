(function() {
	"use strict";

	angular.module('skySticky').directive('skyStickyReveal', skyStickyRevealDirective);

	skyStickyRevealDirective.$inject = ['skySticky', 'skyVisible'];

	function skyStickyRevealDirective(skySticky, skyVisible) {
		return {
			restrict:'A',
			link:link
		};

		function link(scope, element) {
			var _element = element[0];
			var scrollY = window.pageYOffset;
			var percentage = 0;
			var dryrun = true;

			var preferences = {
				recalculate:calculate,
				shouldUpdate:shouldUpdate,
				cache:false,
				foldOffset:false,
				bottomOffset:false
			}

			skyVisible.bind(_element, preferences, (values, dimensions, scroll) => {
				var top = scroll.y <= 0 ? 0 : (dimensions.height * percentage) + (scroll.y - scrollY);
				var offset = Math.min(Math.max(top, 0), dimensions.height);

				dryrun = false;

				percentage = offset / dimensions.height;

				scrollY = scroll.y;
				skySticky.setOffset(_element, dimensions.height - offset);
				TweenLite.set(element, {y:-offset});
			});

			function shouldUpdate(dimensions, scroll) {
				if((scrollY == scroll.y || !dimensions.height) && !dryrun) {
					return false;
				} else if(percentage >= 1 && scroll.deltaY > 0) {
					return false;
				} else if(percentage <= 0 && scroll.deltaY < 0) {
					return false;
				}

				return true;
			}

			function calculate() {
				dryrun = true;

				if(!this.offsetHeight) {
					skySticky.setOffset(_element, 0);
				}
			}
		}
	}
})();
