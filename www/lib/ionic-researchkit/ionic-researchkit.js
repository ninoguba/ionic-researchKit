/*
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
* signature_pad (https://github.com/szimek/signature_pad)
* angular-svg-round-progressbar (https://github.com/crisbeto/angular-svg-round-progressbar)
* pdfmake (https://github.com/bpampuch/pdfmake)
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
            "childResults": [],
            "canceled": false
        }
    };

    service.cancel = function() {
        results.canceled = true;
    }

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
            else if (stepType == 'IRK-DATE-QUESTION-STEP')
                results.childResults[index].answer = (stepValue?stepValue.toDateString():null);
            else if (stepType == 'IRK-TIME-QUESTION-STEP')
                results.childResults[index].answer = (stepValue?stepValue.toTimeString():null);
            else if (stepType != 'IRK-INSTRUCTION-STEP' && stepType != 'IRK-COUNTDOWN-STEP' 
                        && stepType != 'IRK-COMPLETION-STEP' && stepType != 'IRK-VISUAL-CONSENT-STEP' 
                        && !(stepType=='IRK-CONSENT-REVIEW-STEP' && consentType=='signature') 
                        && !(stepType=='IRK-CONSENT-REVIEW-STEP' && consentType=='name') 
                        && stepType != 'IRK-TWO-FINGER-TAPPING-INTERVAL-TASK' 
                        && stepType != 'IRK-AUDIO-TASK'&& stepType != 'IRK-IMAGE-TASK' 
                        && stepType != 'IRK-VIDEO-CAPTURE-TASK' && stepType != 'IRK-SPATIAL-MEMORY-TASK'
                        && stepType != 'IRK-GAIT-BALANCE-TASK' && stepType != 'IRK-FITNESS-TASK')
                results.childResults[index].answer = (stepValue?stepValue:null);
            else if (stepType == 'IRK-TWO-FINGER-TAPPING-INTERVAL-TASK')
                results.childResults[index].samples = (stepValue && stepValue.samples?stepValue.samples:null);
            else if (stepType == 'IRK-AUDIO-TASK') {
                results.childResults[index].fileURL = (stepValue && stepValue.fileURL?stepValue.fileURL:null);
                results.childResults[index].contentType = (stepValue && stepValue.contentType?stepValue.contentType:null);
            }
            else if (stepType == 'IRK-IMAGE-TASK') {
                results.childResults[index].fileURL = (stepValue && stepValue.fileURL?stepValue.fileURL:null);
            }
            else if (stepType == 'IRK-VIDEO-CAPTURE-TASK') {
                results.childResults[index].fileURL = (stepValue && stepValue.fileURL?stepValue.fileURL:null);
            }
            else if (stepType == 'IRK-SPATIAL-MEMORY-TASK') {
                results.childResults[index].highestCorrectSpan= (stepValue && stepValue.highestCorrectSpan?stepValue.highestCorrectSpan:null);
                results.childResults[index].minSpan= (stepValue && stepValue.minSpan?stepValue.minSpan:null);
                results.childResults[index].maxSpan= (stepValue && stepValue.maxSpan?stepValue.maxSpan:null);
             }
            else if (stepType == 'IRK-GAIT-BALANCE-TASK') {
                results.childResults[index].firstLegAccel= (stepValue && stepValue.firstLegAccel?stepValue.firstLegAccel:null);
                results.childResults[index].secondLegAccel= (stepValue && stepValue.secondLegAccel?stepValue.secondLegAccel:null);
                results.childResults[index].restingLeg= (stepValue && stepValue.restingLeg?stepValue.firstLeg:null);
                results.childResults[index].firstLegSteps= (stepValue && stepValue.firstLegSteps?stepValue.firstLegSteps:null);
                results.childResults[index].secondLegSteps= (stepValue && stepValue.secondLegSteps?stepValue.secondLegSteps:null);
             }
             else if (stepType == 'IRK-FITNESS-TASK') {
                results.childResults[index].acceleration= (stepValue && stepValue.acceleration?stepValue.acceleration:null);
                results.childResults[index].distance= (stepValue && stepValue.distance?stepValue.distance:null);
             }

            if (stepType == 'IRK-NUMERIC-QUESTION-STEP')
                results.childResults[index].unit = (stepUnit?stepUnit:null);

            if (stepType == 'IRK-CONSENT-REVIEW-STEP' && consentType == 'name') {
                results.childResults[index].participantTitle = (angular.isDefined(formData.participantTitle)?formData.participantTitle:null);
                results.childResults[index].participantGivenName = (angular.isDefined(formData.participantGivenName)?formData.participantGivenName:null);
                results.childResults[index].participantFamilyName = (angular.isDefined(formData.participantFamilyName)?formData.participantFamilyName:null);
            }

            if (stepType == 'IRK-CONSENT-REVIEW-STEP' && consentType == 'signature') {
                results.childResults[index].signature = (angular.isDefined(formData.signature)?formData.signature:null);
                results.childResults[index].date = (angular.isDefined(formData.signature)?(new Date()).toDateString():null);
            }

            results.childResults[index].end = new Date();
            results.end = new Date();
        }
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.service('irkConsentDocument', function($filter) {
    var service = this;
    var consentDocument = null;
    var pdfDefinition = null;
    var pdfContent = null;
    var pdfTitle = null;
    var pdfName = null;
    var pdfSignature = null;

    service.initDocument = function() {
        pdfDefinition = { 
            pageSize: 'LEGAL',
            pageMargins: [ 50, 50, 50, 50 ],
            styles: {
                title: { fontSize: 18, bold: true },
                header: { fontSize: 15, bold: true },
                paragraph: { fontSize: 12, alignment: 'justify' },
                footer: { fontSize: 10, alignment: 'center', margin: [ 0,10,0,0 ] }
            },
            footer: function(currentPage, pageCount) { return { text: 'Page ' + currentPage.toString() + ' of ' + pageCount, style: 'footer' }; },
        };
    };

    service.addConsentTitle = function(title) {
        if (!pdfDefinition) service.initDocument();
        pdfContent = [{ text: title, style: 'title' }, ' '];
    };

    service.addConsentSection = function(title, content) {
        if (pdfDefinition) {
            pdfContent.push({ text: title, style: 'header' });
            pdfContent.push({ text: content, style: 'paragraph' });
        }
    };

    service.addConsentBody = function(content) {
        if (pdfDefinition) {
            pdfContent.push({ text: content, style: 'paragraph' });
        }
    };

    service.addParticipantName = function(formdata) {
        pdfName = formdata.participantGivenName + ' ' + formdata.participantFamilyName;
        pdfTitle = formdata.participantTitle;
    }

    service.addParticipantSignature = function(signature) {
        pdfSignature = signature;
    };

    service.addConsentParticipant = function() {
        if (pdfDefinition) {
            pdfContent.push({ text: '\n\n\n', style: 'paragraph' });
            pdfContent.push({ image: pdfSignature, fit: [150, 150] });
            pdfContent.push({
                columns: [
                    {
                        width: '*',
                        text: pdfName.toUpperCase()
                    },
                    {
                        width: '*',
                        text: $filter('date')(new Date(), "MM/dd/yyyy")
                    }
                ],
                columnGap: 10
            });            
            pdfContent.push({
                columns: [
                    {
                        width: '*',
                        text: '______________________________'
                    },
                    {
                        width: '*',
                        text: '______________________________'
                    }
                ],
                columnGap: 10
            });
            pdfContent.push({
                columns: [
                    {
                        width: '*',
                        text: pdfTitle + ' Name & Signature' 
                    },
                    {
                        width: '*',
                        text: 'Date'
                    }
                ],
                columnGap: 10
            });
        }
    };

    service.getDocument = function() {
        if (pdfDefinition) {
            service.addConsentParticipant();
            pdfDefinition.content = pdfContent;
            consentDocument = pdfMake.createPdf(pdfDefinition);
        }
        return consentDocument;
    };   
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkOrderedTasks', [
    '$rootScope',
    '$timeout',
    '$interval',
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
    function($rootScope, $timeout, $interval, $compile, $ionicSlideBoxDelegate, $ionicHistory, $ionicScrollDelegate, $ionicNavBarDelegate, $ionicActionSheet, $ionicModal, $ionicPopup, $ionicPlatform, irkResults) {
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
                    $scope.stopCountdown();
                });

                this.slidesCount = function() {
                    return slider.slidesCount();
                };

                $timeout(function() {
                    slider.load();
                });

                $scope.doStepBack = function() {
                    slider.prev();
                };

                $scope.doStepNext = function() {
                    $scope.doNext();
                };

                $scope.doSkip = function() {
                    if (slider.currentIndex() < slider.slidesCount()-1)
                        slider.next();
                    else
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
                    var index = $scope.currentSlide;
                    var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                    var stepType = step.prop('tagName');

                    if (stepType=='IRK-COMPLETION-STEP' && index==slider.slidesCount()-1)
                    {                    
                        $scope.doNext();
                    }
                    else
                    {
                        // Show the action sheet
                        var hideSheet = $ionicActionSheet.show({
                            destructiveText: (ionic.Platform.isAndroid()?'<i class="icon ion-android-exit assertive"></i> ':'')+'End Task',
                            cancelText: 'Cancel',
                            cancel: function() {
                                hideSheet();
                            },
                            destructiveButtonClicked: function(index) {
                                irkResults.cancel();
                                $scope.doSave();
                                $scope.doEnd();
                                return true;
                            }
                        });
                    }
                };

                $scope.doEnd = function() {
                    $scope.$parent.closeModal();

                    //This is needed to set the Android back button to map back to the step back action
                    $scope.deregisterStepBack();
                    
                    //Just in case we're coming from a countdown step
                    $scope.stopCountdown();                    
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
                        '<button class="button button-clear button-positive irk-button-learn-more-done" ng-click="hideLearnMore()">Done</button>'+
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
                        cancelType: 'button-outline button-positive irk-button-consent-popup-disagree',
                        okText: 'Agree',
                        okType: 'button-outline button-positive irk-button-consent-popup-agree'
                    });
                    confirmPopup.then(function(res) {
                        if (res) {
                            $scope.formData.consent = true;
                            $scope.doNext();
                        } else {
                            //Clicked cancel
                        }
                    });
                };

                $scope.doDisagree = function() {
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
                            var image = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step-image'));
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
                        var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                        var stepType = step.prop('tagName');
                        var form = step.find('form');
                        var input = form.find('input');
                        var next = angular.element(document.querySelectorAll('.irk-next-button'));
                        if (form.length > 0  
                            && ((stepType!='IRK-DATE-QUESTION-STEP' && stepType!='IRK-TIME-QUESTION-STEP' && form.hasClass('ng-invalid'))
                                || ((stepType=='IRK-DATE-QUESTION-STEP' || stepType=='IRK-TIME-QUESTION-STEP') && input.hasClass('ng-invalid'))))
                        {
                            angular.element(next[0]).attr("disabled", "disabled");
                            angular.element(next[1]).attr("disabled", "disabled");
                        } 
                        else 
                        {
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
                    $scope.stopCountdown();
                });

                $scope.stopCountdown = function() {
                    var index = slider.currentIndex();
                    var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));

                    if (step!='IRK-COUNTDOWN-STEP' && angular.isDefined($scope.currentCountdown)) {
                        $interval.cancel($scope.currentCountdown);
                        $scope.currentCountdown = undefined;
                    }
                };
            }],

            template:
                '<div class="scroll slider irk-slider">'+
                '<div class="slider-slides irk-slider-slides" ng-transclude>'+
                '</div>'+
                //FOOTER BAR FOR SURVEY STEPS
                '<ion-footer-bar class="irk-bottom-bar" keyboard-attach irk-survey-bar>'+
                '<div>'+
                '<a class="button button-block button-outline button-positive irk-bottom-button irk-button-step-next" ng-click="doStepNext()" irk-step-next>Next</a>'+
                '<a class="button button-block button-clear button-positive irk-bottom-button irk-button-step-skip" ng-click="doSkip()" irk-step-skip>Skip this question</a>'+
                '</div>'+
                '</ion-footer-bar>'+
                //FOOTER BAR FOR CONSENT STEPS
                '<ion-footer-bar class="irk-bottom-bar irk-bottom-bar-consent" keyboard-attach irk-consent-bar>'+
                '<button class="button button-block button-outline button-positive irk-bottom-button irk-button-step-next" ng-click="doStepNext()" irk-step-next>Next</button>'+
                '</ion-footer-bar>'+
                //FOOTER BAR FOR CONSENT REVIEW
                '<ion-footer-bar class="irk-bottom-bar irk-bottom-bar-consent-agree bar-stable" irk-consent-bar-agree>'+
                '<div class="buttons">'+
                '<button class="button button-clear button-positive irk-button-consent-disagree" ng-click="doDisagree()">Disagree</button>'+
                '</div>'+
                '<h1 class="title"></h1>'+
                '<div class="buttons">'+
                '<button class="button button-clear button-positive irk-button-consent-agree" ng-click="doAgree()">Agree</button>'+
                '</div>'+
                '</ion-footer-bar>'+
                '</div>',

            link: function(scope, element, attrs, controller) {
                //Insert Header
                var stepHeader = angular.element(
                    '<ion-header-bar>'+
                    '<div class="buttons">'+
                    '<button class="button button-clear button-positive icon ion-ios-arrow-left irk-button-step-previous" ng-click="doStepBack()" irk-step-previous></button>'+
                    '</div>'+
                    '<h1 class="title" irk-step-title></h1>'+
                    '<div class="buttons">'+
                    '<button class="button button-clear button-positive irk-button-step-cancel" ng-click="doCancel()" irk-step-cancel>Cancel</button>'+
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
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');

                element.toggleClass('ng-hide', index == 0 || (stepType=='IRK-COMPLETION-STEP' && (index == count - 1)));
            });
        }
    }
})

.directive('irkStepCancel', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');

                if (stepType=='IRK-COMPLETION-STEP' && (index == count - 1))
                    element.text("Done");
                else
                    element.text("Cancel");
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

                //Show for Instruction Step only if footerAttach is set to true
                var footerAttach = step.attr('footer-attach')=='true';
                if (stepType=='IRK-INSTRUCTION-STEP' && footerAttach) {
                    element.toggleClass('ng-hide', false);
                    element.text(step.attr('button-text') ? step.attr('button-text') : 'Get Started');
                }

                //Enable only when current form is dirtied and valid
                var form = step.find('form');
                var input = form.find('input');
                if (form.length > 0  
                    && ((stepType!='IRK-DATE-QUESTION-STEP' && stepType!='IRK-TIME-QUESTION-STEP' && (form.hasClass('ng-pristine') || form.hasClass('ng-invalid')))
                        || ((stepType=='IRK-DATE-QUESTION-STEP' || stepType=='IRK-TIME-QUESTION-STEP') && (input.hasClass('ng-pristine') || input.hasClass('ng-invalid')))))
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
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', (stepType=='IRK-INSTRUCTION-STEP' || stepType=='IRK-VISUAL-CONSENT-STEP' || stepType=='IRK-CONSENT-SHARING-STEP' || stepType=='IRK-CONSENT-REVIEW-STEP' || stepType=='IRK-COUNTDOWN-STEP' || stepType=='IRK-COMPLETION-STEP' || stepType=='IRK-TWO-FINGER-TAPPING-INTERVAL-TASK' || stepType=='IRK-AUDIO-TASK' || stepType =='IRK-IMAGE-TASK' || stepType =='IRK-VIDEO-CAPTURE-TASK' || stepType=='IRK-SPATIAL-MEMORY-TASK' || stepType == 'IRK-GAIT-BALANCE-TASK' || stepType == 'IRK-FITNESS-TASK'));
            });
        }
    }
})

.directive('irkConsentBar', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');
                element.toggleClass('ng-hide', (stepType!='IRK-INSTRUCTION-STEP' && stepType!='IRK-VISUAL-CONSENT-STEP' && stepType!='IRK-CONSENT-SHARING-STEP' && stepType!='IRK-CONSENT-REVIEW-STEP'));
            });
        }
    }
})

.directive('irkConsentBarAgree', function() {
    return{
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$on("slideBox.slideChanged", function(e, index, count) {
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
                    '<div class="irk-text-centered">'+
                    '<h2>'+attr.title+'</h2>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    (attr.link ? '<a class="button button-clear button-positive irk-button-learn-more" href="'+attr.link+'" target="_system">'+(attr.linkText ? attr.linkText : 'Learn more')+'</a>' : '')+
                    '</div>'+
                    '<div class="irk-spacer"></div>'+
                    (attr.image ? '<div class="irk-image-spacer"></div><div class="item irk-step-image '+attr.image+'"></div><div class="irk-image-spacer"></div>' : '')+
                    (attr.footerAttach && attr.footerAttach=='true'?'':'<button class="button button-outline button-positive irk-button-instruction" ng-click="$parent.doNext()">'+(attr.buttonText ? attr.buttonText : 'Get Started')+'</button>')+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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
                    '<div class="item-content item-text-wrap disable-pointer-events irk-item-content">'+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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

            $scope.initStep = function(stepID) {
                if ($scope.$parent.formData[stepID]) {
                    $scope.selected.text = $scope.$parent.formData[stepID];
                    $scope.$parent.dirty();
                }
            }            
        }],
        template: function(elem, attr) {
            return  '<form name="form.'+attr.id+'" class="irk-slider" novalidate>'+
                    '<div class="irk-centered">'+
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
                    '</div>'+
                    '<div class="irk-spacer"></div>'+
                    '<div class="row" ng-transclude>'+
                    '</div>'+
                    '<h5 ng-if="$parent.formData.'+attr.id+'">{{selected.text}}</h5><span class="irk-input-label" ng-if="!$parent.formData.'+attr.id+'">Tap to select.</span>'+
                    '</form>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-IMAGE-CHOICE-QUESTION-STEP' && stepID==attrs.id) {
                    scope.initStep(stepID);
                }
            });      
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
                    '<button class="button button-clear '+(attr.type=='image'?'irk-image':'irk-icon-large button-stable icon')+' '+attr.normalStateImage+'"></button>'+
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
                    '<div class="irk-text-centered">'+
                    '<h3>'+attr.title+'</h3>'+
                    (attr.text ? '<p>'+attr.text+'</p>' : '')+
                    '</div>'+
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
                return  '<div class="item item-divider irk-form-divider">'+attr.title+'</div>';
            }
            else
            {
                //Form input types (currently only supports HTML input types)
                return  '<label class="item item-input">'+
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
                    consentImageClass = (attr.image?attr.image:'irk-consent-custom');
                    break;
            }

            if (consentType == 'only-in-document') 
            {
                return  '<div class="irk-learn-more-content" ng-transclude>'+
                        '</div>';
            }
            else 
            {
                return  '<div class="irk-centered">'+
                        '<div class="item irk-step-image '+consentImageClass+' positive"></div>'+
                        '<div class="irk-spacer"></div>'+
                        '<div class="irk-text-centered">'+
                        '<h2>'+consentTitle+'</h2>'+
                        '<p>'+attr.summary+'</p>'+
                        '</div>'+
                        (attr.showLearnMore && attr.showLearnMore=='false'?'':'<a class="button button-clear button-positive irk-button-learn-more" ng-click="$parent.showLearnMore()">'+consentText+'</a>')+
                        '<div class="irk-learn-more-content" ng-transclude>'+
                        '</div>'+
                        '<div class="irk-spacer"></div>'+
                        (consentType=='overview'?'<button class="button button-outline button-positive irk-button-instruction" ng-click="$parent.doNext()">Get Started</button>':'')+
                        '</div>';
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
                    '<div class="irk-text-centered">'+
                    '<h2>Sharing Options</h2>'+
                    '<p>'+attr.summary+'</p>'+
                    '<p>Sharing your coded study data more broadly (without information such as your name) may benefit this and future research.</p>'+
                    '</div>'+
                    '<a class="button button-clear button-positive irk-button-learn-more" ng-click="$parent.showLearnMore()">Learn more about data sharing</a>'+
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
.directive('irkConsentReviewStep', ['irkConsentDocument', function(irkConsentDocument) {
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
            else if (reviewType == 'name') {
                return  '<form name="form'+attr.id+'" class="irk-slider" novalidate>'+
                        '<div class="irk-centered">'+
                        '<div class="irk-text-centered">'+
                        '<h2>Consent</h2>'+
                        '<p>'+attr.text+'</p>'+
                        '</div>'+
                        '</div>'+
                        '<div class="irk-spacer"></div>'+
                        '<div ng-transclude>'+
                        '</div>'+
                        '</form>'
            }
            else if (reviewType == 'signature') {
                return  '<div class="irk-centered">'+
                        '<div class="irk-text-centered">'+
                        '<h2>Signature</h2>'+
                        '<p>Please sign using your finger on the line below.</p>'+
                        '</div>'+
                        '<div class="irk-spacer"></div>'+
                        '<div ng-transclude>'+
                        '</div>'+
                        '</div>'
            }
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step irk-form-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');

                if (stepType=='IRK-CONSENT-REVIEW-STEP' && consentType=='review' && !scope.reviewContent) {
                    var reviewType = attrs.type;
                    if (reviewType == 'review' && (!attrs.hasHtmlContent || attrs.hasHtmlContent == 'false')) {
                        scope.reviewContent = '';

                        //Add the consent title to the consent document (PDF)
                        irkConsentDocument.addConsentTitle(attrs.title);

                        var steps = angular.element(document.querySelectorAll('.irk-visual-consent-step'));
                        for (var i=0; i<steps.length; i++) {
                            var step = angular.element(steps[i]);
                            var stepTitle = step.attr('title');
                            scope.reviewContent += '<div class="irk-spacer"></div>';
                            scope.reviewContent += '<h5>'+stepTitle+'</h4>';
                            var stepContent = angular.element(steps[i].querySelector('.irk-learn-more-content'));
                            scope.reviewContent += '<div>'+stepContent.html()+'</div>';

                            //Add the consent section to the consent document (PDF)
                            irkConsentDocument.addConsentSection(stepTitle, stepContent.text());
                        };
                        
                        var container = angular.element(document.querySelector('.irk-consent-review-derived-content'));
                        container.append(scope.reviewContent);
                    }
                    else if (reviewType == 'review' && attrs.hasHtmlContent && attrs.hasHtmlContent == 'true')
                    {
                        //Add the consent title to the consent document (PDF)
                        irkConsentDocument.addConsentTitle(attrs.title);

                        //Add the consent section to the consent document (PDF)
                        var consentContent = angular.element(document.querySelector('.irk-consent-review-content'));
                        irkConsentDocument.addConsentBody(consentContent.text());
                    }
                }
            });
        }
    }
}])

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkConsentName', ['irkConsentDocument', function(irkConsentDocument) {
    return {
        restrict: 'E',
        replace: true,
        require: '^?irkConsentReviewStep',
        controller: ['$scope', '$attrs', function($scope, $attrs) {
            $scope.$parent.$parent.formData.participantTitle = $attrs.title;

            $scope.consented = function() {
                //Add the participant name to the consent document (PDF)
                irkConsentDocument.addParticipantName($scope.$parent.$parent.formData);
            }
        }],
        template: function(elem, attr) {
            return  '<div class="list">'+
                    '<label class="item item-input">'+
                    '<span class="input-label irk-form-input-label">First Name</span>'+
                    '<input type="text" placeholder="Required" ng-model="$parent.$parent.formData.participantGivenName" ng-required="true" ng-change="$parent.$parent.dirty()" ng-blur="consented()">'+
                    '</label>'+
                    '<label class="item item-input">'+
                    '<span class="input-label irk-form-input-label">Last Name</span>'+
                    '<input type="text" placeholder="Required" ng-model="$parent.$parent.formData.participantFamilyName" ng-required="true" ng-change="$parent.$parent.dirty()" ng-blur="consented()">'+
                    '</label>'+
                    '</div>'
        }
    }
}])

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkConsentSignature', ['irkConsentDocument', function(irkConsentDocument) {
    return {
        restrict: 'E',
        replace: true,
        require: '^?irkConsentReviewStep',
        controller: ['$scope', function($scope) {
            $scope.signaturePad = null;

            $scope.dirtySignature = function(isDirty) {
                var buttonClear = angular.element(document.querySelector('.irk-button-signature-clear'));
                var buttonSign = angular.element(document.querySelector('.irk-button-signature-sign'));
                buttonClear.toggleClass('ng-hide', !isDirty);
                buttonSign.toggleClass('ng-hide', isDirty);

                var next = angular.element(document.querySelectorAll('.irk-next-button'));
                if (!isDirty)
                {
                    angular.element(next[0]).attr("disabled", "disabled");
                    angular.element(next[1]).attr("disabled", "disabled");
                } 
                else 
                {
                    angular.element(next[0]).removeAttr("disabled");
                    angular.element(next[1]).removeAttr("disabled");
                }
            };

            $scope.clearSignature = function() {
                $scope.signaturePad.clear();
                $scope.$parent.$parent.formData.signature = null;
                $scope.dirtySignature(false);
            };

            $scope.saveSignature = function() {
                $scope.$parent.$parent.formData.signature = $scope.signaturePad.toDataURL();

                //Add the participant signature to the consent document (PDF)
                irkConsentDocument.addParticipantSignature($scope.$parent.$parent.formData.signature);
            }   
        }],
        template: function(elem, attr) {
            return  '<div>'+
                    '<canvas id="signatureCanvas" class="irk-signature-canvas"></canvas>'+
                    '<a class="button button-clear button-positive irk-button-signature-clear" ng-click="clearSignature()" ng-hide="true">Clear</a>'+
                    '<a class="button button-clear button-dark irk-button-signature-sign" ng-disabled="true">Sign Here</a>'+
                    '</div>'
        },
        link: function(scope, element, attrs, controller) {            
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                //Show only for Consent Review Signature
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var consentType = step.attr('type');

                if (stepType=='IRK-CONSENT-REVIEW-STEP' && consentType=='signature') {
                    //Initially set the signature canvas
                    if (!scope.signaturePad) {
                        var canvas = document.getElementById('signatureCanvas');
                        scope.signaturePad = new SignaturePad(canvas);

                        var canvasEl = angular.element(canvas);
                        canvasEl.on('touchstart', function (e) {
                            scope.dirtySignature(true);
                        });

                        canvasEl.on('touchend', function (e) {
                            scope.saveSignature();
                        });                        
                    }

                    //Set the Next/Done state
                    if (!scope.signaturePad || scope.signaturePad.isEmpty()) {
                        scope.dirtySignature(false);
                    }
                }
            });
        }
    }
}])

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkCountdownStep', function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', '$attrs', '$interval', function($scope, $element, $attrs, $interval) {
            $scope.startCountdown = function() {
                $scope.duration = ($attrs.duration?parseInt($attrs.duration,10):5);
                $scope.countdown = $scope.duration;

                $scope.$parent.currentCountdown = $interval(function() {
                    if ($scope.countdown == 0)
                        $scope.$parent.doStepNext();
                    else
                        $scope.countdown--;
                }, 1000, $scope.duration+1);
            }   
        }],
        template: function(elem, attr) {
            return  '<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                    '<p>Starting activity in</p>'+
                    '<div class="irk-countdown">'+
                    '<div class="irk-timer-progress-wrapper">' +
                    '   <div class="irk-timer-progress">' +
                    '       {{countdown}}' +
                    '   </div>' +
                    '   <div round-progress max="duration" current="countdown" clockwise="false" color="#387ef5" rounded="true" class="text-center" style="left:-25px"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div></div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                //Start the countdown
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-COUNTDOWN-STEP' && stepID==attrs.id) {
                    scope.startCountdown();
                }
            });            
        }
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkCompletionStep', function() {
    return {
        restrict: 'E',
        template: function(elem, attr) {
            return  '<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
                    '<div class="irk-text-centered">'+
                    '<h2>Activity Complete</h2>'+
                    '<p>Your data will be analyzed and you will be notified when your results are ready.</p>'+
                    (attr.link ? '<a class="button button-clear button-positive irk-button-learn-more" href="'+attr.link+'" target="_system">'+(attr.linkText ? attr.linkText : 'Learn more')+'</a>' : '')+
                    '</div>'+
                    '<div class="irk-spacer"></div>'+
                    '<div class="irk-spacer"></div>'+
                    '<div class="item irk-step-image">'+
                    '<i class="irk-completion-icon icon ion-ios-checkmark positive" ng-click="$parent.doNext()"></i>'+
                    '</div>'+
                    '<div class="irk-image-spacer"></div>'+
                    '</div></div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
        }
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkTwoFingerTappingIntervalTask', function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', '$attrs', '$interval', function($scope, $element, $attrs, $interval) {

            $scope.activeStepID;

            $scope.toggleProgressBar = function(isVisible) {
                var index = $scope.$parent.currentSlide;
                var progressEl = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-progress'));
                progressEl.toggleClass('irk-progress-started', isVisible);
            }

           $scope.startProgress = function() {
                $scope.duration = ($attrs.duration?parseInt($attrs.duration,10):20);
                $scope.progress = 0;
                $scope.toggleProgressBar(true);

                $scope.$parent.currentCountdown = $interval(function() {
                    if ($scope.progress == $scope.duration-1)
                        $scope.$parent.doStepNext();
                    else
                        $scope.progress++;
                }, 1000, $scope.duration);
            } 

            $scope.initActiveTask = function(stepID) {
                $scope.taskStarted = false;
                $scope.toggleProgressBar(false);
                $scope.activeStepID = stepID;

                $scope.tapsCount = 0;  
                $scope.$parent.formData[$scope.activeStepID] = {};
                $scope.$parent.formData[$scope.activeStepID].samples = {};
            }

            $scope.startActiveTask = function() {
                $scope.tapsStartTime = (new Date()).getTime();  
                $scope.taskStarted = true;
                $scope.startProgress();
            }

            $scope.tap = function(buttonId) {
                if (!$scope.taskStarted) {
                    $scope.startActiveTask();
                }

                var tapsCurrentTime = ((new Date()).getTime() - $scope.tapsStartTime) / 1000;  
                $scope.$parent.formData[$scope.activeStepID].samples[tapsCurrentTime] = (buttonId?buttonId:'none');
                if (buttonId) $scope.tapsCount++;
            }
        }],
        template: function(elem, attr) {
            return  '<div class="irk-centered">'+
                    '<div class="irk-text-centered">'+
                    '<h2>' + (attr.text ? attr.text : 'Tap the buttons as quickly as you can using two fingers.') + '</h2>'+
                    '<progress class="irk-progress" max="{{duration}}" value="{{progress}}"></progress>'+
                    '<div class="irk-spacer"></div>'+
                    '<h4>Total Taps</h4>'+
                    '<h1>{{tapsCount || 0}}</h1>'+
                    '</div>'+
                    '</div>'+
                    '<div class="irk-tap-container" ng-click="tap()">'+
                    '<div class="irk-tap-button-container">'+
                    '<button class="button button-outline button-positive irk-tap-button" ng-click="tap(\'button 1\');$event.stopPropagation()">Tap</button>'+
                    '<button class="button button-outline button-positive irk-tap-button" ng-click="tap(\'button 2\');$event.stopPropagation()">Tap</button>'+
                    '</div>'+
                    '</div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-TWO-FINGER-TAPPING-INTERVAL-TASK' && stepID==attrs.id) {
                    scope.initActiveTask(stepID);
                }
            });            
        }
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkAudioTask', function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', '$attrs', '$interval', '$cordovaMedia', '$cordovaFile', '$ionicPopup', function($scope, $element, $attrs, $interval, $cordovaMedia, $cordovaFile, $ionicPopup) {

            $scope.activeStepID;
            $scope.audioSample;
            $scope.audioDisabled;
            $scope.audioActive;
            $scope.audioActivity;
            $scope.audioTimer = ' ';

            $scope.initActiveTask = function(stepID) {
                $scope.activeStepID = stepID;
                $scope.audioActive = false;
                $scope.duration = ($attrs.duration?parseInt($attrs.duration,10):10);

                if (!$scope.$parent.formData[$scope.activeStepID] || !$scope.$parent.formData[$scope.activeStepID].fileURL) {
                    $scope.$parent.formData[$scope.activeStepID] = {};
                    $scope.audioSample = null;
                    if (!$attrs.autoRecord || $attrs.autoRecord=="true") $scope.recordAudio();
                } else {
                    $scope.queueAudio();
                }
            }

            $scope.queueAudio = function() {
                if ($scope.$parent.formData[$scope.activeStepID].fileURL) {
                    var audioFileURL = $scope.$parent.formData[$scope.activeStepID].fileURL;
                    if (ionic.Platform.isAndroid()) {
                        $scope.audioSample = $cordovaMedia.newMedia(cordova.file.externalRootDirectory + audioFileURL);
                    } else {
                        $scope.audioSample = $cordovaMedia.newMedia("documents://" + audioFileURL);
                    }                    
                }
            }

            $scope.recordAudio = function() {
                var audioFileDirectory = (ionic.Platform.isAndroid() ? cordova.file.externalRootDirectory : cordova.file.documentsDirectory);
                var audioFileName = "irk-sample" + (new Date().getTime()) + (ionic.Platform.isAndroid() ? ".amr" : ".wav");
                $scope.$parent.formData[$scope.activeStepID].fileURL = audioFileName;
                $scope.$parent.formData[$scope.activeStepID].contentType = "audio/" + (ionic.Platform.isAndroid() ? "amr" : "wav");
                //var audioFileName = "irk-sample" + (new Date().getTime()) + ".m4a";
                //$scope.$parent.formData[$scope.activeStepID].fileURL = "documents://" + audioFileName;
                //$scope.$parent.formData[$scope.activeStepID].contentType = "audio/m4a";

                if (ionic.Platform.isAndroid()) {
                    $scope.audioSample = $cordovaMedia.newMedia(audioFileDirectory + audioFileName);
                } else {
                    $scope.audioSample = $cordovaMedia.newMedia("documents://" + audioFileName);
                }

                // Record audio
                $scope.progress = $scope.duration;
                $scope.updateTimer();
                $scope.audioSample.startRecord();
                $scope.audioActive = true;
                $scope.audioActivity = "Recording";
                console.log('Audio recording started');

                // Show timer
                $scope.$parent.currentCountdown = $interval(function() {
                    $scope.progress--;
                    $scope.updateTimer();
                    if ($scope.progress==0) {
                        $scope.audioSample.stopRecord();
                        $scope.audioActive = false;
                        console.log('Audio recording stopped');
                        if (!$attrs.autoComplete || $attrs.autoComplete=="true") $scope.$parent.doStepNext();
                    }
                }, 1000, $scope.duration);

                /*
                $scope.audioSample = new Media(audioFileName, 
                // success callback
                function() {
                    console.log("recordAudio():Audio Success");

                    // Record audio
                    $scope.progress = $scope.duration;
                    $scope.updateTimer();
                    $scope.audioSample.startRecord();
                    $scope.audioActive = true;
                    $scope.audioActivity = "Recording";
                    console.log('Audio recording started');

                    // Show timer
                    $scope.$parent.currentCountdown = $interval(function() {
                        $scope.progress--;
                        $scope.updateTimer();

                        if ($scope.progress==0) {
                            $scope.audioSample.stopRecord();
                            $scope.audioActive = false;
                            console.log('Audio recording stopped');
                            if (!$attrs.autoComplete || $attrs.autoComplete=="true") $scope.$parent.doStepNext();
                        }
                    }, 1000, $scope.duration);

                },
                // error callback
                function(err) {
                    console.log("recordAudio():Audio Error: "+ err.code);
                    $scope.killAudio();
                    $scope.audioDisabled = true;
                    $scope.$parent.formData[$scope.activeStepID] = {};

                    var audioPopup = $ionicPopup.alert({
                        title: 'Audio Recording Disabled',
                        template: 'Please go to your Settings and allow the app access to the Microphone.'
                    });

                    audioPopup.then(function(res) {
                        console.log("recordAudio():Audio Error Alerted");
                    });
                });
                */
            }

            $scope.playAudio = function() {
                if ($scope.audioSample) {
                    // Play audio
                    $scope.progress = 0;
                    $scope.updateTimer();
                    $scope.audioSample.setVolume(1.0);
                    $scope.audioSample.play();
                    $scope.audioActive = true;
                    $scope.audioActivity = "Playing";
                    console.log('Audio playback started');

                    // Show timer
                    $scope.$parent.currentCountdown = $interval(function() {
                        if ($scope.progress==$scope.duration) {
                            $scope.audioSample.stop();
                            $scope.audioActive = false;
                            console.log('Audio playback stopped');
                        }
                        $scope.progress++;
                        $scope.updateTimer();
                    }, 1000, $scope.duration+1);
                }
            }

            $scope.updateTimer = function() {
                var minutes = Math.floor($scope.progress / 60);
                var seconds = $scope.progress - minutes * 60;
                $scope.audioTimer = minutes + ':' + (seconds<10?'0':'') + seconds;
            }

            $scope.killAudio = function() {
                if ($scope.audioSample) {
                    $scope.audioSample.stopRecord();
                    $scope.audioSample.stop();
                    $scope.audioSample.release();
                    $scope.audioActive = false;
                    $scope.audioSample = null;
                    console.log('Audio task aborted');
                }
            }

            document.addEventListener("pause", $scope.killAudio, false);
            document.addEventListener("resume", $scope.queueAudio, false);
            $scope.$on('$destroy', function () {
                document.removeEventListener("pause", $scope.killAudio);
                document.removeEventListener("resume", $scope.queueAudio);
            });                  

        }],
        template: function(elem, attr) {
            return  '<div class="irk-centered">'+
                    '<div class="irk-text-centered">'+
                    '<h2>' + (attr.text ? attr.text : 'Your more specific voice instruction goes here. For example, say \'Aaaah\'.') + '</h2>'+
                    '</div>'+
                    '<div class="irk-audio-button-container" ng-show="audioActive">'+
                    '<ion-spinner icon="lines" class="spinner-positive irk-spinner-audio-task"></ion-spinner>' + 
                    '<h4 class="dark">{{audioActivity}} Audio</h4>'+
                    '<h4 class="dark">{{audioTimer}}</h4>'+
                    '</div>'+
                    '<div class="irk-audio-button-container" ng-hide="audioActive">'+
                    '<button class="button button-outline button-positive irk-audio-button irk-button-audio-record icon ion-android-microphone" ng-click="recordAudio()" ng-disabled="audioDisabled"></button>'+
                    '<button class="button button-outline button-positive irk-audio-button irk-button-audio-play icon ion-play" ng-click="playAudio()" ng-disabled="!audioSample"></button>'+
                    '</div>'+
                    '</div>'+
                    '<ion-footer-bar class="irk-bottom-bar" keyboard-attach irk-audio-bar>'+
                    '<div>'+
                    ((attr.autoComplete && attr.autoComplete=="false")?'<a class="button button-block button-outline button-positive irk-bottom-button irk-button-step-next" ng-click="$parent.doNext()" ng-disabled="!audioSample || audioActive">Next</a>':'')+
                    ((attr.optional && attr.optional=="true")?'<a class="button button-block button-clear button-positive irk-bottom-button irk-button-step-skip" ng-click="$parent.doSkip()" ng-disabled="audioSample || audioActive">Skip this task</a>':'')+
                    '</div>'+
                    '</ion-footer-bar>'

        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-AUDIO-TASK' && stepID==attrs.id) {
                    scope.initActiveTask(stepID);
                }

                // Stop and release any audio resources on slide change
                if (stepType!='IRK-AUDIO-TASK' && scope.audioSample) {
                    scope.killAudio()
                }
            });      
        }
    }
})


