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
    '$ionicModal',
    '$ionicPopup',
    'irkResults',
    function($rootScope, $timeout, $compile, $ionicSlideBoxDelegate, $ionicHistory, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicActionSheet, $ionicModal, $ionicPopup, irkResults) {
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

                $scope.showLearnMore = function() {
                    var index = $scope.currentSlide;
                    var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-learn-more-content'));
                    var stepContent = step.html();

                    $scope.learnmore = $ionicModal.fromTemplate(
                        '<ion-modal-view class="irk-modal">'+
                        '<ion-header-bar>'+
                        '<h1 class="title">Learn More</h1>'+
                        '<div class="buttons">'+
                        '<button class="button button-clear button-positive" ng-click="hideLearnMore()">Done</button>'+
                        '</div>'+
                        '</ion-header-bar>'+
                        '<ion-content class="padding">'+
                        stepContent+
                        '</ion-content>'+
                        '</ion-modal-view>'
                    ,{
                        scope: $scope,
                        animation: 'slide-in-up'
                    });
                    $scope.learnmore.show();
                };

                $scope.hideLearnMore = function() {
                    $scope.learnmore.remove();
                };

                $scope.doShare = function(id,choice) {
                    $scope.formData[id] = choice;
                    $scope.doNext();
                };

                $scope.doAgree = function() {
                    var index = $scope.currentSlide;
                    var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                    var stepReason = step.attr('reason-for-consent');

                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Review',
                        template: stepReason,
                        cssClass: 'irk-text-centered irk-popup',
                        cancelText: 'Cancel',
                        cancelType: 'button-outline button-positive',
                        okText: 'Agree',
                        okType: 'button-outline button-positive'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            console.log('Clicked agree');
                            $scope.formData.consent = true;
                            $scope.doNext();
                        } else {
                            console.log('Click cancel');
                        }
                    });
                };

                $scope.doDisagree = function() {
                    console.log('Clicked disagree');
                    $scope.formData.consent = false;
                    $scope.doSave();
                    $scope.doEnd();                    
                };

                $scope.doNext = function() {
                    $scope.doSave();

                    if (slider.currentIndex() < slider.slidesCount()-1)
                        slider.next();
                    else
                        $scope.doEnd();
                };

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
                };

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
                    irkResults.addResult(slider.currentIndex(), $scope.formData);
                }; 

                //This is called to reanimate GIF images
                $scope.previousIndex = 0;
                $scope.doReanimateConsentImage = function() {
                    var index = slider.currentIndex();

                    if ($scope.previousIndex <= index) {
                        var consent = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                        var consentType = consent.attr('type');
                        var consentImageClass = '';

                        switch (consentType) {
                            case 'data-gathering':
                                consentImageClass = 'consent_01.gif';
                                break;
                            case 'privacy':
                                consentImageClass = 'consent_02.gif';
                                break;
                            case 'data-use':
                                consentImageClass = 'consent_03.gif';
                                break;
                            case 'time-commitment':
                                consentImageClass = 'consent_04.gif';
                                break;
                            case 'study-survey':
                                consentImageClass = 'consent_05.gif';
                                break;
                            case 'study-tasks':
                                consentImageClass = 'consent_06.gif';
                                break;
                            case 'withdrawing':
                                consentImageClass = 'consent_07.gif';
                                break;
                        }

                        if (consentImageClass != '')
                        {
                            var image = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-consent-image'));
                            image.css('background-image', 'url(lib/ionic-researchkit/resources/'+consentImageClass+'?x='+Math.random()+')');
                        }
                    }

                    $scope.previousIndex = index;
                }; 

                $scope.$on("slideBox.slideChanged", function(e, index) {
                    $scope.doSave();
                    $scope.doReanimateConsentImage();
                });
            }],

            template:
                '<div class="slider irk-slider">'+
                '<div class="slider-slides irk-slider-slides" ng-transclude>'+
                '</div>'+
                '<ion-footer-bar class="irk-bottom-bar irk-bottom-bar-consent">'+
                '<button class="button button-block button-outline button-positive irk-bottom-button" ng-click="doStepNext()" ng-disabled="isPristine" irk-consent-next>Next</button>'+
                '</ion-footer-bar>'+
                '<ion-footer-bar class="irk-bottom-bar bar-stable" irk-consent-agree>'+
                '<div class="buttons">'+
                '<button class="button button-clear button-positive" ng-click="doDisagree()">Disagree</button>'+
                '</div>'+
                '<h1 class="title"></h1>'+
                '<div class="buttons">'+
                '<button class="button button-clear button-positive" ng-click="doAgree()">Agree</button>'+
                '</div>'+
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

                //Hide for Visual Content Overview, Consent Sharing, and Consent Review
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', (stepType=='IRK-VISUAL-CONSENT-STEP' && consentType=='overview') || stepType=='IRK-CONSENT-SHARING-STEP' || (stepType=='IRK-CONSENT-REVIEW-STEP' && consentType=='review'));

                //Enable only when current form is dirtied
                var form = angular.element(document.querySelectorAll('.irk-slider-slide')[index]).find('form');
                scope.isPristine = form.hasClass('ng-pristine') || form.hasClass('ng-invalid');                
            });
        }
    }
})

