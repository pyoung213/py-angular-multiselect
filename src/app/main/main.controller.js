(function () {
    'use strict';

    angular
        .module('pyAngularMultiselect')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($timeout, $http, webDevTec, toastr, $scope) {
        var vm = this;

        vm.awesomeThings = [];
        vm.classAnimation = '';
        vm.creationDate = 1439826955348;
        vm.showToastr = showToastr;

        activate();

        function activate() {
            getWebDevTec();
            $timeout(function () {
                vm.classAnimation = 'rubberBand';
            }, 4000);
        }

        $scope.refreshList = refreshList;

        function refreshList(searchTerm) {

            return $http.jsonp("https://ajax.googleapis.com/ajax/services/search/web?v=1.0", {
                params: {
                    'callback': 'JSON_CALLBACK',
                    'q': searchTerm
                }
            })
                .then(function (data) {
                    console.log('got data', data.data.responseData.results);

                    return data.data.responseData.results;
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

        $scope.someList = [
            {
                titleNoFormatting: "Choice1"
            },
            {
                titleNoFormatting: "Choice2"
            },
            {
                titleNoFormatting: "choiceThree"
            },
            {
                titleNoFormatting: "Choice_4"
            },
            {
                titleNoFormatting: "Choice-5"
            }
        ];

        function showToastr() {
            toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
            vm.classAnimation = '';
        }

        function getWebDevTec() {
            vm.awesomeThings = webDevTec.getTec();

            angular.forEach(vm.awesomeThings, function (awesomeThing) {
                awesomeThing.rank = Math.random();
            });
        }
    }
})();