//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkImageTask', function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', '$attrs', '$interval', '$cordovaCamera', function($scope, $element, $attrs, $cordovaCamera) {

            $scope.activeStepID;

            $scope.initActiveTask = function(stepID) {
                $scope.activeStepID = stepID;
                console.log("Initiating Image Capture Task");
                
            }

            $scope.takePicture = function() {
                
                
                var options = { 
                quality : 75, 
                destinationType : Camera.DestinationType.FILE_URI, 
                sourceType : Camera.PictureSourceType.CAMERA, 
                allowEdit : true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            navigator.camera.getPicture(function(imageURI) {
                //console.log("ImageURI: " + imageURI);
                $scope.$parent.formData[$scope.activeStepID] = {};
                $scope.$parent.formData[$scope.activeStepID].fileURL = imageURI
                $scope.$apply(function() {
                    $scope.imageData = imageURI;
                });
                $scope.$parent.doStepNext();
            }, function(err) {
                // An error occured. Show a message to the user
                console.log("Cordova Camera error: "+ err);
            }, options);
         }

            
        }],
        template: function(elem, attr) {
            return  '<div class="irk-centered">'+
                    '<div class="irk-text-centered">'+
                    '<h2>' + (attr.text ? attr.text : 'More detailed instructions here. Take a picture.') + '</h2>'+
                    '<div class="irk-preview">' +
                    '<img ng-show="imageData !== undefined" ng-src="{{imageData}}">'+
                    '</div>' +
                    '</div>'+
                    '<div class="irk-image-button-container">'+
                    '<button class="button button-outline button-positive irk-image-button icon ion-android-camera" ng-click="takePicture()"></button>'+
                    '</div>'+
                    //'<button class="button button-outline button-positive irk-image-button irk-button-audio-play icon ion-play" ng-click="playAudio()" ng-disabled="!audioSample"></button>'+
                    //'<button class="button" ng-click="takePicture()">Take Picture</button>' +
                    '</div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-IMAGE-TASK' && stepID==attrs.id) {
                    console.log("Initiating Image Task")
                    scope.initActiveTask(stepID);
                }
            });             
        }
    }
})


