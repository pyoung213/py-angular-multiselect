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
                name: "choiceThree"
            },
            {
                name: "Choice_4"
            },
            {
                name: "Choice-5"
            }
        ];

        var HELP_TEXT_NEW = "(Create New)";
        var HELP_TEXT_SELECTED = "(Already Selected)";
        var HELP_TEXT_SUGGESTED = "(Suggested)";
        var isCaseSensitive = false;
        var createNewOptions = {
            case: "camelcase",  // options: none, uppercase, lowercase, camelcase, capitalize, kebabcase, snakecase, startcase, nowhitespace;
            prepend: '#'
        };
        var onFocusShowDropdown = true;

        var inputElement = $element[0].getElementsByClassName('multi-select-input-search');

        vm.dropdownHelpText = '';
        vm.focusIndex = 0;
        vm.selected = vm.selected || [];
        vm.selectInput = '';
        vm.hideSuggestionsDropdown = true;
        vm.maxLengthInput = 32;

        vm.addResult = addResult;
        vm.caseSensitive = caseSensitive;
        vm.changeSuggestedHelpText = changeSuggestedHelpText;
        vm.clearInput = clearInput;
        vm.createNewChoice = createNewChoice;
        vm.findInChoices = findInChoices;
        vm.findIndexInResults = findIndexInResults;
        vm.findInResults = findInResults;
        vm.inputChange = inputChange;
        vm.inputKeypress = inputKeypress;
        vm.onBlurInput = onBlurInput;
        vm.onFocusInput = onFocusInput;
        vm.prependCreateNewOptions = prependCreateNewOptions;
        vm.removeChoice = removeChoice;
        vm.removeLastFromChoices = removeLastFromChoices;
        vm.sanitizeString = sanitizeString;
        vm.sanitizeSuggestions = sanitizeSuggestions;
        vm.setFocusToSuggestion = setFocusToSuggestion;
        vm.setInputFocus = setInputFocus;
        vm.toggleSuggestion = toggleSuggestion;

        initialize();

        function initialize() {
            if (vm.canAddChoice) {
                vm.resultsList.unshift({id: 'stub'});
            }

            vm.sanitizeSuggestions();
        }

        function addResult(result) {
            if (result.selected) {
                return;
            }
            result.selected = true;
            vm.selected.push(result);
            return vm.dropdownHelpText = '';
        }

        function changeSuggestedHelpText() {
            if (!vm.selectInput) {
                return vm.dropdownHelpText = '';
            }
            if (vm.findInChoices()) {
                return vm.dropdownHelpText = HELP_TEXT_SELECTED;
            }
            if (vm.findIndexInResults() >= 0) {
                return vm.dropdownHelpText = HELP_TEXT_SUGGESTED;
            }
            vm.dropdownHelpText = HELP_TEXT_NEW;
        }

        function caseSensitive(string) {
            if(!string) {
                return;
            }
            if(isCaseSensitive) {
                return string;
            }
            return string.toLowerCase();
        }

        function clearInput() {
            vm.selectInput = '';
            vm.suggestedCreateText = '';
        }

        function createNewChoice() {
            var found = vm.findInChoices();
            if (found || !vm.selectInput) {
                return;
            }

            var newChoice = {
                name: vm.suggestedCreateText
            };

            vm.addResult(newChoice);
            vm.clearInput();
        }

        function findInChoices() {
            return _.find(vm.selected, function (item) {
                return vm.caseSensitive(item.name) === vm.caseSensitive(vm.suggestedCreateText);
            });
        }

        function findIndexInResults() {
            return _.findIndex(vm.resultsList, function (item) {
                return vm.caseSensitive(item.name) === vm.caseSensitive(vm.suggestedCreateText);
            });
        }

        function findInResults() {
            return _.find(vm.resultsList, function (item) {
                return vm.caseSensitive(item.name) === vm.caseSensitive(vm.suggestedCreateText);
            });
        }

        function inputChange() {
            vm.hideSuggestionsDropdown = false;
            if (vm.canAddChoice) {
                vm.focusIndex = 0;
            }

            vm.suggestedCreateText = vm.sanitizeString(vm.selectInput);
            vm.setFocusToSuggestion();
            vm.changeSuggestedHelpText();
        }

        function inputKeypress(event) {

            //backspace or delete
            if (!vm.selectInput && event.keyCode === 8) {
                return vm.removeLastFromChoices();
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

        function onBlurInput(event) {
            if(!event.relatedTarget) {
                vm.hideSuggestionsDropdown = true;
            }
        }

        function onFocusInput() {
            if(onFocusShowDropdown) {
                vm.hideSuggestionsDropdown = false;
            }
        }

        function prependCreateNewOptions(string) {
            var prependString = createNewOptions.prepend;

            if(!prependString) {
                return string;
            }

            if(!_.startsWith(string.toLowerCase(), prependString)) {
                return prependString.concat(string);
            }
        }

        function removeChoice(choice) {
            choice.selected = false;
            var index = _.findIndex(vm.selected, choice);
            vm.selected.splice(index, 1);
            if(choice.name === vm.suggestedCreateText) {
                vm.clearInput();
            }
        }

        function removeLastFromChoices() {
            if (vm.selected.length) {
                var item = vm.selected.pop();
                item.selected = false;
            }
        }

        function sanitizeString(string) {

            switch(createNewOptions.case) {
                case 'uppercase':
                    string = string.toUpperCase();
                    break;
                case 'lowercase':
                    string = string.toLowerCase();
                    break;
                case 'camelcase':
                    string = _.camelCase(string);
                    break;
                case 'capitalize':
                    string = _.capitalize(string);
                    break;
                case 'kebabcase':
                    string = _.kebabCase(string);
                    break;
                case 'snakecase':
                    string = _.snakeCase(string);
                    break;
                case 'startcase':
                    string = _.startCase(string);
                    break;
                case 'nowhitespace':
                    string = string.replace(/ /g,'');
            }

            return vm.prependCreateNewOptions(string);
        }

        function sanitizeSuggestions() {
            _.forEach(vm.resultsList, function(item) {
                if(item.name) {
                    item.name = vm.sanitizeString(item.name);
                }
            });
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

            if(suggestion.name === vm.suggestedCreateText) {
                vm.clearInput();
            }

            return vm.changeSuggestedHelpText();

        }
    }
})();
