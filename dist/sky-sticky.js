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
            require: '?^skyStickyContain',
            template: '<div ng-transclude></div>',
            link: link
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
            skyVisible.bind(_element, { recalculate: calculate, cache: false }, function (values, dimensions, scroll) {
                var offset = skySticky.getOffset(_element);
                var diff = 0;
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
                    if (containCtrl) {
                        if (containCtrl.dimensions.height + containCtrl.dimensions.top < offset + dimensions.height + scroll.y) {
                            diff = Math.max(dimensions.height + (containCtrl.dimensions.height + containCtrl.dimensions.top) - (offset + dimensions.height + scroll.y), 0);
                            skySticky.setOffset(_element, diff);
                            element.addClass('contain');
                            element.removeClass('stick');
                        }
                        else {
                            element.removeClass('contain');
                            element.addClass('stick');
                        }
                    }
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
                TweenLite.set([_element, _ghost, _content], { clearProps: 'all' });
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
        var debounce;
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
            });
            if (!found) {
                addElement(element, value);
            }
            clearTimeout(debounce);
            debounce = setTimeout(function () {
                for (var i = 0; i < offsets.length; i++) {
                    if (element == offsets[i].node) {
                        break;
                    }
                    skyVisible.checkViews(offsets[i].node, false);
                }
            });
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
