// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ionicResearchKit', 'ngCordova', 'checklist-model', 'angular-svg-round-progressbar'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.steps', {
    url: '/steps',
    views: {
      'tab-steps': {
        templateUrl: 'templates/tab-steps.html',
        controller: 'StepsCtrl'
      }
    }
  })

  .state('tab.activetasks', {
    url: '/activetasks',
    views: {
      'tab-activetasks': {
        templateUrl: 'templates/tab-activetasks.html',
        controller: 'ActiveTasksCtrl'
      }
    }
  })

  .state('tab.results', {
    url: '/results',
    views: {
      'tab-results': {
        templateUrl: 'templates/tab-results.html',
        controller: 'ResultsCtrl'
      }
    }
  })

  .state('tab.document', {
    url: '/document',
    views: {
      'tab-document': {
        templateUrl: 'templates/tab-document.html',
        controller: 'DocumentCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/steps');

})

.config(function($ionicConfigProvider) {
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.tabs.position('bottom');
});
