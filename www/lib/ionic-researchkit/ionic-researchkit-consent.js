/** 
* Author: Nino Guba
* Date: 08-26-2015
* Consent Directives for ResearchKit in Ionic
*
* Adapted from the following:
* ion-slide-box (https://github.com/driftyco/ionic)
* ion-wizard (https://github.com/arielfaur/ionic-wizard)
*/
angular.module('ionicResearchKitConsent',[])
//======================================================================================
// This provides a counterpart of Apple's ResearchKit for Ionic apps
// =====================================================================================


//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkConsentTasks', [
    '$rootScope',
    '$timeout',
    '$compile',
    '$ionicSlideBoxDelegate',
    '$ionicHistory',
    '$ionicScrollDelegate',
    '$ionicNavBarDelegate',
    '$ionicActionSheet',
    'irkResults',
    function($rootScope, $timeout, $compile, $ionicSlideBoxDelegate, $ionicHistory, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicActionSheet, irkResults) {
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
                    $scope.doSave();

                    if (slider.currentIndex() < slider.slidesCount()-1)
                        slider.next();
                    else
                        $scope.doEnd();
                }

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
                            $scope.doSave();
                            $scope.doEnd();
                            return true;
                        }
                    });
                };

                $scope.doEnd = function() {
                    $scope.$parent.closeModal();
                }

                $scope.$on("step:Previous", function() {
                    slider.prev();
                });
                
                $scope.$on("step:Next", function() {
                    $scope.doNext();
                });

                //This is called when input changes (faster than form.$dirty)
                $scope.dirty = function() {
                    $scope.isPristine = false;
                };

                //This is to initialize what will hold the results
                $scope.formData = {};
                irkResults.initResults();

                //This is called to capture the results
                $scope.doSave = function() {
                    //irkResults.addResult(slider.currentIndex(), $scope.formData);
                }; 

                $scope.$on("slideBox.slideChanged", function(e, index) {
                    $scope.doSave();
                });

            }],

            template:
                '<div class="slider irk-slider">'+
                '<div class="slider-slides irk-slider-slides" ng-transclude>'+
                '</div>'+
                '<ion-footer-bar class="irk-bottom-bar irk-bottom-bar-consent">'+
                '<button class="button button-block button-outline button-positive irk-bottom-button" ng-click="doStepNext()" irk-consent-next>Next</button>'+
                '</ion-footer-bar>'+
                '</div>',

            link: function(scope, element, attrs, controller) {
                //Insert Header
                var stepHeader = angular.element(
                    '<ion-header-bar>'+
                    '<div class="buttons">'+
                    '<button class="button button-clear button-positive icon ion-ios-arrow-left" ng-click="doStepBack()" irk-consent-previous></button>'+
                    '</div>'+
                    '<h1 class="title"></h1>'+
                    '<div class="buttons">'+
                    '<button class="button button-clear button-positive" ng-click="doCancel()">Cancel</button>'+
                    '</div>'+
                    '</ion-header-bar>'
                    );
                element.parent()[0].insertBefore(stepHeader[0], element[0]);
                $compile(stepHeader)(scope);
            }
        };
}])

.directive('irkConsentTask', function() {
    return {
        restrict: 'E',
        require: '^irkConsentTasks',
        link: function(scope, element, attrs, controller) {
            element.addClass('slider-slide irk-slider-slide');
        }
    };
})

.directive('irkConsentPrevious', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index) {
                element.toggleClass('ng-hide', index == 0);
            });
        }
    }
})

.directive('irkConsentNext', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                if (index == count - 1)
                    element.text("Done");
                else
                    element.text("Next");

                //Hide for instruction step
                var step = angular.element(document.querySelectorAll('irk-consent-task.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', stepType=='IRK-VISUAL-CONSENT-STEP' && consentType=='overview');
            });
        }
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkVisualConsentStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            var consentType = attr.type;
            var consentTitle = '';
            var consentText = '';
            var consentImageClass = '';

            switch (consentType) {
                case 'overview':
                    consentTitle = 'Welcome';
                    consentText = 'Learn more about the study first';
                    consentImageClass = 'irk-consent-none';
                    break;
                case 'data-gathering':
                    consentTitle = 'Data Gathering';
                    consentText = 'Learn more about how data is gathered';
                    consentImageClass = 'irk-consent-01';
                    break;
                case 'privacy':
                    consentTitle = 'Privacy';
                    consentText = 'Learn more about how your privacy and identity are protected';
                    consentImageClass = 'irk-consent-02';
                    break;
                case 'data-use':
                    consentTitle = 'Data Use';
                    consentText = 'Learn more about how data is used';
                    consentImageClass = 'irk-consent-03';
                    break;
                case 'time-commitment':
                    consentTitle = 'Time Commitment';
                    consentText = 'Learn more about the study\'s impact on your time';
                    consentImageClass = 'irk-consent-04';
                    break;
                case 'study-survey':
                    consentTitle = 'Study Survey';
                    consentText = 'Learn more about the study survey';
                    consentImageClass = 'irk-consent-05';
                    break;
                case 'study-tasks':
                    consentTitle = 'Study Tasks';
                    consentText = 'Learn more about the tasks involved';
                    consentImageClass = 'irk-consent-06';
                    break;
                case 'withdrawing':
                    consentTitle = 'Withdrawing';
                    consentText = 'Learn more about withdrawing';
                    consentImageClass = 'irk-consent-07';
                    break;
                case 'custom':
                    consentTitle = attr.title;
                    consentText = attr.text;
                    consentImageClass = 'irk-consent-custom';
                    break;
            }

            return 	'<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                '<div class="item irk-consent-image '+consentImageClass+' positive"></div>'+
                '<h2>'+consentTitle+'</h2>'+
                '<p>'+attr.summary+'</p>'+
                '<a class="button button-clear button-positive irk-learn-more">'+consentText+'</a>'+
                '<br><br>'+
                (consentType=='overview'?'<button class="button button-outline button-positive irk-instruction-button" ng-click="$parent.doNext()">Get Started</button>':'')+
                '</div></div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }        
    }
})