//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkVideoCaptureTask', function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', '$attrs', '$interval', '$cordovaCapture', function($scope, $element, $attrs, $cordovaCapture) {

            $scope.activeStepID;

            $scope.initActiveTask = function(stepID) {
                $scope.activeStepID = stepID;
                $scoe.isSaved = false;
                console.log("Initiating Video Capture Task");
                
            }

            $scope.captureVideo = function() {

              var options = { limit: 1, duration: 15 };
              
              navigator.device.capture.captureVideo(function(videoData) {
                $scope.$parent.formData[$scope.activeStepID] = {};
                $scope.$parent.formData[$scope.activeStepID].fileURL = videoData
                $scope.$apply(function() {
                  $scope.isSaved = true;
                  $scope.videoSrc = videoData;
                });
                $scope.$parent.doStepNext();
                }, function(err) {
                  console.log("Cordova Capture video error: "+ err);
                }, options);
              }

            
        }],
        template: function(elem, attr) {
            return  '<div class="irk-centered">'+
                    '<div class="irk-text-centered">'+
                    '<h2>' + (attr.text ? attr.text : 'More detailed instructions here. Take a video.') + '</h2>'+
                    '<div class="irk-preview">' +
                    '<p ng-show="isSaved"> Your video has been saved. </p>' + 
                    //'<video ng-show="videoSrc !== undefined" ng-src="{{videoSrc}} type=video/mp4">'+
                    '</div>' +
                    '</div>'+
                    '<div class="irk-image-button-container">'+
                    '<button class="button button-outline button-positive irk-image-button icon ion-ios-videocam" ng-click="captureVideo()"></button>'+
                    '</div>'+
                    '</div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');
            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-VIDEO-CAPTURE-TASK' && stepID==attrs.id) {
                    console.log("Initiating Video Capture Task")
                    scope.initActiveTask(stepID);
                }

               
           });             
        }
    }
})

