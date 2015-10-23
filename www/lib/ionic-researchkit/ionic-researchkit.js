/** 
* Author: Nino Guba
* Date: 08-26-2015
* Directives for ResearchKit in Ionic
*
* Adapted from the following:
* ion-slide-box (https://github.com/driftyco/ionic)
* ion-wizard (https://github.com/arielfaur/ionic-wizard)
*
* Required dependencies:
* checklist-model (https://github.com/vitalets/checklist-model)
*/
angular.module('ionicResearchKit',[])
//======================================================================================
// This provides a counterpart of Apple's ResearchKit for Ionic apps
// =====================================================================================


//======================================================================================
// Usage: 
// =====================================================================================
.service('irkResults', function() {
    var service = this;
    var results = null;

    service.initResults = function() {
        results = {
            "start": new Date(),
            "end": null,
            "childResults": []
        }
    };

    service.getResults = function() {
        return results;
    }

    service.addResult = function(index, formData) {
        if (!results) service.initResults();

        if (index == results.childResults.length)
        {
            results.childResults.push({
                "index": index,
                "start": new Date(),
                "end": null
            });            
        }
        else
        {
            var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
            var stepId = step.attr('id');
            var stepType = step.prop('tagName');
            var stepValue = formData[stepId];
            var stepUnit = step.attr('unit');
            var consentType = step.attr('type');

            results.childResults[index].id = stepId;
            results.childResults[index].type = stepType;

            if (stepType == 'IRK-CONSENT-REVIEW-STEP' && consentType == 'review')
                results.childResults[index].answer = (angular.isDefined(formData.consent)?formData.consent:null);
            else if (stepType != 'IRK-INSTRUCTION-STEP' && stepType != 'IRK-VISUAL-CONSENT-STEP')
                results.childResults[index].answer = (stepValue?stepValue:null);

            if (stepType == 'IRK-NUMERIC-QUESTION-STEP')
                results.childResults[index].unit = (stepUnit?stepUnit:null);

            results.childResults[index].end = new Date();
            results.end = new Date();
        }
    }
})

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
    '$ionicModal',
    '$ionicPopup',
    '$ionicPlatform',
    'irkResults',
    function($rootScope, $timeout, $compile, $ionicSlideBoxDelegate, $ionicHistory, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicActionSheet, $ionicModal, $ionicPopup, $ionicPlatform, irkResults) {
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

                    //This is needed to set the Android back button to map back to the step back action
                    $scope.deregisterStepBack();
                };

                $scope.$on("step:Previous", function() {
                    slider.prev();
                });
                
                $scope.$on("step:Next", function() {
                    $scope.doNext();
                });

                //This is needed to set the Android back button to not close the modal
                $scope.deregisterStepBack = $ionicPlatform.registerBackButtonAction($scope.doStepBack, 250);

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

                    //This is needed to set the Android back button to override the step back action
                    $scope.deregisterHideLearnMore = $ionicPlatform.registerBackButtonAction($scope.hideLearnMore, 250);
                };

                $scope.hideLearnMore = function() {
                    $scope.learnmore.remove();

                    //This is needed to set the Android back button to map back to the step back action
                    $scope.deregisterHideLearnMore();
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

                //This is called to reanimate GIF images
                $scope.previousIndex = 0;
                $scope.doReanimateConsentImage = function() {
                    var index = slider.currentIndex();
                    var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                    var stepType = step.prop('tagName');

                    if (stepType == 'IRK-VISUAL-CONSENT-STEP' && $scope.previousIndex <= index) {
                        var consentType = step.attr('type');
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

                        if (consentImageClass != '') {
                            var image = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-consent-image'));
                            image.css('background-image', 'url(lib/ionic-researchkit/resources/'+consentImageClass+'?x='+Math.random()+')');
                        }
                    }

                    $scope.previousIndex = index;
                }; 

                //This is called when input changes (faster than form.$dirty)
                $scope.dirty = function() {
                    //Enable only when current form is dirtied and valid
                    $timeout(function() {
                        var index = slider.currentIndex();
                        var form = angular.element(document.querySelectorAll('.irk-slider-slide')[index]).find('form');
                        var next = angular.element(document.querySelectorAll('.irk-next-button'));
                        if (form.length > 0  && form.hasClass('ng-invalid')) {
                            angular.element(next[0]).attr("disabled", "disabled");
                            angular.element(next[1]).attr("disabled", "disabled");
                        } else {
                            angular.element(next[0]).removeAttr("disabled");
                            angular.element(next[1]).removeAttr("disabled");
                        }
                    }, 100);
                };

                //This is to initialize what will hold the results
                $scope.formData = {};
                irkResults.initResults();

                //This is called to capture the results
                $scope.doSave = function() {
                    irkResults.addResult(slider.currentIndex(), $scope.formData);
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
                //FOOTER BAR FOR SURVEY STEPS
                '<ion-footer-bar class="bar-subfooter irk-bottom-bar"  irk-survey-bar>'+
                '<button class="button button-block button-outline button-positive irk-bottom-button" ng-click="doStepNext()" irk-step-next>Next</button>'+
                '</ion-footer-bar>'+
                '<ion-footer-bar class="irk-bottom-bar" irk-survey-bar>'+
                '<button class="button button-block button-clear button-positive irk-bottom-button" ng-click="doSkip()" irk-step-skip>Skip this question</button>'+
                '</ion-footer-bar>'+
                //FOOTER BAR FOR CONSENT STEPS
                '<ion-footer-bar class="irk-bottom-bar irk-bottom-bar-consent" irk-consent-bar>'+
                '<button class="button button-block button-outline button-positive irk-bottom-button" ng-click="doStepNext()" irk-step-next>Next</button>'+
                '</ion-footer-bar>'+
                //FOOTER BAR FOR CONSENT REVIEW
                '<ion-footer-bar class="irk-bottom-bar bar-stable" irk-consent-bar-agree>'+
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
            }
        };
}])

