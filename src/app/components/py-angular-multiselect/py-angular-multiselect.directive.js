(function () {
    'use strict';

    angular
        .module('py-angular-multiselect', [])
        .directive('pyAngularMultiselect', pyAngularMultiselect)
        .controller('pyAngularMultiselectController', pyAngularMultiselectController)
        .factory('MultiselectHelper', MultiselectHelper);

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

    function pyAngularMultiselectController($element, $timeout, MultiselectHelper) {
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
        vm.chips = vm.chips || [];
        vm.selectInput = '';
        vm.chipFocus = -1;
        vm.hideSuggestionsDropdown = true;
        vm.maxLengthInput = 32;

        vm.addResult = addResult;
        vm.caseSensitive = caseSensitive;
        vm.changeSuggestedHelpText = changeSuggestedHelpText;
        vm.clearInput = clearInput;
        vm.createNewChip = createNewChip;
        vm.findInChips = findInChips;
        vm.findInSuggestions = findInSuggestions;
        vm.findInResults = findInResults;
        vm.focusChip = focusChip;
        vm.getAdjacentChipIndex = getAdjacentChipIndex;
        vm.onInputChange = onInputChange;
        vm.inputKeypress = inputKeypress;
        vm.onBlurInput = onBlurInput;
        vm.onFocusInput = onFocusInput;
        vm.prependCreateNewOptions = prependCreateNewOptions;
        vm.removeAndSelectAdjacentChip = removeAndSelectAdjacentChip;
        vm.removeChip = removeChip;
        vm.removeInputFocus = removeInputFocus;
        vm.removeLastFromChoices = removeLastFromChoices;
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
            vm.chips.push(result);
            return vm.dropdownHelpText = '';
        }

        function changeSuggestedHelpText() {
            if (!vm.selectInput) {
                return vm.dropdownHelpText = '';
            }
            if (vm.findInChips()) {
                return vm.dropdownHelpText = HELP_TEXT_SELECTED;
            }
            if (vm.findInSuggestions() >= 0) {
                return vm.dropdownHelpText = HELP_TEXT_SUGGESTED;
            }
            vm.dropdownHelpText = HELP_TEXT_NEW;
        }

        function caseSensitive(string) {
            if (!string) {
                return;
            }
            if (isCaseSensitive) {
                return string;
            }
            return string.toLowerCase();
        }

        function clearInput() {
            vm.selectInput = '';
            vm.suggestedCreateText = '';
        }

        function createNewChip() {
            var found = vm.findInChips();
            if (found || !vm.selectInput) {
                return;
            }

            var newChoice = {
                name: vm.suggestedCreateText
            };

            vm.addResult(newChoice);
            vm.clearInput();
        }

        function findInChips() {
            return _.find(vm.chips, function (item) {
                return vm.caseSensitive(item.name) === vm.caseSensitive(vm.suggestedCreateText);
            });
        }

        function findInSuggestions() {
            return _.findIndex(vm.resultsList, function (item) {
                return vm.caseSensitive(item.name) === vm.caseSensitive(vm.suggestedCreateText);
            });
        }

        function findInResults() {
            return _.find(vm.resultsList, function (item) {
                return vm.caseSensitive(item.name) === vm.caseSensitive(vm.suggestedCreateText);
            });
        }

        function focusChip(index) {
            vm.chipFocus = index;
            var element = $element[0].querySelector('.py-chip[tabindex="' + index + '"]');
            if (element === null) {
                debugger;
            }
            element.focus();
        }

        function getAdjacentChipIndex(index) {
            var chipLength = vm.chips.length;
            if (chipLength === 1) {
                return -1;
            }

            if (index === 0) {
                return index;
            }

            return index - 1;
        }

        function onInputChange() {
            vm.hideSuggestionsDropdown = false;
            if (vm.canAddChoice) {
                vm.focusIndex = 0;
            }

            vm.suggestedCreateText = MultiselectHelper.sanitizeString(vm.selectInput, createNewOptions.case);
            vm.suggestedCreateText = vm.prependCreateNewOptions(vm.suggestedCreateText);
            vm.setFocusToSuggestion();
            vm.changeSuggestedHelpText();
        }

        function inputKeypress(event) {

            switch (event.keyCode) {
                //backspace or delete
                case 8:
                    console.log('backspace');
                    if (vm.chipFocus > -1) {
                        vm.removeAndSelectAdjacentChip(vm.chipFocus);
                        break;
                    }
                    if (!vm.selectInput) {
                        vm.removeLastFromChoices();
                        break;
                    }
                    break;
                //left arrow
                case 37:
                    console.log('arrow left');
                    if (!vm.chips.length) {
                        break;
                    }
                    if (MultiselectHelper.getCursorPosition(inputElement[0]) === 0) {
                        if (vm.chipFocus === 0) {
                            break;
                        }
                        if (vm.chipFocus === -1) {
                            vm.removeInputFocus();
                            vm.chipFocus = vm.chips.length - 1;
                            vm.focusChip(vm.chipFocus);
                            break;
                        }

                        vm.chipFocus--;
                        vm.focusChip(vm.chipFocus);
                        break;
                    }
                    break;
                //right arrow
                case 39:
                    console.log('arrow right');
                    if (event.keyCode === 39) {
                        if (vm.chipFocus === -1) {
                            break;
                        }
                        if (vm.chipFocus + 1 === vm.chips.length) {
                            vm.chipFocus = -1;
                            vm.setInputFocus();
                            break;
                        }
                        vm.chipFocus++;
                        break;
                    }
                    break;
                //enter
                case 13:
                    console.log('enter');
                    if(vm.chipFocus > -1) {
                        vm.removeAndSelectAdjacentChip(vm.chipFocus);
                        break;
                    }
                    vm.toggleSuggestion(vm.resultsList[vm.focusIndex]);
                    break;
                //keydown
                case 40:
                    console.log('keydown');
                    event.preventDefault();
                    if(vm.chipFocus > -1) {
                        break;
                    }

                    if (vm.focusIndex >= vm.resultsList.length - 1) {
                        vm.focusIndex = vm.resultsList.length - 1;
                        break;
                    }

                    vm.focusIndex++;
                    break;
                //keyup
                case 38:
                    console.log('keyup');
                    event.preventDefault();
                    if(vm.chipFocus > -1) {
                        break;
                    }
                    if (vm.focusIndex <= 0) {
                        vm.focusIndex = 0;
                        break;
                    }

                    vm.focusIndex--;
                    break;
            }
        }

        function onBlurInput(event) {
            if (!event.relatedTarget) {
                vm.hideSuggestionsDropdown = true;
            }
        }

        function onFocusInput() {
            vm.chipFocus = -1;
            if (onFocusShowDropdown) {
                vm.hideSuggestionsDropdown = false;
            }
        }

        function prependCreateNewOptions(string) {
            var prependString = createNewOptions.prepend;

            if (!prependString) {
                return string;
            }

            if (!_.startsWith(string.toLowerCase(), prependString)) {
                return prependString.concat(string);
            }
        }

        function removeAndSelectAdjacentChip(index) {
            var adjacentIndex = vm.getAdjacentChipIndex(index);
            if (adjacentIndex === -1) {
                vm.removeChip(vm.chips[index]);
                return vm.setInputFocus();
            }
            vm.removeChip(vm.chips[index]);
            //timeout helps with focus of last element.
            $timeout(function () {
                vm.focusChip(adjacentIndex);
            });
        }

        function removeChip(chip) {
            chip.selected = false;
            var index = _.findIndex(vm.chips, chip);
            vm.chips.splice(index, 1);
            console.log('removed chip', chip);
            if (chip.name === vm.suggestedCreateText) {
                vm.clearInput();
            }
        }

        function removeInputFocus() {
            inputElement[0].blur();
        }

        function removeLastFromChoices() {
            if (vm.chips.length) {
                var item = vm.chips.pop();
                item.selected = false;
            }
        }

        function sanitizeSuggestions() {
            _.forEach(vm.resultsList, function (item) {
                if (item.name) {
                    item.name = MultiselectHelper.sanitizeString(item.name, createNewOptions.case);
                    item.name = vm.prependCreateNewOptions(item.name);
                }
            });
        }

        function setFocusToSuggestion() {
            var found = vm.findInSuggestions();
            if (found >= 0) {
                vm.focusIndex = found;
            }
        }

        function setInputFocus() {
            vm.chipFocus = -1;
            inputElement[0].focus();
            if(vm.selectInput) {
                var textLength = vm.selectInput.length;
                inputElement[0].setSelectionRange(textLength, textLength);
            }
        }

        function toggleSuggestion(suggestion) {
            vm.setInputFocus();

            if (vm.canAddChoice && vm.focusIndex === 0 && vm.chipFocus === -1) {
                return vm.createNewChip();
            }

            if (suggestion.selected) {
                vm.removeChip(suggestion);
                return vm.changeSuggestedHelpText();
            }
            vm.addResult(suggestion);

            if (suggestion.name === vm.suggestedCreateText) {
                vm.clearInput();
            }

            return vm.changeSuggestedHelpText();

        }
    }

    function MultiselectHelper() {
        var factory = {
            getCursorPosition: getCursorPosition,
            sanitizeString: sanitizeString
        };

        return factory;

        function getCursorPosition(element) {
            // Initialize
            var iCaretPos = 0;

            // IE Support
            if (document.selection) {

                // Set focus on the element
                element.focus();

                // To get cursor position, get empty selection range
                var oSel = document.selection.createRange();

                // Move selection start to 0 position
                oSel.moveStart('character', -element.value.length);

                // The caret position is selection length
                iCaretPos = oSel.text.length;
            }

            // Firefox support
            else if (element.selectionStart || element.selectionStart == '0')
                iCaretPos = element.selectionStart;

            // Return results
            return iCaretPos;
        }

        function sanitizeString(string, type) {
            //TODO: switch this to pass in a function from user.
            switch (type) {
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
                    string = string.replace(/ /g, '');
                    break;
                case 'pascal':
                    string = string.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter) {
                        return letter.toUpperCase();
                    }).replace(/\s+/g, '').replace(/\W/g, '');
                    break;
            }

            return string;
        }
    }
})();