//======================================================================================
// Usage: 
// The span (that is, the length of the pattern sequence) is automatically varied during the task, 
// increasing after successful completion of a sequence, and decreasing after failures, in the range 
// from minimumSpan to maximumSpan. The playSpeed property lets you control the speed of sequence 
// playback, and the customTargetImage property lets you customize the shape of the tap target.
// The game finishes when either maxTests tests have been completed, or the user has made 
// maxConsecutiveFailures errors in a row.
// =====================================================================================

.directive('irkSpatialMemoryTask', function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', '$attrs', '$interval', function($scope, $element, $attrs, $interval) {

            $scope.activeStepID;

            $scope.tileState = {
                QUIESCENT: 0,
                CORRECT : 1,
                INCORRECT: 2,
                UNCLICKABLE: 3
            };

            $scope.state = {
                INPROGRESS: 0,
                SUCCEEDED: 1,
                FAILED: 2,
                PLAYBACK: 3,
            }

            $scope.initActiveTask = function(stepID) {
                $scope.taskStarted = false;
                // Play Speed
                $scope.playDelay = $attrs.playSpeed? $attrs.playSpeed:1000;
                // Maximum tests or failures
                $scope.maxConsecutiveFailures = $attrs.maxConsecutiveFailures? $attrs.maxConsecutiveFailures:2;
                // Test count
                $scope.consecutiveFailures = 0;

                $scope.activeStepID = stepID;
                $scope.sequence = [];
                $scope.gameBoard = [];
                $scope.gameState = [];
                $scope.$parent.formData[$scope.activeStepID] = {};
                // Max and Min span

                $scope.maxSpan = $attrs.maximumSpan? $attrs.maximumSpan:3;
                $scope.minSpan = $attrs.minimumSpan? $attrs.minimumSpan:2;

                $scope.$parent.formData[$scope.activeStepID].maxSpan = $scope.maxSpan;
                $scope.$parent.formData[$scope.activeStepID].minSpan = $scope.minSpan;

                $scope.currentSpan = $scope.minSpan;
                $scope.initializeGame($scope.maxSpan);
                //$scope.$parent.formData[$scope.activeStepID].samples = {};
                $scope.boardSize = Math.ceil(Math.sqrt($scope.currentSpan))
                $scope.generateSequence($scope.boardSize);
                $scope.currentCount = 0;
                // Current state of game
                $scope.currentGameState = $scope.state.PLAYBACK;
                setTimeout(function () { $scope.playSequence(0,null); }, 500);
            }

             $scope.initializeGame = function(gameSize){
                for(i=0;i<gameSize;i++)
                {
                  // Fill an array of ids
                  $scope.gameBoard.push([]);
                  for(j=0;j<gameSize;j++)
                  {
                    $scope.gameBoard[i].push(i*gameSize + j);
                    $scope.gameState.push($scope.tileState.UNCLICKABLE);
                  }
                  // In template, create a button for each ID
                }

            }

            $scope.replayGame = function(){
                $scope.sequence = [];
                $scope.gameBoard = [];
                $scope.gameState = [];
               
                console.log("End game state: " + $scope.currentGameState);
                if($scope.currentGameState == $scope.state.FAILED)
                {
                    $scope.consecutiveFailures+=1;
                    if($scope.consecutiveFailures == $scope.maxConsecutiveFailures)
                    {
                        // Failed too many times
                        //if($scope.currentSpan != $scope.minSpan)
                        $scope.$parent.formData[$scope.activeStepID].highestCorrectSpan = $scope.currentSpan-1;
                        $scope.$parent.doStepNext();
                    }
                }
                else if ($scope.currentGameState == $scope.state.SUCCEEDED)
                {
                    if($scope.currentSpan < $scope.maxSpan){
                        $scope.currentSpan+=1;
                    }
                    else{
                        $scope.$parent.formData[$scope.activeStepID].highestCorrectSpan = $scope.currentSpan;
                        $scope.$parent.doStepNext();
                    }
                    $scope.consecutiveFailures =0;
                }
                $scope.initializeGame($scope.currentSpan);
                $scope.generateSequence();
                $scope.currentCount = 0;
                // Current state of game
                $scope.currentGameState = $scope.state.PLAYBACK;
                setTimeout(function () { $scope.playSequence(0,null); }, 500);
            }

            $scope.generateSequence = function(){
                numTiles = $scope.boardSize * $scope.boardSize;
                for(i=0; i <numTiles; i++)
                {
                    // create enum and then push states?
                    $scope.sequence.push(i);
                }

                for (i = 0; i < numTiles; i++) {
                   rand_i = Math.floor(Math.random() * (numTiles));
                   tmp = $scope.sequence[i];
                   $scope.sequence[i] = $scope.sequence[rand_i];
                   $scope.sequence[rand_i] = tmp;
                }
                console.log($scope.sequence);
            }

            $scope.handleClick = function(tileID){
                if($scope.sequence[$scope.currentCount] == tileID)
                    $scope.gameState[tileID] = $scope.tileState.CORRECT;
                else{
                    for(i = 0; i < $scope.currentSpan*$scope.currentSpan; i++)
                    {
                        if($scope.gameState[i] == $scope.tileState.QUIESCENT)
                            $scope.gameState[i] = $scope.tileState.UNCLICKABLE;
                    }
                    $scope.gameState[tileID] = $scope.tileState.INCORRECT;
                    $scope.currentGameState = $scope.state.FAILED;
                }
                $scope.currentCount += 1;
                if($scope.currentCount == $scope.currentSpan)
                    $scope.currentGameState = $scope.state.SUCCEEDED;
            }

            $scope.playSequence = function(index, previousIndex){
                if(previousIndex != null)
                {
                    previousTile = $scope.sequence[previousIndex];
                    $scope.$apply(function() {
                    // Consider returning it to unclickable and then changing all to quiescent at the end
                     $scope.gameState[previousTile] = $scope.tileState.UNCLICKABLE;
                    });
                }
                if(index >= $scope.currentSpan){
                    $scope.$apply(function() {
                    for(i = 0; i < $scope.currentSpan*$scope.currentSpan; i++)
                    {
                        $scope.gameState[i] = $scope.tileState.QUIESCENT;
                    }
                        $scope.currentGameState = $scope.state.INPROGRESS;
                    });
                    return;
                }
                tile = $scope.sequence[index];
                $scope.$apply(function() {
                     $scope.gameState[tile] = $scope.tileState.CORRECT;
                    });
                setTimeout(function () {
                    $scope.playSequence(index+1,index); }, $scope.playDelay);
            }
            $scope.headerText = function(){
                if($scope.currentGameState == $scope.state.PLAYBACK)
                    return "Watch the squares light up";
                else if ($scope.currentGameState == $scope.state.INPROGRESS)
                    return "Tap the squares in the order they lit up";
                else if ($scope.currentGameState == $scope.state.SUCCEEDED)
                    return "Congratulations! Hit next to continue.";
                else
                    return "Try Again"
            }
            $scope.tileClass = function(state){
                if(state == $scope.tileState.INCORRECT){
                    return "irk-spatial-tile-incorrect";
                }
                else if(state == $scope.tileState.CORRECT)
                    return "irk-spatial-tile-correct";
                else   
                    return "irk-spatial-tile-quiescent";

            }
        }],
        template: function(elem, attr) {
            return  '<div class="irk-centered">'+
                    '<div class="irk-text-centered">'+
                    '<h2 ng-bind= headerText()></h2>'+
                    '<div class="irk-spacer"></div>'+
                    '<div class="irk-spatial-container id="irk-spatial-container>' +
                    '<p ng-show="currentGameState===state.FAILED">You did not quite make it through this time. Tap Next to continue.</p>'+
                    '<div class="irk-spatial-game-row" ng-repeat = "rows in gameBoard">'+
                    '<button ng-repeat="tile in rows" ng-Click="gameState[tile]!==tileState.QUIESCENT || handleClick(tile)"  ng-class="tileClass(gameState[tile])"></button>'+
                    '</div>'+
                    '</div>'+
                    '</div>'+
                    '<div class="irk-spacer"></div>'+
                    '<button ng-show="currentGameState===state.FAILED || currentGameState===state.SUCCEEDED" class="button irk-small-button button-outline button-positive irk-button-step-next irk-next-button" ng-click="replayGame()">Next</button>' +
                    '</div>'
                    /*'<div class = "irk-spatial-score-container">' +
                    '<h4>Squares</h4>'+
                    '<div> {{currentSpan}}</div>' +
                    '</div>'+
                    '</div>'*/
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-SPATIAL-MEMORY-TASK' && stepID==attrs.id) {
                    scope.initActiveTask(stepID);
                }
            });            
        }
    }
})

