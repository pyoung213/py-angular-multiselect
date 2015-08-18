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
        ];

        var HELP_TEXT_NEW = "(Create New)";
        var HELP_TEXT_SELECTED = "(Already Selected)";
        var HELP_TEXT_SUGGESTED = "(Suggested)";

        var inputElement = $element[0].getElementsByClassName('multi-select-input-search');

        vm.dropdownHelpText = HELP_TEXT_NEW;
        vm.focusIndex = 0;
        vm.selected = vm.selected || [];
        vm.selectInput = '';

        vm.addResult = addResult;
        vm.alreadySelected = alreadySelected;
        vm.changeSuggestedHelpText = changeSuggestedHelpText;
        vm.clearInput = clearInput;
        vm.createNewChoice = createNewChoice;
        vm.findInChoices = findInChoices;
        vm.findIndexInResults = findIndexInResults;
        vm.findInResults = findInResults;
        vm.inputChange = inputChange;
        vm.inputKeypress = inputKeypress;
        vm.removeChoice = removeChoice;
        vm.removeLastFromChoices = removeLastFromChoices;
        vm.setFocusToSuggestion = setFocusToSuggestion;
        vm.setInputFocus = setInputFocus;
        vm.toggleSuggestion = toggleSuggestion;

        initialize();

        function initialize() {
            if (vm.canAddChoice) {
                vm.resultsList.unshift({id: 'stub'});
            }
        }

        function addResult(result) {
            if (result.selected) {
                return;
            }
            result.selected = true;
            vm.selected.push(result);

        }

        function changeSuggestedHelpText() {
            if (vm.findInChoices()) {
                return vm.alreadySelected();
            }
            if (vm.findIndexInResults() >= 0) {
                return vm.dropdownHelpText = HELP_TEXT_SUGGESTED;
            }
            vm.dropdownHelpText = HELP_TEXT_NEW;
        }

        function alreadySelected() {
            vm.dropdownHelpText = HELP_TEXT_SELECTED;
        }

        function clearInput() {
            vm.selectInput = '';
        }

        function createNewChoice() {
            var found = vm.findInChoices();
            if (found) {
                return;
            }

            var newChoice = {
                name: vm.selectInput
            };

            vm.addResult(newChoice);
            vm.clearInput();
        }

        function findInChoices() {
            return _.find(vm.selected, function (item) {
                return item.name === vm.selectInput;
            });
        }

        function findIndexInResults() {
            return _.findIndex(vm.resultsList, function (item) {
                return item.name === vm.selectInput;
            });
        }

        function findInResults() {
            return _.find(vm.resultsList, function (item) {
                return item.name === vm.selectInput;
            });
        }

        function inputChange() {
            if (vm.canAddChoice) {
                vm.focusIndex = 0;
            }
            vm.setFocusToSuggestion();
            vm.changeSuggestedHelpText();
        }

        function inputKeypress(event) {

            //backspace or delete
            if (!vm.selectInput && event.keyCode === 8) {
                return vm.removeLastFromChoices();
            }

            if (!vm.selectInput) {
                return;
            }

            //enter
            if (event.keyCode === 13) {
                return vm.toggleSuggestion(vm.resultsList[vm.focusIndex]);
            }

            //keydown
            if (event.keyCode === 40) {
                event.preventDefault();
                if (vm.focusIndex >= vm.resultsList.length - 1) {
                    return vm.focusIndex = vm.resultsList.length - 1;
                }

                return vm.focusIndex++;
            }

            //keyup
            if (event.keyCode === 38) {
                event.preventDefault();
                if (vm.focusIndex <= 0) {
                    return vm.focusIndex = 0;
                }

                return vm.focusIndex--;
            }
        }

        function removeChoice(choice) {
            choice.selected = false;
            var index = _.findIndex(vm.selected, choice);
            vm.selected.splice(index, 1);
            vm.setInputFocus();
        }

        function removeLastFromChoices() {
            if (vm.selected.length) {
                var item = vm.selected.pop();
                item.selected = false;
            }
        }

        function setFocusToSuggestion() {
            var found = vm.findIndexInResults();
            if (found >= 0) {
                vm.focusIndex = found;
            }
        }

        function setInputFocus() {
            inputElement[0].focus();
        }

        function toggleSuggestion(suggestion) {
            vm.setInputFocus();

            if (vm.canAddChoice && vm.focusIndex === 0) {
                return vm.createNewChoice();
            }

            if (suggestion.selected) {
                vm.removeChoice(suggestion);
                return vm.changeSuggestedHelpText();
            }
            vm.addResult(suggestion);
            return vm.changeSuggestedHelpText();

        }
    }
})();
