/** 
 * Author: Nino Guba
 * Date: 08-26-2015
 * Website: gubster.com
 * Directives for ResearchKit in Ionic
 */
angular.module('ionicResearchKit',[])
//======================================================================================
// This provides a counterpart of Apple's ResearchKit for Ionic apps
// =====================================================================================


//======================================================================================
// Usage: 
// =====================================================================================
.directive('irkOrderedTasks', [
  '$timeout',
  '$compile',
  '$ionicSlideBoxDelegate',
  '$ionicHistory',
  '$ionicScrollDelegate',
  '$ionicNavBarDelegate',
function($timeout, $compile, $ionicSlideBoxDelegate, $ionicHistory, $ionicScrollDelegate, $ionicNavBarDelegate) {
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

          // Show Step x of y
          $rootScope.stepTitle = 'Step ' + (slider.currentIndex()+1) + ' of ' + slider.slidesCount();

          // Hide Step Back button on first step/slide
          $rootScope.isFirstStep = (slider.currentIndex() == 0);

          // Try to trigger a digest
          $timeout(function() {});
        },
        callback: function(slideIndex) {
          $scope.currentSlide = slideIndex;
          $scope.onSlideChanged({ index: $scope.currentSlide, $index: $scope.currentSlide});
          $scope.$parent.$broadcast('slideBox.slideChanged', slideIndex);
          $scope.activeSlide = slideIndex;

          // Show Step x of y
          $rootScope.stepTitle = 'Step ' + (slider.currentIndex()+1) + ' of ' + slider.slidesCount();

          // Hide Step Back button on first step
          $rootScope.isFirstStep = (slider.currentIndex() == 0);

          // Change Next button to Done on last step
          $rootScope.isLastStep = (slider.currentIndex() == slider.slidesCount()-1);

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
      }

      $scope.doStepBack = function() {
        console.log('Clicked back');
        slider.prev();
      }

      $scope.doStepNext = function() {
        console.log('Clicked next');
        slider.next();
      }

      $scope.doSkip = function() {
        console.log('Clicked skip');
        slider.next();
      }

    }],
    template:
            '<div class="slider irk-slider">' +
                '<div class="slider-slides irk-slider-slides" ng-transclude>' +
                '</div>' +
                '<div class="irk-bottom">' +
                '<button id="stepnext-button" class="button button-block button-outline button-positive irk-bottom-button" ng-click="doStepNext()">{{$root.isLastStep ? \'Done\' : \'Next\'}}</button>' +
                '<button id="stepskip-button" class="button button-block button-clear button-positive irk-bottom-button" ng-click="doSkip()">Skip this question</button>' +
                '</div>' +
            '</div>',

    link: function($scope, $element, $attr) {
        //Insert Header
        var stepHeader = angular.element(
            '<ion-header-bar>' +
                '<div class="buttons">' +
                    '<button id="stepback-button" class="button button-clear button-positive icon ion-ios-arrow-left" ng-click="doStepBack()" ng-hide="$root.isFirstStep"></button>' +
                '</div>' +
                '<h1 class="title">{{$root.stepTitle}}</h1>' +
                '<div class="buttons">' +
                    '<button id="stepcancel-button" class="button button-clear button-positive" ng-click="doCancel()">Cancel</button>' +
                '</div>' +
            '</ion-header-bar>'
        );
        $element.parent()[0].insertBefore(stepHeader[0], $element[0]);
        $compile(stepHeader)($scope);
    }
  };
}])

.directive('irkTask', function() {
  return {
    restrict: 'E',
    require: '^ionSlideBox',
    compile: function(element) {
      element.addClass('slider-slide irk-slider-slide');
    }
  };
})

//======================================================================================
// Usage: <irk-instruction-step title="Your title here." text="Additional text can go here." />
// =====================================================================================
.directive('irkInstructionStep', function () {
    return {
    	restrict: 'E',
        template: function(elem, attr) {
        	return 	'<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
        			'<h3>'+attr.title+'</h3>'+
        			(attr.text ? '<p>'+attr.text+'</p>' : '')+
        			'</div></div>'
        }
    }
})

//======================================================================================
// Usage: <irk-scale-question-step id="q1" title="Your question here." text="Additional text can go here." min="1" max="10" step="1" value="5" />
// =====================================================================================
.directive('irkScaleQuestionStep', function () {
    return {
    	restrict: 'E',
        template: function(elem, attr) {
        	return 	'<div class="irk-centered">'+
        			'<h3>'+attr.title+'</h3>'+
        			(attr.text ? '<p>'+attr.text+'</p>' : '')+
        			'</div>'+
        			'<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
        			'<h4>{{'+attr.id+' || \'&nbsp;\'}}</h4>'+
        			'<div class="range">'+
        			attr.min+
        			'<input type="range" name="'+attr.id+'" min="'+attr.min+'" max="'+attr.max+'" step="'+attr.step+'" value="'+attr.value+'" ng-model="'+attr.id+'">'+
        			attr.max+
        			'</div>'+
        			'</div></div>'
        }
    }
})

//======================================================================================
// Usage: <irk-boolean-question-step id="data.q1" title="Your question here." text="Additional text can go here." trueLabel="" falseLabel=""/>
// =====================================================================================
.directive('irkBooleanQuestionStep', function () {
    return {
    	restrict: 'E',
        template: function(elem, attr) {
        	return 	'<div class="irk-centered">'+
        			'<h3>'+attr.title+'</h3>'+
        			(attr.text ? '<p>'+attr.text+'</p>' : '')+
        			'</div>'+
        			'<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
        			'<div class="list">'+
        			'<label class="item item-radio">'+
        			'<input type="radio" name="'+attr.id+'">'+
        			'<div class="item-content irk-item-content">'+(attr.trueLabel?attr.trueLabel:'True')+'</div>'+
        			'<i class="radio-icon ion-checkmark"></i>'+
        			'</label>'+
        			'<label class="item item-radio">'+
        			'<input type="radio" name="'+attr.id+'">'+
        			'<div class="item-content irk-item-content">'+(attr.falseLabel?attr.falseLabel:'False')+'</div>'+
        			'<i class="radio-icon ion-checkmark"></i>'+
        			'</label>'+
        			'</div>'+
        			'</div></div>'
        }
    }
})

.directive('irkQuestionStep', function () {
    return {
    	restrict: 'E',
        template: function(elem, attr) {
        	return 	'<div class="irk-centered">'+
        			'<h3>'+attr.title+'</h3>'+
        			(attr.text ? '<p>'+attr.text+'</p>' : '')+
        			'</div>'+
        			'<div class="irk-offcentered-container"><div class="irk-offcentered-content">'+
        			'<div class="range">'+
        			attr.min+
        			'<input type="range" name="'+attr.id+'" min="'+attr.min+'" max="'+attr.max+'" step="'+attr.step+'" value="'+attr.value+'">'+
        			attr.max+
        			'</div>'+
        			'</div></div>'
        }
    }
})
