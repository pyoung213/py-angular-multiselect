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
                canAddChoice: '=',
                refreshSuggestions: '&',
                suggestionList: '='
            },
            templateUrl: 'app/components/py-angular-multiselect/py-angular-multiselect.html',
            controller: pyAngularMultiselectController,
            controllerAs: "vm",
            bindToController: true
        };
        return directive;
    }

    function pyAngularMultiselectController($element, $timeout, $log, MultiselectHelper, $q) {
        var vm = this;

        var HELP_TEXT_NEW = "(Create New)";
        var HELP_TEXT_SELECTED = "(Already Selected)";
        var HELP_TEXT_SUGGESTED = "(Suggested)";

        vm.name = "titleNoFormatting";
        vm.createNewOptions = {
            case: "camelcase",  // options: none, uppercase, lowercase, camelcase, capitalize, kebabcase, snakecase, startcase, nowhitespace;
            prepend: '#'
        };
        vm.onFocusShowDropdown  = true;
        vm.maxChipsAmount = 5;
        vm.maxSuggestions = null;
        vm.isCaseSensitive = false;
        vm.cache = {};
        vm.DEBOUNCE_TIME = 2000;

        vm.inputElement = $element[0].getElementsByClassName('multi-select-input-search');

        vm.dropdownHelpText = '';
        vm.focusIndex = 0;
        vm.chips = vm.chips || [];
        vm.searchText = '';
        vm.chipFocus = -1;
        vm.hideSuggestionsDropdown = true;
        vm.maxLengthInput = 32;
        vm.maxChipsReached = false;
        vm.queryProcessing = false;

        vm.addResult = addResult;
        vm.caseSensitive = caseSensitive;
        vm.cacheSearchText = cacheSearchText;
        vm.getSuggestedHelpText = getSuggestedHelpText;
        vm.getSuggestions = getSuggestions;
        vm.checkMaxChipAmount = checkMaxChipAmount;
        vm.clearInput = clearInput;
        vm.clearInputIfNameMatches = clearInputIfNameMatches;
        vm.createNewChip = createNewChip;
        vm.findInChips = findInChips;
        vm.findIndexInSuggestions = findIndexInSuggestions;
        vm.findInResults = findInResults;
        vm.focusChip = focusChip;
        vm.getAdjacentChipIndex = getAdjacentChipIndex;
        vm.handleProcessingSuggestions = handleProcessingSuggestions;
        vm.handleQuery = handleQuery;
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
        vm.setSuggestionSelection = setSuggestionSelection;
        vm.suggestionClick = suggestionClick;
        vm.toggleSuggestion = toggleSuggestion;
        vm.updateSuggestions = updateSuggestions;

        var searchDebounce = _.debounce(debounceServer, vm.DEBOUNCE_TIME);

        initialize();

        function initialize() {
            if (vm.canAddChoice) {
                vm.suggestionList.unshift({id: 'stub'});

                if(vm.maxSuggestions) {
                    vm.maxSuggestions++;
                }
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
            if (!vm.searchText) {
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

        function getSuggestions(searchText) {
            var deferred = $q.defer();
            if(angular.isUndefined(vm.refreshSuggestions())) {
                deferred.resolve();
            }

            deferred.resolve(vm.refreshSuggestions()(searchText));

            return deferred.promise;
        }

        function updateSuggestions (matches) {
            if (vm.canAddChoice) {
                vm.suggestionList = _.take(vm.suggestionList);
            } else {
                vm.suggestionList = [];
            }

            vm.suggestionList = _.union(vm.suggestionList, matches);
        }

        function cacheSearchText(matches) {
            var term = vm.searchText;
            vm.cache[term] = matches;
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
            vm.searchText = '';
            vm.suggestedCreateText = '';
        }

        function clearInputIfNameMatches(name) {
            if (name === vm.searchText) {
                vm.clearInput();
            }
        }

        function createNewChip() {
            if (vm.findInChips() || !vm.searchText) {
                return;
            }

            var newChoice = {};
            newChoice[vm.name] =  vm.suggestedCreateText;

            vm.addResult(newChoice);
            vm.clearInput();
        }

        function findInChips() {
            return _.find(vm.chips, function (item) {
                return vm.caseSensitive(item[vm.name]) === vm.caseSensitive(vm.suggestedCreateText);
            });
        }

        function findIndexInSuggestions() {
            return _.findIndex(vm.suggestionList, function (item) {
                return vm.caseSensitive(item[vm.name]) === vm.caseSensitive(vm.suggestedCreateText);
            });
        }

        function findInResults() {
            return _.find(vm.suggestionList, function (item) {
                return vm.caseSensitive(item[vm.name]) === vm.caseSensitive(vm.suggestedCreateText);
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

        function handleQuery() {

            if(vm.queryProcessing) {
                console.log('processing');
                return;
            }

            vm.queryProcessing = true;

            var term = vm.searchText.toLowerCase();

            if(!vm.noCache && vm.cache[term]) {
                console.log('cache');
                vm.queryProcessing = false;
                vm.handleProcessingSuggestions(vm.cache[term]);
                return;
            }

            searchDebounce();
        }

        function debounceServer() {
            vm.getSuggestions(vm.searchText)
                .then(function(data) {
                    if(!data || !vm.queryProcessing) {
                        return;
                    }
                    vm.handleProcessingSuggestions(data);
                })
                .finally(function() {
                    vm.queryProcessing = false;
                });
        }

        function onInputChange() {
            vm.suggestedCreateText = MultiselectHelper.sanitizeString(vm.searchText, vm.createNewOptions.case);
            vm.suggestedCreateText = vm.prependCreateNewOptions(vm.suggestedCreateText);
            vm.setFocusToSuggestion();
            vm.dropdownHelpText = vm.getSuggestedHelpText();
            vm.handleQuery();
        }

        function handleProcessingSuggestions(results) {
            vm.cacheSearchText(results);
            vm.updateSuggestions(results);
            vm.sanitizeSuggestions();
            vm.setSuggestionSelection();
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

            if (vm.focusIndex >= vm.suggestionList.length - 1) {
                vm.focusIndex = vm.suggestionList.length - 1;
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
            vm.toggleSuggestion(vm.suggestionList[vm.focusIndex]);
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
            vm.clearInputIfNameMatches(chip[vm.name]);
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
            _.forEach(vm.suggestionList, function (item) {
                if (item[vm.name]) {
                    item[vm.name] = MultiselectHelper.sanitizeString(item[vm.name], vm.createNewOptions.case);
                    item[vm.name] = vm.prependCreateNewOptions(item[vm.name]);
                }
            });
        }

        function setFocusToSuggestion() {
            var found = vm.findIndexInSuggestions();
            if (found >= 0) {
                vm.focusIndex = found;
                return;
            }

            vm.focusIndex = 0;
        }

        function setInputFocus() {
            vm.chipFocus = -1;
            vm.inputElement[0].focus();
            if(vm.searchText) {
                var textLength = vm.searchText.length;
                vm.inputElement[0].setSelectionRange(textLength, textLength);
            }
        }

        function setSuggestionSelection() {
            _.forEach(vm.suggestionList, function(suggestion) {
                var found = _.find(vm.chips, function(chip) {
                    return suggestion[vm.name] === chip[vm.name];
                });

                suggestion.selected = !!found;
            });
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
            vm.clearInputIfNameMatches(suggestion[vm.name]);
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
            var caretPos = 0;

            // IE Support
            if (document.selection) {
                element.focus();
                var oSel = document.selection.createRange();
                oSel.moveStart('character', -element.value.length);
                caretPos = oSel.text.length;
            }

            // Firefox support
            else if (element.selectionStart || element.selectionStart === 0) {
                caretPos = element.selectionStart;
            }

            // Return results
            return caretPos;
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
