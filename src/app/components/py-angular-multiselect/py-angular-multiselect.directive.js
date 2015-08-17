(function () {
    'use strict';

    angular
        .module('py-angular-multiselect', [])
        .directive('pyAngularMultiselect', pyAngularMultiselect)
        .controller('pyAngularMultiselectController', pyAngularMultiselectController);

    /* @ngInject */
    function pyAngularMultiselect() {
        var directive = {
            restrict: 'E',
            scope: {
                placeholder: '@',
                selected: '=?',
                canAddChoice: '='
            },
            templateUrl: 'app/components/py-angular-multiselect/py-angular-multiselect.html',
            controller: pyAngularMultiselectController,
            controllerAs: "vm",
            bindToController: true
        };
        return directive;
    }

    function pyAngularMultiselectController($element) {
        var vm = this;

        var HELP_TEXT_NEW = "(Create New)";
        var HELP_TEXT_SELECTED = "(Already Selected)";
        var HELP_TEXT_SUGGESTED = "(Suggested)";

        var inputElement = $element[0].getElementsByClassName('multi-select-input-search');

        vm.selected = vm.selected || [];
        vm.selectInput = '';
        vm.dropdownHelpText = HELP_TEXT_NEW;

        vm.alreadySelected = alreadySelected;
        vm.addResult = addResult;
        vm.createNewChoice = createNewChoice;
        vm.clearInput = clearInput;
        vm.findInResults = findInResults;
        vm.findInChoices = findInChoices;
        vm.inputKeypress = inputKeypress;
        vm.inputChange = inputChange;
        vm.removeChoice = removeChoice;
        vm.removeLastFromChoices = removeLastFromChoices;
        vm.setInputFocus = setInputFocus;
        vm.submitChoice = submitChoice;
        vm.toggleSuggestion = toggleSuggestion;

        function alreadySelected() {
            vm.dropdownHelpText = HELP_TEXT_SELECTED;
        }

        function removeChoice(choice) {
            choice.selected = false;
            var index = _.findIndex(vm.selected, choice);
            vm.selected.splice(index, 1);
        }

        function removeLastFromChoices() {
            if (vm.selected) {
                var item = vm.selected.pop();
                item.selected = false;
            }
        }

        function inputChange() {
            var found = vm.findInChoices();
            if (found) {
                return vm.alreadySelected();
            }
            found = vm.findInResults();
            if (found) {
                return vm.dropdownHelpText = HELP_TEXT_SUGGESTED;
            }
            vm.dropdownHelpText = HELP_TEXT_NEW;
        }

        function inputKeypress(event) {
            if (!vm.selectInput && event.keyCode === 8) {
                vm.removeLastFromChoices();
            }
        }

        function createNewChoice() {
            if (!vm.canAddChoice) {
                return;
            }

            return {
                name: vm.selectInput
            };
        }

        function clearInput() {
            vm.selectInput = '';
        }

        function findInChoices() {
            return _.find(vm.selected, function (item) {
                return item.name === vm.selectInput;
            });
        }

        function findInResults() {
            return _.find(vm.resultsList, function (item) {
                return item.name === vm.selectInput;
            });
        }

        function addResult(result) {
            if (result.selected) {
                return;
            }
            result.selected = true;
            vm.selected.push(result);

        }

        function submitChoice() {
            if (vm.selectInput) {
                var found = vm.findInChoices();
                if (found) {
                    return;
                }

                found = vm.findInResults() || vm.createNewChoice();
                vm.clearInput();
                vm.addResult(found);
            }
        }

        function setInputFocus() {
            inputElement[0].focus();
        }

        function toggleSuggestion(suggestion) {
            if(suggestion.selected) {
                vm.removeChoice(suggestion);
            } else {
                vm.addResult(suggestion);
            }
        }

        vm.resultsList = [
            {
                name: "Choice1"
            },
            {
                name: "Choice2"
            },
            {
                name: "Choice3"
            },
            {
                name: "Choice4"
            },
            {
                name: "Choice5"
            }
        ]

    }
})();
