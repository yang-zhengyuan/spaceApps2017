'use strict';

(function() {

  class MainController {

    constructor($http, $timeout) {
      this.$http = $http;
      this.$timeout = $timeout;
      this.awesomeThings = [];
      this.habits = {
        computer: 1,
        cooking: 1,
        entertainment: 1
      }
      this.location = "Berkeley, CA";
      this.firstTime = true;
    }

    $onInit() {
      this.$http.get('/api/things')
        .then(response => {
          this.awesomeThings = response.data;
        });
    }
    solarConnect(){
      let that = this;
      this.firstTime = false;
      this.connecting = true;

      this.$timeout( ()=> {
        this.connecting = false;
        this.connected = true;
      },2500);
    }
    addThing() {
      if (this.newThing) {
        this.$http.post('/api/things', {
          name: this.newThing
        });
        this.newThing = '';
      }
    }

    deleteThing(thing) {
      this.$http.delete('/api/things/' + thing._id);
    }
  }

  angular.module('sunUpApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController,
      controllerAs: 'vm'
    });
})();
