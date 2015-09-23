/** 
* Author: Nino Guba
* Date: 08-26-2015
* Directives for ResearsetchKit in Ionic
*
* Adapted from the following:
* ion-slide-box (https://github.com/driftyco/ionic)
* ion-wizard (https://github.com/arielfaur/ionic-wizard)
*
*/
angular.module('ionicResearchKit',[])
//======================================================================================
// This provides a counterpart of Apple's ResearchKit for Ionic apps
// =====================================================================================

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkOrderedTasks', [
    '$rootScope',
    '$timeout',
    '$compile',
    '$ionicSlideBoxDelegate',
    '$ionicHistory',
    '$ionicScrollDelegate',
    '$ionicNavBarDelegate',
    '$ionicActionSheet',
    function($rootScope, $timeout, $compile, $ionicSlideBoxDelegate, $ionicHistory, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicActionSheet) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                autoPlay: '=',
                doesContinue: '@',
                slideInterval: '@',
                showPager: '@',
                pagerClick: '&',
                disableScroll: '@',
                onSlideChanged: '&',
                activeSlide: '=?'
            },
            controller: ['$scope', '$rootScope', '$element', '$attrs', function($scope, $rootScope, $element, $attrs) {
                var _this = this;

                var slider = new ionic.views.Slider({
                    el: $element[0],
                    auto: false,
                    continuous: false,
                    startSlide: $scope.activeSlide,
                    slidesChanged: function() {
                        $scope.currentSlide = slider.currentIndex();

                        // Force a slideChanged event on init
                        $scope.$parent.$broadcast('slideBox.slideChanged', slider.currentIndex(), slider.slidesCount());

                        // Try to trigger a digest
                        $timeout(function() {});
                    },
                    callback: function(slideIndex) {
                        $scope.currentSlide = slideIndex;
                        $scope.onSlideChanged({ index: $scope.currentSlide, $index: $scope.currentSlide});
                        $scope.$parent.$broadcast('slideBox.slideChanged', slideIndex, slider.slidesCount());
                        $scope.activeSlide = slideIndex;

                        // Try to trigger a digest
                        $timeout(function() {});
                    }
                });

                slider.enableSlide(false);

                $scope.$watch('activeSlide', function(nv) {
                    if (angular.isDefined(nv)) {
                        slider.slide(nv);
                    }
                });

                $scope.$on('slideBox.setSlide', function(e, index) {
                    slider.slide(index);
                });

                //Exposed for testing
                this.__slider = slider;

                var deregisterInstance = $ionicSlideBoxDelegate._registerInstance(
                    slider, $attrs.delegateHandle, function() {
                        return $ionicHistory.isActiveScope($scope);
                    }
                );
                
                $scope.$on('$destroy', function() {
                    deregisterInstance();
                    slider.kill();
                });

                this.slidesCount = function() {
                    return slider.slidesCount();
                };

                $timeout(function() {
                    slider.load();
                });

                $scope.doCancel = function() {
                    console.log('Clicked cancel');

                    // Show the action sheet
                    var hideSheet = $ionicActionSheet.show({
                        destructiveText: 'End Task',
                        cancelText: 'Cancel',
                        cancel: function() {
                            hideSheet();
                        },
                        destructiveButtonClicked: function(index) {
                            console.log('Clicked end task');
                            $scope.$parent.closeModal();
                            return true;
                        }
                    });
                };

                $scope.doStepBack = function() {
                    console.log('Clicked back');
                    slider.prev();
                };

                $scope.doStepNext = function() {
                    console.log('Clicked next');
                    $scope.doNext();
                };

                $scope.doSkip = function() {
                    console.log('Clicked skip');
                    $scope.doNext();
                };

                $scope.doNext = function() {
                    if (slider.currentIndex() < slider.slidesCount()-1)
                        slider.next();
                    else
                        $scope.$parent.closeModal();
                }

                var conditions = [];

                this.addCondition = function(condition) {
                    conditions.push(condition);
                };

                this.getCondition = function(index) {
                    return conditions[index];
                };

                this.checkNextCondition = function(index) {
                    return index > (conditions.length - 1)
                        ? false
                        : conditions[index].next();
                };

                this.checkPreviousCondition = function(index) {
                    return index > (conditions.length - 1)
                        ? false
                        : conditions[index].prev();
                };

                this.checkSkipCondition = function(index) {
                    return index > (conditions.length - 1)
                        ? false
                        : conditions[index].skip();
                };

                $scope.$on("step:Previous", function() {
                    //$ionicSlideBoxDelegate.previous();
                });
                
                $scope.$on("step:Next", function() {
                    $scope.doNext();
                });
            }],

            template:
                '<div class="slider irk-slider">'+
                '<div class="slider-slides irk-slider-slides" ng-transclude>'+
                '</div>'+
                '<ion-footer-bar class="bar-subfooter irk-bottom-bar">'+
                '<button class="button button-block button-outline button-positive irk-bottom-button" ng-click="doStepNext()" irk-step-next>Next</button>'+
                '</ion-footer-bar>'+
                '<ion-footer-bar class="irk-bottom-bar">'+
                '<button class="button button-block button-clear button-positive irk-bottom-button" ng-click="doSkip()" irk-step-skip>Skip this question</button>'+
                '</ion-footer-bar>'+
                '</div>',

            link: function(scope, element, attrs, controller) {
                //Insert Header
                var stepHeader = angular.element(
                    '<ion-header-bar>'+
                    '<div class="buttons">'+
                    '<button class="button button-clear button-positive icon ion-ios-arrow-left" ng-click="doStepBack()" irk-step-previous></button>'+
                    '</div>'+
                    '<h1 class="title" irk-step-title></h1>'+
                    '<div class="buttons">'+
                    '<button class="button button-clear button-positive" ng-click="doCancel()">Cancel</button>'+
                    '</div>'+
                    '</ion-header-bar>'
                    );
                element.parent()[0].insertBefore(stepHeader[0], element[0]);
                $compile(stepHeader)(scope);

                var currentIndex = 0;

                // Watch the current index's condition for changes and broadcast the new condition state on change
                scope.$watch(function() {
                    return controller.checkNextCondition(currentIndex);
                }, function() {
                    $rootScope.$broadcast("step:NextCondition", controller.checkNextCondition(currentIndex));
                });
                scope.$watch(function() {
                    return controller.checkSkipCondition(currentIndex);
                }, function() {
                    $rootScope.$broadcast("step:SkipCondition", controller.checkSkipCondition(currentIndex));
                });
                /*
                scope.$watch(function() {
                    return controller.checkPreviousCondition(currentIndex);
                }, function() {
                    $rootScope.$broadcast("step:PreviousCondition", controller.checkPreviousCondition(currentIndex));
                });
                */

                scope.$on("slideBox.slideChanged", function(e, index) {
                    currentIndex = index;
                });
            }
        };
}])