//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkGaitBalanceTask', function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', '$attrs', '$interval', '$cordovaDeviceMotion', function($scope, $element, $attrs, $interval, $cordovaDeviceMotion) {

            $scope.activeStepID;

            $scope.initActiveTask = function(stepID) {
                $scope.activeStepID = stepID;
                 
                // acceleration
                $scope.$parent.formData[$scope.activeStepID] = {};
                $scope.$parent.formData[$scope.activeStepID].firstLegAccel=[];
                $scope.$parent.formData[$scope.activeStepID].secondLegAccel=[];
                $scope.$parent.formData[$scope.activeStepID].restingLeg=[];

                // stepcount
                $scope.$parent.formData[$scope.activeStepID].firstLegSteps=[];
                $scope.$parent.formData[$scope.activeStepID].secondLegSteps=[];
                

                // Is Pedometer Available?
                $scope.pedometerAvailable = false;
                if(ionic.Platform.isAndroid())
                {
                    try{
                        stepcounter.deviceCanCountSteps(function(isAvailable){
                            $scope.pedometerAvailable = isAvailable;
                        }, function(){
                            console.log("Error with Android step counter.");
                        });
                    }
                    catch(error){

                    }
                }
                else
                {
                    // Temporarily no iOS support for step counting.
                    $scope.pedometerAvailable = false;
                }

                
                // pedometer.isStepCountingAvailable(successCallback, failureCallback);
                $scope.numSteps = $attrs.numSteps?$attrs.numSteps:20;
                $scope.distanceInMeters = $attrs.distanceInMeters?$attrs.distanceInMeters:10;
                $scope.stepDuration = $attrs.stepDuration?$attrs.stepDuration:5;
                $scope.restDuration = $attrs.restDuration?$attrs.restDuration:10;
                
                $scope.stepCount = 0;
                $scope.countdownTime = 5;
                $scope.startCountdown();
                
                $scope.stepCounterOffset = 0;
                $scope.instructions = null;
                $scope.timer = null;
            }

            $scope.textToSpeech = function(instruction, callback){
                var instruct = instruction;
                window.TTS
                    .speak({
                        text: instruct,
                        locale: 'en-US',
                        rate: 1.00
                    }, callback, callback);
            }

            

             $scope.startCountdown = function() {
                $scope.currentTimer = $interval(function() {
                    if ($scope.countdownTime == 0)
                    {
                        $interval.cancel($scope.currentTimer);
                        $scope.instructions = "Walk up to " + $scope.numSteps + " steps in a straight line.";
                        $scope.textToSpeech($scope.instructions, $scope.trackFirstLeg);
                    }
                    else{
                        $scope.countdownTime -=1;
                    }
                }, 1000);
            } 

            // onsuccess if stepcount = whatever then do whatever

            $scope.endLegCondition = function(progress)
            {
                if($scope.pedometerAvailable)
                {
                    // relelvant only for android
                    stepcounter.getStepCount(function(count){
                        //console.log("Getting step count: " + count);
                        $scope.stepCount = count;
                    }, function(){
                        console.log("Error in step counter");
                    });

                    // make sure this is syncrhonous
                    if($scope.stepCount >= $scope.numSteps)
                    {
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return (progress == $scope.stepDuration);
                }
            }


            $scope.startStepCounter = function() {
                if($scope.pedometerAvailable){
                    stepcounter.start($scope.stepCounterOffset, function(message){
                            console.log(message);
                        }, function(){
                            console.log("Failed to start Android step counter.");
                        });
                }
            }

            $scope.stopStepCounter = function() {
                if($scope.pedometerAvailable){
                    stepcounter.stop(function(message){
                            console.log("Stopped Android Step Counter.");
                        }, function(){
                            console.log("Failed to stop Android step counter.");
                        });
                }
            }
            $scope.trackFirstLeg = function()
            {
                $scope.stepCount = 0;
                
                if(!ionic.Platform.isAndroid() && $scope.pedometerAvailable)
                {
                    var successHandler = function (pedometerData) {
                        $scope.stepCount = pedometer.numberOfSteps;
                        $scope.updateAcceleration($scope.$parent.formData[$scope.activeStepID].firstLegAccel,
                                                    $scope.$parent.formData[$scope.activeStepID].firstLegSteps);
                        
                        if($scope.stepCount >= $scope.numSteps)
                         {
                            $scope.instructions = "Turn around, and walk back to where you started.";
                            pedometer.stopPedometerUpdates(function(){}, function(){
                                console.log("Failed to stop Pedometer.");
                            });
                            $scope.textToSpeech($scope.instructions, $scope.trackSecondLeg);
                         }
                         pedometer.startPedometerUpdates(successHandler, onError);
                    };

                }
                else
                {
                    $scope.startStepCounter();
                    var progress = 0;
                    $scope.currentTimer=$interval(function() {
                    if(!$scope.pedometerAvailable)
                    {
                        $scope.timer = $scope.stepDuration-progress;
                    }
                    if ($scope.endLegCondition(progress))
                    {
                        $interval.cancel($scope.currentTimer);
                        $scope.stopStepCounter();
                        $scope.instructions = "Turn around, and walk back to where you started.";
                        $scope.textToSpeech($scope.instructions, $scope.trackSecondLeg);
                    }
                    else{
                        $scope.updateAcceleration($scope.$parent.formData[$scope.activeStepID].firstLegAccel,
                                                    $scope.$parent.formData[$scope.activeStepID].firstLegSteps);
                        progress++;
                    }
                }, 1000);
                }
            }

            $scope.trackSecondLeg = function()
            {
                $scope.stepCount = 0;
                if(!ionic.Platform.isAndroid() && $scope.pedometerAvailable)
                {
                    var successHandler = function (pedometerData) {
                        $scope.stepCount = pedometer.numberOfSteps;
                        $scope.updateAcceleration($scope.$parent.formData[$scope.activeStepID].firstLegAccel,
                                                    $scope.$parent.formData[$scope.activeStepID].firstLegSteps);
                        
                        if($scope.stepCount >= $scope.numSteps)
                         {
                            $scope.instructions = "Stand still for " + $scope.restDuration + " seconds.";
                            pedometer.stopPedometerUpdates(function(){}, function(){
                                console.log("Failed to stop Pedometer.");
                            });
                            $scope.textToSpeech($scope.instructions, $scope.trackRestingLeg);
                         }
                         pedometer.startPedometerUpdates(successHandler, onError);
                    };

                }
                else
                {
                    $scope.startStepCounter();
                    var progress = 0;
                    $scope.currentTimer = $interval(function() {
                    if(!$scope.pedometerAvailable)
                    {
                        $scope.timer = $scope.stepDuration-progress;
                    }
                    if ($scope.endLegCondition(progress))
                    {
                        $interval.cancel($scope.currentTimer);
                        $scope.stopStepCounter();
                        $scope.instructions = "Stand still for " + $scope.restDuration + " seconds.";
                        $scope.textToSpeech($scope.instructions, $scope.trackRestingLeg);
                    }
                    else{
                        $scope.updateAcceleration($scope.$parent.formData[$scope.activeStepID].secondLegAccel,
                                                    $scope.$parent.formData[$scope.activeStepID].secondLegSteps);
                        progress++;
                    }
                }, 1000);
                }
            }

            $scope.trackRestingLeg = function()
            {
                    var progress = 0;
                    $scope.currentTimer = $interval(function() {
                    //$scope.$apply(function() {
                        $scope.timer = $scope.restDuration-progress;
                   // });
                    if (progress == $scope.restDuration)
                    {
                        $interval.cancel($scope.currentTimer);
                        $scope.textToSpeech("Activity Completed!", function(){});
                        $scope.$parent.doStepNext();
                    }
                    else{
                        $scope.updateAcceleration($scope.$parent.formData[$scope.activeStepID].restingLeg, null);
                        progress++;
                    }
                }, 1000);
            }

            $scope.updateAcceleration = function(accelList, stepsList){
                $cordovaDeviceMotion.getCurrentAcceleration().then(function(result) {
                  var X = result.x;
                  var Y = result.y;
                  var Z = result.z;
                  var timeStamp = result.timestamp;
                  if(stepsList && $scope.pedometerAvailable)
                  {
                    var stepCount = $scope.stepCount;
                    stepsList.push({
                        'steps': stepCount,
                        'time': timeStamp,
                    });
                  }
                  accelList.push({
                    'x': X,
                    'y': Y,
                    'z': Z,
                    'time': timeStamp,
                  });
                }, function(err) {
                  console.log("Error in acceleration tracking " + err);
                });
            }

            $scope.secondsToMinutesSeconds = function(seconds){
                var minutes = Math.floor(seconds/60);
                var seconds = seconds%60;
                if(seconds < 10)
                    seconds = '0' + seconds;
                return ''+minutes+':'+seconds;
            }

        }],
        template: function(elem, attr) {
            return  '<div class="irk-centered">'+
                    '<div class="irk-text-centered">'+
                    '<h2 ng-show="countdownTime>0">Starting activity in <br></br>{{countdownTime}}</h2>'+
                    '<h1 ng-show="instructions">{{instructions}}</h1>'+
                    '<irk-spacer></irk-spacer>' + 
                    '<div ng-show="timer">'+
                    '{{secondsToMinutesSeconds(timer)}}'+
                    '</div>'+
                    '</div>'+
                    '</div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-GAIT-BALANCE-TASK' && stepID==attrs.id) {
                    scope.initActiveTask(stepID);
                }
            });            
        }
    }
})


