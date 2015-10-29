(function () {
    "use strict";
    angular.module('skySticky', ['skyVisible']);
})();
(function () {
    "use strict";
    angular.module('skySticky').directive('skySticky', skyStickyDirective);
    skyStickyDirective.$inject = ['skyVisible', 'skySticky'];
    function skyStickyDirective(skyVisible, skySticky) {
        return {
            restrict: 'A',
            transclude: true,
            template: '<div ng-transclude></div>',
            link: link
        };
        function link(scope, element) {
            var _element = element[0];
            var _content = _element.children[0];
            var _ghost = document.createElement('div');
            var sticky = false;
            var styles;
            _ghost.classList.add('ghost');
            element.after(_ghost);
            skyVisible.bind(_element, { recalculate: calculate, cache: false }, function (values, dimensions, scroll) {
                var offset = skySticky.getOffset(_element);
                if (dimensions.top - offset <= scroll.y) {
                    if (!sticky) {
                        sticky = true;
                        skySticky.setOffset(_element, dimensions.height);
                        element.addClass('stick');
                        // Define ghost dimensions
                        TweenLite.set(_ghost, {
                            width: dimensions.width,
                            height: dimensions.height,
                            margin: styles.margin,
                        });
                    }
                    // Set properties - prevent them from being recalculated
                    TweenLite.set([_content, _element], {
                        top: offset,
                        left: dimensions.left,
                        width: dimensions.width,
                        height: dimensions.height,
                    });
                }
                else if (dimensions.top + dimensions.height >= scroll.y) {
                    if (sticky) {
                        sticky = false;
                        skySticky.setOffset(_element, 0);
                        element.removeClass('stick');
                        TweenLite.set([_content, element], { clearProps: 'all' });
                    }
                }
            });
            function calculate() {
                sticky = false;
                element.removeClass('stick');
                TweenLite.set([element[0], _ghost, _content], { clearProps: 'all' });
                styles = window.getComputedStyle(_element);
            }
        }
    }
})();
(function () {
    "use strict";
    angular.module('skySticky').service('skySticky', skyStickyService);
    skyStickyService.$inject = ['skyVisible'];
    function skyStickyService(skyVisible) {
        var _this = this;
        var offsets = [];
        this.removeOffset = function (element) {
            var node = element.length ? element[0] : element;
            for (var i = 0; i < offsets.length; i++) {
                if (offsets[i].node == node) {
                    offsets.splice(i, 1);
                    break;
                }
            }
        };
        this.setOffset = function (element, value) {
            var node = element.length ? element[0] : element;
            var found = false;
            offsets.forEach(function (offset) {
                if (offset.node == node) {
                    offset.offset = value || 0;
                    found = true;
                }
                else {
                    skyVisible.checkViews(offset.node, false);
                }
            });
            if (!found) {
                addElement(element, value);
            }
        };
        this.getOffset = function (element) {
            var node = !element ? false : element.length ? element[0] : element;
            var value = 0;
            for (var i = 0; i < offsets.length; i++) {
                if (node && node == offsets[i].node) {
                    break;
                }
                value += offsets[i].offset;
            }
            return value;
        };
        function addElement(element, value) {
            offsets.push({ node: element, offset: value });
            angular.element(element).on('$destroy', _this.removeOffset.bind(undefined, element));
        }
    }
})();
(function () {
    "use strict";
    angular.module('skySticky').directive('skyStickyReveal', skyStickyRevealDirective);
    skyStickyRevealDirective.$inject = ['skySticky', 'skyVisible'];
    function skyStickyRevealDirective(skySticky, skyVisible) {
        return {
            restrict: 'A',
            link: link
        };
        function link(scope, element) {
            var _element = element[0];
            var scrollY = window.pageYOffset;
            var percentage = 0;
            var dryrun = true;
            var preferences = {
                recalculate: calculate,
                shouldUpdate: shouldUpdate,
                cache: false,
                foldOffset: false,
                bottomOffset: false
            };
            skyVisible.bind(_element, preferences, function (values, dimensions, scroll) {
                var top = scroll.y <= 0 ? 0 : (dimensions.height * percentage) + (scroll.y - scrollY);
                var offset = Math.min(Math.max(top, 0), dimensions.height);
                dryrun = false;
                percentage = offset / dimensions.height;
                scrollY = scroll.y;
                skySticky.setOffset(_element, dimensions.height - offset);
                TweenLite.set(element, { y: -offset });
            });
            function shouldUpdate(dimensions, scroll) {
                if ((scrollY == scroll.y || !dimensions.height) && !dryrun) {
                    return false;
                }
                else if (percentage >= 1 && scroll.deltaY > 0) {
                    return false;
                }
                else if (percentage <= 0 && scroll.deltaY < 0) {
                    return false;
                }
                return true;
            }
            function calculate() {
                dryrun = true;
                if (!this.offsetHeight) {
                    skySticky.setOffset(_element, 0);
                }
            }
        }
    }
})();
