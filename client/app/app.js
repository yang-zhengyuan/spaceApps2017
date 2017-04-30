'use strict';

angular.module('sunUpApp', ['sunUpApp.constants', 'ngCookies', 'ngResource', 'ngSanitize',
    'ui.router', 'ngMaterial'
  ])
  .config(function($urlRouterProvider, $locationProvider, $mdThemingProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $mdThemingProvider.theme('default')
      .dark()
      .accentPalette('yellow');
  });