.directive('irkConsentAgree', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                //Show only for Consent Review
                var step = angular.element(document.querySelectorAll('irk-consent-task.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', !(stepType=='IRK-CONSENT-REVIEW-STEP' && consentType=='review'));
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
        transclude: true,
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

            if (consentType == 'only-in-document') 
            {
                return  '<div class="irk-learn-more-content" ng-transclude>'+
                        '</div>';
            }
            else 
            {
                return  '<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                        '<div class="irk-spacer"></div>'+
                        '<div class="item irk-consent-image '+consentImageClass+' positive"></div>'+
                        '<h2>'+consentTitle+'</h2>'+
                        '<p>'+attr.summary+'</p>'+
                        '<a class="button button-clear button-positive irk-learn-more" ng-click="$parent.showLearnMore()">'+consentText+'</a>'+
                        '<div class="irk-learn-more-content" ng-transclude>'+
                        '</div>'+
                        '<div class="irk-spacer"></div>'+
                        (consentType=='overview'?'<button class="button button-outline button-positive irk-instruction-button" ng-click="$parent.doNext()">Get Started</button>':'')+
                        '</div></div>';
            }
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step irk-visual-consent-step');

            if (!angular.isDefined(element.attr('title'))) {
                var consentType = attrs.type;
                var consentTitle = '';

                switch (consentType) {
                    case 'overview':
                        consentTitle = 'Welcome';
                        break;
                    case 'data-gathering':
                        consentTitle = 'Data Gathering';
                        break;
                    case 'privacy':
                        consentTitle = 'Privacy';
                        break;
                    case 'data-use':
                        consentTitle = 'Data Use';
                        break;
                    case 'time-commitment':
                        consentTitle = 'Time Commitment';
                        break;
                    case 'study-survey':
                        consentTitle = 'Study Survey';
                        break;
                    case 'study-tasks':
                        consentTitle = 'Study Tasks';
                        break;
                    case 'withdrawing':
                        consentTitle = 'Withdrawing';
                        break;
                }

                element.attr('title', consentTitle);
            }
        }        
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkConsentSharingStep', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: function(elem, attr) {
            return  '<div class="irk-centered">'+
                    '<h2>Sharing Options</h2>'+
                    '<p>'+attr.summary+'</p>'+
                    '<p>Sharing your coded study data more broadly (without information such as your name) may benefit this and future research.</p>'+
                    '<a class="button button-clear button-positive irk-learn-more" ng-click="$parent.showLearnMore()">Learn more about data sharing</a>'+
                    '<div class="irk-learn-more-content" ng-transclude>'+
                    '</div>'+
                    '<div class="irk-spacer"></div>'+
                    '<div class="list">'+
                    '<a class="item item-text-wrap item-icon-right irk-item-content" ng-click="$parent.doShare(\''+attr.id+'\',\''+attr.investigatorLongValue+'\')">'+
                    'Share my data with '+attr.investigatorLongDescription+
                    '<i class="icon ion-ios-arrow-right positive"></i>'+
                    '</a>'+
                    '<a class="item item-text-wrap item-icon-right irk-item-content" ng-click="$parent.doShare(\''+attr.id+'\',\''+attr.investigatorShortValue+'\')">'+
                    'Share my data with '+attr.investigatorShortDescription+
                    '<i class="icon ion-ios-arrow-right positive"></i>'+
                    '</a>'+
                    '</div>'+
                    '</div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkConsentReviewStep', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: function(elem, attr) {
            var reviewType = attr.type;

            if (reviewType == 'review') {
                return  '<ion-content class="padding has-header has-footer">'+
                        '<div class="irk-text-centered">'+
                        '<h2>Review</h2>'+
                        '<p>Review the form below, and tap Agree if you\'re ready to continue.</p>'+
                        '</div>'+
                        '<div class="irk-text-left">'+
                        '<div class="irk-spacer"></div>'+
                        '<h4>'+attr.title+'</h4>'+
                        (attr.hasHtmlContent=='true'?'<div class="irk-consent-review-content" ng-transclude>':'<div class="irk-consent-review-derived-content">')+
                        '</div>'+
                        '</div>'+
                        '</ion-content>'
            }
            else if (reviewType == 'signature') {
                return  '<form name="form'+attr.id+'" class="irk-slider">'+
                        '<div class="irk-centered">'+
                        '<h2>Consent</h2>'+
                        '<p>'+attr.summary+'</p>'+
                        '</div>'+
                        '<div class="irk-spacer"></div>'+
                        '<div ng-transclude>'+
                        '</div>'+
                        '</form>'
            }
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step irk-form-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                if (!scope.reviewContent) {
                    var reviewType = attrs.type;
                    if (reviewType == 'review' && (!attrs.hasHtmlContent || attrs.hasHtmlContent == 'false')) {
                        scope.reviewContent = '';
                        var steps = angular.element(document.querySelectorAll('.irk-visual-consent-step'));
                        for (var i=0; i<steps.length; i++) {
                            var step = angular.element(steps[i]);
                            var stepTitle = step.attr('title');
                            scope.reviewContent += '<div class="irk-spacer"></div>';
                            scope.reviewContent += '<h5>'+stepTitle+'</h4>';
                            var stepContent = angular.element(steps[i].querySelector('.irk-learn-more-content'));
                            scope.reviewContent += '<div>'+stepContent.html()+'</div>';
                        };
                        
                        var container = angular.element(document.querySelector('.irk-consent-review-derived-content'));
                        container.append(scope.reviewContent);
                    }
                }
            });
        }
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkConsentSignature', function() {
    return {
        restrict: 'E',
        replace: true,
        require: '^?irkConsentReviewStep',
        template: function(elem, attr) {
            return  '<div class="list">'+
                    '<label class="item item-input">'+
                    '<span class="input-label irk-form-input-label">First Name</span>'+
                    '<input type="text" placeholder="Required" ng-model="$parent.$parent.formData.'+elem.parent().attr("id")+'.'+attr.id+'.givenName" ng-model-options="{ updateOn: \'default blur\' }" ng-required="true" ng-change="$parent.$parent.dirty()">'+
                    '</label>'+
                    '<label class="item item-input">'+
                    '<span class="input-label irk-form-input-label">Last Name</span>'+
                    '<input type="text" placeholder="Required" ng-model="$parent.$parent.formData.'+elem.parent().attr("id")+'.'+attr.id+'.familyName" ng-model-options="{ updateOn: \'default blur\' }" ng-required="true" ng-change="$parent.$parent.dirty()">'+
                    '</label>'+
                    '</div>'
        },
        link: function(scope, element, attrs, controller) {
            var stepId = element.parent().parent().parent().attr("id");
            var sigId = attrs.id;
            scope.$parent.$parent.formData[stepId] = {};
            scope.$parent.$parent.formData[stepId][sigId] = { "title": attrs.title };
        }
    }
})