.directive('irkTask', function() {
    return {
        restrict: 'E',
        require: '^irkOrderedTasks',
        scope: {},
        link: function(scope, element, attrs, controller) {
            element.addClass('slider-slide irk-slider-slide');

            // Only enable next when input is dirty
            var nextFn = function() {
                return element.find('form').length == 0 || (element.find('form').length != 0 && element.find('form').hasClass('ng-dirty'));
            };

            // Only show skip when input is not required
            var skipFn = function() {
                return element.find('form').length == 0 || (element.find('form').length != 0 && element.find('form').hasClass('ng-invalid-required'));
            };

            // Going back is always allowed
            var prevFn = function() {
                return true;
            };

            var conditions = {
                next: nextFn,
                skip: skipFn,
                prev: prevFn
            };

            controller.addCondition(conditions);
        }
    };
})

.directive('irkStepTitle', ['$rootScope', '$ionicSlideBoxDelegate', function($rootScope, $ionicSlideBoxDelegate) {
    return{
        restrict: 'EA',
        scope: {},
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                element.text('Step ' + (index+1) + ' of ' + count);
            });
        }
    }
}])

.directive('irkStepPrevious', ['$rootScope', function($rootScope) {
    return{
        restrict: 'EA',
        scope: {},
        link: function(scope, element, attrs, controller) {
            element.on('click', function() {
                //$rootScope.$broadcast("step:Previous");
            });

            scope.$on("slideBox.slideChanged", function(e, index) {
                element.toggleClass('ng-hide', index == 0);
            });

            scope.$on("step:PreviousCondition", function(e, condition) {
                element.attr("disabled", !condition);
            });
        }
    }
}])