.directive('irkTask', function() {
    return {
        restrict: 'E',
        require: '^irkOrderedTasks',
        link: function(scope, element, attrs, controller) {
            element.addClass('slider-slide irk-slider-slide');
        }
    };
})

.directive('irkStepTitle', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                if (stepType!='IRK-VISUAL-CONSENT-STEP' && stepType!='IRK-CONSENT-SHARING-STEP' && stepType!='IRK-CONSENT-REVIEW-STEP')
                    element.text('Step ' + (index+1) + ' of ' + count);
                else
                    element.text('');
            });
        }
    }
})

.directive('irkStepPrevious', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index) {
                element.toggleClass('ng-hide', index == 0);
            });
        }
    }
})

.directive('irkStepNext', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                element.addClass('irk-next-button');

                if (index == count - 1)
                    element.text("Done");
                else
                    element.text("Next");

                //Hide for Instruction Step, Visual Content Overview, Consent Sharing, and Consent Review
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', stepType=='IRK-INSTRUCTION-STEP' || (stepType=='IRK-VISUAL-CONSENT-STEP' && consentType=='overview') || stepType=='IRK-CONSENT-SHARING-STEP' || (stepType=='IRK-CONSENT-REVIEW-STEP' && consentType=='review'));                

                //Enable only when current form is dirtied and valid
                var form = angular.element(document.querySelectorAll('.irk-slider-slide')[index]).find('form');
                if (form.length > 0  && (form.hasClass('ng-pristine') || form.hasClass('ng-invalid')))
                    element.attr("disabled", "disabled");
                else
                    element.removeAttr("disabled");
            });
        }
    }
})

.directive('irkStepSkip', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            //Hide for instruction step or when input is required
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepOptional = step.attr('optional') || 'true';
                element.toggleClass('ng-hide', stepType=='IRK-INSTRUCTION-STEP' || stepOptional=='false');
            });
        }
    }
})

.directive('irkSurveyBar', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                //Show only for Consent Review
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', (stepType=='IRK-VISUAL-CONSENT-STEP' || stepType=='IRK-CONSENT-SHARING-STEP' || stepType=='IRK-CONSENT-REVIEW-STEP'));
            });
        }
    }
})

.directive('irkConsentBar', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                //Show only for Consent Review
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', (stepType!='IRK-VISUAL-CONSENT-STEP' && stepType!='IRK-CONSENT-SHARING-STEP' && stepType!='IRK-CONSENT-REVIEW-STEP'));
            });
        }
    }
})