//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkFitnessTask', function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', '$attrs', '$interval', '$cordovaDeviceMotion', function($scope, $element, $attrs, $interval, $cordovaDeviceMotion) {

            $scope.activeStepID;

            $scope.initActiveTask = function(stepID) {
                $scope.activeStepID = stepID;
                 
                // acceleration
                $scope.$parent.formData[$scope.activeStepID] = {};
                $scope.$parent.formData[$scope.activeStepID].acceleration=[];
                
                

                
                // pedometer.isStepCountingAvailable(successCallback, failureCallback);
                // stepcounter.deviceCanCountSteps() 
                $scope.duration = $attrs.duration?$attrs.duration:300;
            
                $scope.distanceInMeters = 0;
                $scope.trackWalk();
                
                $scope.timer = null;
            }


            $scope.calculateDistance = function(lat1, lon1, lat2, lon2) {
              var R = 6371; // km
              var dLat = (lat2 - lat1).toRad();
              var dLon = (lon2 - lon1).toRad(); 
              var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
              var d = R * c;
              return d;
            }

            Number.prototype.toRad = function() {
              return this * Math.PI / 180;
            }


            $scope.trackWalk = function()
            {

                navigator.geolocation.watchPosition(function(position) {
                    $scope.distanceInMeters +=
                    $scope.calculateDistance(startPos.coords.latitude, startPos.coords.longitude,
                        position.coords.latitude, position.coords.longitude);
                });

                var progress = 0;
                $scope.currentTimer=$interval(function() {
                $scope.timer = $scope.duration-progress;
                if (progress==$scope.duration)
                {
                    $interval.cancel($scope.currentTimer);
                    $scope.$parent.formData[$scope.activeStepID].distance=$scope.distanceInMeters;
                    $scope.$parent.doStepNext();
                }
                else{
                    $scope.updateAcceleration($scope.$parent.formData[$scope.activeStepID].firstLegAccel,
                                                $scope.$parent.formData[$scope.activeStepID].firstLegSteps);
                    progress++;
                    }
                }, 1000);
            }
            


            $scope.updateAcceleration = function(accelList, stepsList){
                $cordovaDeviceMotion.getCurrentAcceleration().then(function(result) {
                  var X = result.x;
                  var Y = result.y;
                  var Z = result.z;
                  var timeStamp = result.timestamp;
                  acelList.push({
                    'x': X,
                    'y': Y,
                    'z': Z,
                    'time': timeStamp,
                  });
                }, function(err) {
                  console.log("Error in acceleration tracking " + err);
                });
            }

            $scope.secondsToMinutesSeconds = function(seconds){
                var minutes = Math.floor(seconds/60);
                var seconds = seconds%60;
                if(seconds < 10)
                    seconds = '0' + seconds;
                return ''+minutes+':'+seconds;
            }

        }],
        template: function(elem, attr) {
            return  '<div class="irk-centered">'+
                    '<div class="irk-text-centered">'+
                    '<h1 ng-show="instructions">{{instructions}}</h1>'+
                    '<irk-spacer></irk-spacer>' + 
                    '<div class="irk-fitness-distance">'+
                    '<h2> Distance Traveled </h2>' +
                    '<h4 class="irk-fitness-meters">{{distanceInMeters}} (m)</h4>'+
                    '</div>'+
                    '<irk-spacer></irk-spacer>' + 
                    '<div ng-show="timer">'+
                    '<h3 class="irk-fitness-time">{{secondsToMinutesSeconds(timer)}}</h3>'+
                    '</div>'+
                    '</div>'+
                    '</div>'
        },
        link: function(scope, element, attrs, controller) {
            element.addClass('irk-step');

            scope.$on("slideBox.slideChanged", function(e, index, count) {
                var step = angular.element(document.querySelectorAll('.irk-slider-slide')[index].querySelector('.irk-step'));
                var stepType = step.prop('tagName');
                var stepID = step.attr('id');

                if (stepType=='IRK-FITNESS-TASK' && stepID==attrs.id) {
                    scope.initActiveTask(stepID);
                }
            });            
        }
    }
})