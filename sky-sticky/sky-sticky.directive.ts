(function() {
	"use strict";

	angular.module('skySticky').directive('skySticky', skyStickyDirective);

	skyStickyDirective.$inject = ['skyVisible', 'skySticky'];

	function skyStickyDirective(skyVisible, skySticky) {
		return {
			restrict:'A',
			transclude:true,
			require:'?^skyStickyContain',
			template:'<div ng-transclude></div>',
			link:link
		};

		function link(scope, element, attrs, skyStickyContain) {
			var _element = element[0];
			var _content = _element.children[0];
			var _ghost = document.createElement('div');
			var sticky = false;
			var styles;

			var containCtrl = skyStickyContain ? skyStickyContain : null;

			_ghost.classList.add('ghost');
			element.after(_ghost);

			skyVisible.bind(_element, {recalculate:calculate, cache:false}, (values, dimensions, scroll) => {
				var offset = skySticky.getOffset(_element);
				var diff = 0;

				if(dimensions.top - offset <= scroll.y) {
					if(!sticky) {
						sticky = true;
						skySticky.setOffset(_element, dimensions.height);
						element.addClass('stick');

						// Define ghost dimensions
						TweenLite.set(_ghost, {
							width:dimensions.width,
							height:dimensions.height,
							margin:styles.margin,
						});
					}

					// Set properties - prevent them from being recalculated
					TweenLite.set([_content, _element], {
						top:offset,
						left:dimensions.left,
						width:dimensions.width,
						height:dimensions.height,
					});

					if(containCtrl) {
						if(containCtrl.dimensions.height + containCtrl.dimensions.top < offset + dimensions.height + scroll.y) {
							diff = Math.max(dimensions.height + (containCtrl.dimensions.height + containCtrl.dimensions.top) - (offset + dimensions.height + scroll.y), 0);
							skySticky.setOffset(_element, diff);

							element.addClass('contain');
							element.removeClass('stick');
						} else {
							element.removeClass('contain');
							element.addClass('stick');
						}
					}

				} else if(dimensions.top + dimensions.height >= scroll.y) {
					if(sticky) {
						sticky = false;
						skySticky.setOffset(_element, 0);
						element.removeClass('stick');
						TweenLite.set([_content, element],  {clearProps:'all'});
					}
				}
			});

			function calculate() {
				sticky = false;
				element.removeClass('stick');
				TweenLite.set([_element, _ghost, _content], {clearProps:'all'});

				styles = window.getComputedStyle(_element);
			}
		}
	}

})();
