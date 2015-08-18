(function () {
    'use strict';

    angular
        .module('py-angular-multiselect', [])
        .directive('pyAngularMultiselect', pyAngularMultiselect)
        .controller('pyAngularMultiselectController', pyAngularMultiselectController)
        .filter('pyHighlight', pyHighlight);


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

        vm.selected = vm.selected || [];
        vm.selectInput = '';
        vm.dropdownHelpText = HELP_TEXT_NEW;

        vm.alreadySelected = alreadySelected;
        vm.addResult = addResult;
        vm.createNewChoice = createNewChoice;
        vm.clearInput = clearInput;
        vm.findInResults = findInResults;
        vm.findInChoices = findInChoices;
        vm.getFirstSelectableResult = getFirstSelectableResult;
        vm.inputKeypress = inputKeypress;
        vm.inputChange = inputChange;
        vm.removeChoice = removeChoice;
        vm.removeLastFromChoices = removeLastFromChoices;
        vm.setInputFocus = setInputFocus;
        vm.submitChoice = submitChoice;
        vm.toggleSuggestion = toggleSuggestion;
        vm.resetSuggestedFocus = resetSuggestedFocus;

        initialize();

        function initialize () {
            vm.focusIndex = 0;
        }

        function resetSuggestedFocus () {
            _.forEach(vm.resultsList, function(result, index) {
                if(!result.selected) {
                    vm.focusIndex = index;
                    return false;
                }
            });
        }

        function alreadySelected() {
            vm.dropdownHelpText = HELP_TEXT_SELECTED;
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

        function inputChange() {
            var found = vm.findInChoices();
            if (found) {
                return vm.alreadySelected();
            }
            found = _.findIndex(vm.resultsList, function(item) {
                return item.name === vm.selectInput;
            });
            if (found >= 0) {
                vm.focusIndex = found;
                return vm.dropdownHelpText = HELP_TEXT_SUGGESTED;
            }
            vm.dropdownHelpText = HELP_TEXT_NEW;
        }

        function inputKeypress(event) {
            //backspace or delete
            if (!vm.selectInput && event.keyCode === 8) {
                return vm.removeLastFromChoices();
            }

            if(!vm.selectInput) {
                return;
            }

            //enter
            if(event.keyCode === 13) {
                vm.addResult(vm.resultsList[vm.focusIndex]);
                vm.resetSuggestedFocus();
            }

            //keydown
            if(event.keyCode === 40) {
                event.preventDefault();
                if(vm.focusIndex >= vm.resultsList.length - 1) {
                    return vm.focusIndex = vm.resultsList.length - 1;
                }

                for(var i = vm.focusIndex + 1; i <= vm.resultsList.length; i++) {
                    if(vm.resultsList[i] && !vm.resultsList[i].selected) {
                        vm.focusIndex = i;
                        break;
                    }
                }
            }

            //keyup
            if(event.keyCode === 38) {
                event.preventDefault();
                if(vm.focusIndex <= 0) {
                    return vm.focusIndex = 0;
                }

                for(var i = vm.focusIndex - 1; i >= 0; i--) {
                    if(vm.resultsList[i] && !vm.resultsList[i].selected) {
                        vm.focusIndex = i;
                        break;
                    }
                }
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

        function getFirstSelectableResult() {
            return _.find(vm.resultsList, function (item) {
                return !item.selected;
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
                if (found) {
                    vm.clearInput();
                    vm.addResult(found);
                    vm.resetSuggestedFocus();
                }
            }
        }

        function setInputFocus() {
            inputElement[0].focus();
        }

        function toggleSuggestion(suggestion, index) {
            vm.setInputFocus();

            suggestion.selected ? vm.removeChoice(suggestion) : vm.addResult(suggestion);

            if(index === vm.focusIndex) {
                vm.resetSuggestedFocus();
            }
        }
    }

    function pyHighlight($sce) {
        return function(text, phrase) {
            if (phrase) {
                var regex = new RegExp('('+phrase+')', 'gi');
                text = text.replace(regex, '<span class="highlighted">$1</span>');
            }

            return $sce.trustAsHtml(text)
        }
    }
})();