.directive('irkConsentBarAgree', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                //Show only for Consent Review
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', !(stepType=='IRK-CONSENT-REVIEW-STEP' && consentType=='review'));
            });
        }
    }
})

//======================================================================================
// Usage: <irk-instruction-step id="s1" title="Your title here." text="Additional text can go here." />
// =====================================================================================
.directive('irkInstructionStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            return 	'<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                '<h2>'+attr.title+'</h2>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                (attr.link ? '<a class="button button-clear button-positive irk-learn-more" href="'+attr.link+'" target="_system">'+(attr.linkText ? attr.linkText : 'Learn more')+'</a>' : '')+
                '<div class="irk-spacer"></div>'+
                '<button class="button button-outline button-positive irk-instruction-button" ng-click="$parent.doNext()">'+(attr.buttonText ? attr.buttonText : 'Get Started')+'</button>'+
                '</div></div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }        
    }
})

//======================================================================================
// Usage: <irk-scale-question-step id="q1" title="Your question here." text="Additional text can go here." min="1" max="10" step="1" value="5" min-text="Low" max-text="High" optional="false"/>
// =====================================================================================
.directive('irkScaleQuestionStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            return 	'<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<h3>{{$parent.formData.'+attr.id+' || \'&nbsp;\'}}</h3>'+
                '<div class="range">'+
                attr.min+
                (attr.minText?'<br>'+attr.minText:'')+
                '<input type="range" name="'+attr.id+'" min="'+attr.min+'" max="'+attr.max+'" step="'+attr.step+'" value="'+attr.value+'" ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()">'+
                attr.max+
                (attr.maxText?'<br>'+attr.maxText:'')+
                '</div>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-boolean-question-step id="q1" title="Your question here." text="Additional text can go here." true-value="true" false-value="false" true-text="Yes" false-text="No" optional="false"/>
// =====================================================================================
.directive('irkBooleanQuestionStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            return 	'<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="list">'+
                '<label class="item item-radio">'+
                '<input type="radio" name="'+attr.id+'" value="'+(attr.trueValue?attr.trueValue:'true')+'" ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()">'+
                '<div class="radio-content">' +
                '<div class="item-content disable-pointer-events irk-item-content">'+(attr.trueText?attr.trueText:(attr.trueValue?attr.trueValue:'True'))+'</div>'+
                '<i class="radio-icon disable-pointer-events icon ion-checkmark positive"></i>'+
                '</div>' +
                '</label>'+
                '<label class="item item-radio">'+
                '<input type="radio" name="'+attr.id+'" value="'+(attr.falseValue?attr.falseValue:'false')+'" ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()">'+
                '<div class="radio-content">' +
                '<div class="item-content disable-pointer-events irk-item-content">'+(attr.falseText?attr.falseText:(attr.falseValue?attr.falseValue:'False'))+'</div>'+
                '<i class="radio-icon disable-pointer-events icon ion-checkmark positive"></i>'+
                '</div>' +
                '</label>'+
                '</div>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-text-question-step id="q1" title="Your question here." text="Additional text can go here." max-length="0" multiple-lines="true" placeholder="" optional="false"/>
// =====================================================================================
.directive('irkTextQuestionStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="list">'+
                '<label class="item item-input">'+
                (attr.multipleLines=="false"
                ?'<input type="text" placeholder="'+(attr.placeholder?attr.placeholder:'')+'" name="'+attr.id+'" '+(attr.maxLength && parseInt(attr.maxLength,10)>0?'maxlength="'+attr.maxLength+'"':'')+' ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()">'
                :'<textarea rows="8" placeholder="'+(attr.placeholder?attr.placeholder:'')+'" name="'+attr.id+'" '+(attr.maxLength && parseInt(attr.maxLength,10)>0?'maxlength="'+attr.maxLength+'"':'')+' ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()"></textarea>'
                )+
                '</label>'+
                '</div>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-text-choice-question-step id="q1" title="Your question here." text="Additional text can go here." style="single/multiple" optional="false"></irk-text-choice-question-step>
// =====================================================================================
.directive('irkTextChoiceQuestionStep', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="list" ng-transclude>'+
                '</div>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-text-choice value="choice" text="Your choice." detail-text="Additional text can go here."/>
// =====================================================================================
.directive('irkTextChoice', function() {
    return {
        restrict: 'E',
        require: '^?irkTextChoiceQuestionStep',
        template: function(elem, attr) {
            return  '<label class="item item-radio">'+
                (elem.parent().attr("style")=="multiple"?
                '<input type="checkbox" name="'+elem.parent().attr("id")+'" value="'+attr.value+'" checklist-model="$parent.$parent.formData.'+elem.parent().attr("id")+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.$parent.$parent.dirty()">'
                :
                '<input type="radio" name="'+elem.parent().attr("id")+'" value="'+attr.value+'" ng-model="$parent.$parent.formData.'+elem.parent().attr("id")+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.$parent.dirty()">'
                )+
                '<div class="radio-content">' +
                '<div class="item-content disable-pointer-events irk-item-content">'+
                attr.text+
                (attr.detailText?'<p>'+attr.detailText+'</p>':'')+
                '</div>'+
                '<i class="radio-icon disable-pointer-events icon ion-checkmark positive"></i>'+
                '</div>' +
                '</label>'
        }
    }
})

//======================================================================================
// Usage: <irk-numeric-question-step id="q1" title="Your question here." text="Additional text can go here." unit="Your unit." placeholder="Your placeholder." min="0" max="10" optional="false"/>
// =====================================================================================
.directive('irkNumericQuestionStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="list">'+
                '<label class="item item-input">'+
                '<input type="number" placeholder="'+(attr.placeholder?attr.placeholder:'')+'" name="'+attr.id+'" '+(attr.min?'min="'+attr.min+'"':'')+' '+(attr.max?'max="'+attr.max+'"':'')+' ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()">'+
                (attr.unit && attr.unit.length>0?'<span class="input-label">'+attr.unit+'</span>':'')+
                '</label>'+
                '</div>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-date-question-step id="q1" title="Your question here." text="Additional text can go here." optional="false"/>
// =====================================================================================
.directive('irkDateQuestionStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="list">'+
                '<label class="item item-input">'+
                '<span class="input-label irk-input-label" ng-if="!$parent.formData.'+attr.id+'">Tap to select date.</span>'+
                '<input class="irk-input" type="date" name="'+attr.id+'" ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()">'+
                '</label>'+
                '</div>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-time-question-step id="q1" title="Your question here." text="Additional text can go here." optional="false"/>
// =====================================================================================
.directive('irkTimeQuestionStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="list">'+
                '<label class="item item-input">'+
                '<span class="input-label irk-input-label" ng-if="!$parent.formData.'+attr.id+'">Tap to select time.</span>'+
                '<input class="irk-input" type="time" name="'+attr.id+'" ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()">'+
                '</label>'+
                '</div>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-value-picker-question-step id="q1" title="Your question here." text="Additional text can go here." optional="false"></irk-value-picker-question-step>
// =====================================================================================
.directive('irkValuePickerQuestionStep', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="list">'+
                '<label class="item item-input item-select irk-item-select">'+
                '<span class="input-label irk-input-label">{{(!$parent.formData.'+attr.id+'?\'Tap to select answer.\':\'&nbsp;\')}}</span>'+
                '<select ng-transclude name="'+attr.id+'" ng-model="$parent.formData.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.dirty()">' +
                '</select>'+
                '</label>'+
                '</div>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-picker-choice value="choice" text="Your choice." />
// =====================================================================================
.directive('irkPickerChoice', function() {
    return {
        restrict: 'E',
        replace: true,
        require: '^?irkValuePickerQuestionStep',
        template: function(elem, attr) {
            return '<option value="'+attr.value+'">'+attr.text+'</option>';
        }
    }
})

//======================================================================================
// Usage: <irk-image-choice-question-step id="q1" title="Your question here." text="Additional text can go here." optional="false"></irk-image-choice-question-step>
// =====================================================================================
.directive('irkImageChoiceQuestionStep', function() {
    return {
        restrict: 'E',
        transclude: true,
        controller: ['$scope', function($scope) {
            $scope.selected = {};
        }],
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="row" ng-transclude>'+
                '</div>'+
                '<h5 ng-if="$parent.formData.'+attr.id+'">{{selected.text}}</h5><span class="irk-input-label" ng-if="!$parent.formData.'+attr.id+'">Tap to select.</span>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: <irk-image-choice value="choice" text="Your choice." normal-state-image="" selected-state-image="" type="image" />
// =====================================================================================
.directive('irkImageChoice', function() {
    return {
        restrict: 'E',
        replace: true,
        require: '^?irkImageChoiceQuestionStep',
        template: function(elem, attr) {
            return  '<div class="col">'+
                '<button class="button button-clear '+(attr.type=='image'?'irk-image':'irk-icon-large icon')+' '+attr.normalStateImage+'"></button>'+
                '</div>';
        },
        link: function(scope, element, attrs) {
            var button = element.find('button');
            button.bind('click', function() {
                //Toggle selected state of image choices
                var buttons = element.parent().find('button');
                for (i=0; i<buttons.length; i++)
                {
                    var choice = angular.element(buttons[i]);
                    choice.removeClass('button-positive');
                    var parent = choice.parent();
                    choice.removeClass(parent.attr("selected-state-image"));
                    choice.addClass(parent.attr("normal-state-image"));
                }

                //Set selected state
                button.removeClass(attrs.normalStateImage);
                button.addClass(attrs.selectedStateImage);
                button.addClass('button-positive');

                //Set model
                var step = element.parent().parent().parent();
                var stepId = step.attr('id');
                scope.$parent.$parent.formData[stepId] = attrs.value;
                scope.selected.text = attrs.text;
                scope.$parent.$parent.dirty();
            });
        }
    }
})

//======================================================================================
// Usage: <irk-form-step id="q1" title="Your question here." text="Additional text can go here." optional="false"></irk-form-step>
// =====================================================================================
.directive('irkFormStep', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                '<ion-content class="has-header" style="top:80px;">'+
                '<div class="irk-centered">'+
                '<h3>'+attr.title+'</h3>'+
                (attr.text ? '<p>'+attr.text+'</p>' : '')+
                '</div>'+
                '<div class="irk-spacer"></div>'+
                '<div class="list" ng-transclude>'+
                '</div>'+
                '</ion-content>'+
                '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step irk-form-step');
        }
    }
})

//======================================================================================
// Usage: <irk-form-item title="Your section title." id="q1" text="Your choice." type="text/number/tel/email/..." placeholder="Your placeholder." optional="false"></irk-form-item>
// =====================================================================================
.directive('irkFormItem', function() {
    return {
        restrict: 'E',
        replace: true,
        require: '^?irkFormStep',
        template: function(elem, attr) {
            if (attr.title)
            {
                //Section divider will only have the title attribute
                return '<div class="item item-divider irk-form-divider">'+attr.title+'</div>';
            }
            else
            {
                //Form input types (currently only supports HTML input types)
                return '<label class="item item-input">'+
                    '<span class="input-label irk-form-input-label">'+attr.text+'</span>'+
                    '<input type="'+attr.type+'" placeholder="'+attr.placeholder+'" ng-model="$parent.$parent.$parent.formData.'+elem.parent().attr("id")+'.'+attr.id+'" ng-required="'+(attr.optional=='false'?'true':'false')+'" ng-change="$parent.$parent.$parent.dirty()">'+
                    '</label>';
            }
        },
        link: function(scope, element, attrs) {
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
            };
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
                return  '<form name="form'+attr.id+'" class="irk-slider" novalidate>'+
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
                    '<input type="text" placeholder="Required" ng-model="$parent.$parent.formData.'+elem.parent().attr("id")+'.'+attr.id+'.givenName" ng-required="true" ng-change="$parent.$parent.dirty()">'+
                    '</label>'+
                    '<label class="item item-input">'+
                    '<span class="input-label irk-form-input-label">Last Name</span>'+
                    '<input type="text" placeholder="Required" ng-model="$parent.$parent.formData.'+elem.parent().attr("id")+'.'+attr.id+'.familyName" ng-required="true" ng-change="$parent.$parent.dirty()">'+
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