.directive('irkStepNext', ['$rootScope', function($rootScope) {
    return{
        restrict: 'EA',
        scope: {},
        link: function(scope, element, attrs, controller) {
            element.on('click', function() {
                //$rootScope.$broadcast("step:Next");
            });

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                if (index == count - 1)
                    element.text("Done");
                else
                    element.text("Next");
            });

            scope.$on("step:NextCondition", function(e, condition) {
                element.attr("disabled", !condition); 
            });
        }
    }
}])

.directive('irkStepSkip', ['$rootScope', function($rootScope) {
    return{
        restrict: 'EA',
        scope: {},
        link: function(scope, element, attrs, controller) {
            element.on('click', function() {
                //$rootScope.$broadcast("step:Skip");
            });

            scope.$on("step:SkipCondition", function(e, condition) {
                element.toggleClass('ng-hide', !condition);
            });
        }
    }
}])

//======================================================================================
// Usage: <irk-instruction-step title="Your title here." text="Additional text can go here." />
// =====================================================================================
.directive('irkInstructionStep', ['$rootScope', function($rootScope) {
    return {
        restrict: 'E',
        require: '^irkTask',
        scope: {},
        controller: ['$scope', '$rootScope', '$element', '$attrs', function($scope, $rootScope, $element, $attrs) {
            $scope.doStart = function() {
                $rootScope.$broadcast("step:Next");
            }
        }],
        template: function(elem, attr) {
            return 	'<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                (attr.link ? '<a class="button button-clear button-positive" href="'+attr.link+'" target="_system">'+(attr.linkText ? attr.linkText : 'Learn more')+'</a>' : '')+
                '<br><br>'+
                '<button class="button button-outline button-positive" ng-click="doStart()">'+(attr.buttonText ? attr.buttonText : 'Get Started')+'</button>'+
                '</div></div>'
        }
    }
}])

//======================================================================================
// Usage: <irk-scale-question-step id="q1" title="Your question here." text="Additional text can go here." min="1" max="10" step="1" value="5" />
// =====================================================================================
.directive('irkScaleQuestionStep', function() {
    return {
        restrict: 'E',
        require: '^irkTask',
        template: function(elem, attr) {
            return 	'<form name="form.'+attr.id+'" class="irk-slider"'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                ''+
                '<h4>{{'+attr.id+' || \'&nbsp;\'}}</h4>'+
                '<div class="range">'+
                attr.min+
                '<input type="range" name="'+attr.id+'" min="'+attr.min+'" max="'+attr.max+'" step="'+attr.step+'" value="'+attr.value+'" ng-model="'+attr.id+'" ng-required="{{!'+attr.optional+'}}">'+
                attr.max+
                '</div>'+
                '</div></div>'+
                '</form>'
        }
    }
})

//======================================================================================
// Usage: <irk-boolean-question-step id="data.q1" title="Your question here." text="Additional text can go here." trueValue="" falseValue=""/>
// =====================================================================================
.directive('irkBooleanQuestionStep', function() {
    return {
        restrict: 'E',
        require: '^irkTask',
        template: function(elem, attr) {
            return 	'<form name="form.'+attr.id+'" class="irk-slider"'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                '<div class="list">'+
                '<label class="item item-radio">'+
                '<input type="radio" name="'+attr.id+'" value="'+(attr.trueValue?attr.trueValue:'True')+'" ng-model="'+attr.id+'">'+
                '<div class="item-content irk-item-content">'+(attr.trueValue?attr.trueValue:'True')+'</div>'+
                '<i class="radio-icon ion-checkmark"></i>'+
                '</label>'+
                '<label class="item item-radio">'+
                '<input type="radio" name="'+attr.id+'" value="'+(attr.falseValue?attr.falseValue:'False')+'" ng-model="'+attr.id+'">'+
                '<div class="item-content irk-item-content">'+(attr.falseValue?attr.falseValue:'False')+'</div>'+
                '<i class="radio-icon ion-checkmark"></i>'+
                '</label>'+
                '</div>'+
                '</div></div>'+
                '</form>'
        }
    }
})

.directive('irkQuestionStep', function() {
    return {
        restrict: 'E',
        require: '^irkTask',
        template: function(elem, attr) {
            return 	'<form name="form.'+attr.id+'" class="irk-slider"'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                '<div class="range">'+
                attr.min+
                '<input type="range" name="'+attr.id+'" min="'+attr.min+'" max="'+attr.max+'" step="'+attr.step+'" value="'+attr.value+'" ng-model="'+attr.id+'">'+
                attr.max+
                '</div>'+
                '</div></div>'+
                '</form>'
        }
    }
})
