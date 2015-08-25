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

    function pyAngularMultiselectController($element, $timeout, $log, MultiselectHelper) {
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
        vm.createNewOptions = {
            case: "camelcase",  // options: none, uppercase, lowercase, camelcase, capitalize, kebabcase, snakecase, startcase, nowhitespace;
            prepend: '#'
        };
        vm.onFocusShowDropdown  = true;
        vm.maxChipsAmount = 5;
        vm.isCaseSensitive = false;


        vm.inputElement = $element[0].getElementsByClassName('multi-select-input-search');

        vm.dropdownHelpText = '';
        vm.focusIndex = 0;
        vm.chips = vm.chips || [];
        vm.selectInput = '';
        vm.chipFocus = -1;
        vm.hideSuggestionsDropdown = true;
        vm.maxLengthInput = 32;
        vm.maxChipsReached = false;

        vm.addResult = addResult;
        vm.caseSensitive = caseSensitive;
        vm.getSuggestedHelpText = getSuggestedHelpText;
        vm.checkMaxChipAmount = checkMaxChipAmount;
        vm.clearInput = clearInput;
        vm.clearInputIfNameMatches = clearInputIfNameMatches;
        vm.createNewChip = createNewChip;
        vm.findInChips = findInChips;
        vm.findIndexInSuggestions = findIndexInSuggestions;
        vm.findInResults = findInResults;
        vm.focusChip = focusChip;
        vm.getAdjacentChipIndex = getAdjacentChipIndex;
        vm.onInputChange = onInputChange;
        vm.inputKeypress = inputKeypress;
        vm.onArrowDown = onArrowDown;
        vm.onArrowLeft = onArrowLeft;
        vm.onArrowRight = onArrowRight;
        vm.onArrowUp = onArrowUp;
        vm.onBackspace = onBackspace;
        vm.onBlurInput = onBlurInput;
        vm.onEnter = onEnter;
        vm.onFocusInput = onFocusInput;
        vm.prependCreateNewOptions = prependCreateNewOptions;
        vm.removeAndSelectAdjacentChip = removeAndSelectAdjacentChip;
        vm.removeChip = removeChip;
        vm.removeInputFocus = removeInputFocus;
        vm.removeLastFromChoices = removeLastFromChoices;
        vm.sanitizeSuggestions = sanitizeSuggestions;
        vm.setFocusToSuggestion = setFocusToSuggestion;
        vm.setInputFocus = setInputFocus;
        vm.suggestionClick = suggestionClick;
        vm.toggleSuggestion = toggleSuggestion;

        initialize();

        function initialize() {
            if (vm.canAddChoice) {
                vm.resultsList.unshift({id: 'stub'});
            }
            vm.checkMaxChipAmount();
            vm.sanitizeSuggestions();
        }

        function addResult(result) {
            if (result.selected) {
                return;
            }
            result.selected = true;
            vm.chips.push(result);
            vm.checkMaxChipAmount();
            vm.dropdownHelpText = '';
        }

        function getSuggestedHelpText() {
            if (!vm.selectInput) {
                return '';
            }
            if (vm.findInChips()) {
                return HELP_TEXT_SELECTED;
            }
            if (vm.findIndexInSuggestions() >= 0) {
                return HELP_TEXT_SUGGESTED;
            }
            return HELP_TEXT_NEW;
        }

        function checkMaxChipAmount() {
            if(!vm.maxChipsAmount) {
                return;
            }
            vm.maxChipsReached = vm.chips.length >= vm.maxChipsAmount;
        }

        function caseSensitive(string) {
            if (!string) {
                return;
            }
            if (vm.isCaseSensitive) {
                return string;
            }
            return string.toLowerCase();
        }

        function clearInput() {
            vm.selectInput = '';
            vm.suggestedCreateText = '';
        }

        function clearInputIfNameMatches(name) {
            if (name === vm.selectInput) {
                vm.clearInput();
            }
        }

        function createNewChip() {
            if (vm.findInChips() || !vm.selectInput) {
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

        function findIndexInSuggestions() {
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
                $log.error("focusChip: Could not find index " + index);
                return;
            }
            element.focus();
        }

        function getAdjacentChipIndex(index) {
            var chipLength = vm.chips.length;
            if (chipLength === 1) {
                return -1;
            }

            if (index === 0) {
                return 0;
            }

            return index - 1;
        }

        function onInputChange() {
            vm.hideSuggestionsDropdown = false;
            if (vm.canAddChoice) {
                vm.focusIndex = 0;
            }

            vm.suggestedCreateText = MultiselectHelper.sanitizeString(vm.selectInput, vm.createNewOptions.case);
            vm.suggestedCreateText = vm.prependCreateNewOptions(vm.suggestedCreateText);
            vm.setFocusToSuggestion();
            vm.dropdownHelpText = vm.getSuggestedHelpText();
        }

        function inputKeypress(event) {

            switch (event.keyCode) {
                //backspace or delete
                case 8:
                    vm.onBackspace();
                    break;
                //left arrow
                case 37:
                    vm.onArrowLeft();
                    break;
                //right arrow
                case 39:
                    vm.onArrowRight();
                    break;
                //enter
                case 13:
                    vm.onEnter();
                    break;
                //keydown
                case 40:
                    event.preventDefault();
                    vm.onArrowDown();
                    break;
                //keyup
                case 38:
                    event.preventDefault();
                    vm.onArrowUp();
                    break;
            }
        }

        function onArrowDown() {
            if(vm.chipFocus > -1) {
               return;
            }

            if (vm.focusIndex >= vm.resultsList.length - 1) {
                vm.focusIndex = vm.resultsList.length - 1;
                return;
            }

            vm.focusIndex++;
        }

        function onArrowLeft() {
            if (!vm.chips.length) {
                return;
            }
            if (MultiselectHelper.getCursorPosition(vm.inputElement[0]) === 0) {
                if (vm.chipFocus === 0) {
                    return;
                }
                if (vm.chipFocus === -1) {
                    vm.removeInputFocus();
                    vm.chipFocus = vm.chips.length - 1;
                    vm.focusChip(vm.chipFocus);
                    return;
                }

                vm.chipFocus--;
                vm.focusChip(vm.chipFocus);
            }
        }

        function onArrowRight() {
            if (vm.chipFocus === -1) {
                return;
            }
            if (vm.chipFocus + 1 === vm.chips.length) {
                vm.chipFocus = -1;
                vm.setInputFocus();
                return;
            }
            vm.chipFocus++;
        }

        function onArrowUp() {
            if(vm.chipFocus > -1) {
                return;
            }
            if (vm.focusIndex <= 0) {
                vm.focusIndex = 0;
                return;
            }

            vm.focusIndex--;
        }

        function onBackspace() {
            if (vm.chipFocus > -1) {
                vm.removeAndSelectAdjacentChip(vm.chipFocus);
                return;
            }
            if (MultiselectHelper.getCursorPosition(vm.inputElement[0]) === 0) {
                vm.removeLastFromChoices();
            }
        }

        function onBlurInput(event) {
            if (!event.relatedTarget) {
                vm.hideSuggestionsDropdown = true;
            }
        }

        function onEnter() {
            if(vm.chipFocus > -1) {
                vm.removeAndSelectAdjacentChip(vm.chipFocus);
                return;
            }
            vm.toggleSuggestion(vm.resultsList[vm.focusIndex]);
        }

        function onFocusInput() {
            vm.chipFocus = -1;
            if (vm.onFocusShowDropdown) {
                vm.hideSuggestionsDropdown = false;
            }
        }

        function prependCreateNewOptions(string) {
            var prependString = vm.createNewOptions.prepend;

            if (!prependString) {
                return string;
            }

            if (!_.startsWith(string.toLowerCase(), prependString)) {
                return prependString.concat(string);
            }

            return string;
        }

        function removeAndSelectAdjacentChip(index) {
            var adjacentIndex = vm.getAdjacentChipIndex(index);
            if (adjacentIndex === -1) {
                vm.removeChip(vm.chips[index]);
                vm.setInputFocus();
                return;
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
            vm.clearInputIfNameMatches(chip.name);
            vm.checkMaxChipAmount();
            $timeout(function() {
                vm.setInputFocus();
            });
        }

        function removeInputFocus() {
            vm.inputElement[0].blur();
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
                    item.name = MultiselectHelper.sanitizeString(item.name, vm.createNewOptions.case);
                    item.name = vm.prependCreateNewOptions(item.name);
                }
            });
        }

        function setFocusToSuggestion() {
            var found = vm.findIndexInSuggestions();
            if (found >= 0) {
                vm.focusIndex = found;
            }
        }

        function setInputFocus() {
            vm.chipFocus = -1;
            vm.inputElement[0].focus();
            if(vm.selectInput) {
                var textLength = vm.selectInput.length;
                vm.inputElement[0].setSelectionRange(textLength, textLength);
            }
        }

        function suggestionClick(suggestion, index) {
            vm.focusIndex = index;
            vm.toggleSuggestion(suggestion);
        }

        function toggleSuggestion(suggestion) {
            vm.setInputFocus();

            if (vm.canAddChoice && vm.focusIndex === 0 && vm.chipFocus === -1) {
                vm.createNewChip();
                return;
            }

            if (suggestion.selected) {
                vm.removeChip(suggestion);
                vm.dropdownHelpText = vm.getSuggestedHelpText();
                return;
            }
            vm.addResult(suggestion);
            vm.clearInputIfNameMatches(suggestion.name);
            vm.dropdownHelpText = vm.getSuggestedHelpText();
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
            else if (element.selectionStart || element.selectionStart === 0) {
                iCaretPos = element.selectionStart;
            }

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
