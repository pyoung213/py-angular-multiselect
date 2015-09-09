(function() {
    'use strict';

    describe('Component', function(){

        beforeEach(module('py-angular-multiselect'));

        var vm, $scope, $compile, MultiselectHelper, $timeout;

        var HELP_TEXT_NEW = "(Create New)";
        var HELP_TEXT_SELECTED = "(Already Selected)";
        var HELP_TEXT_SUGGESTED = "(Suggested)";

        beforeEach(inject(function ($controller, $rootScope, _$compile_, _MultiselectHelper_, _$timeout_) {
            $scope = $rootScope.$new();
            $compile = _$compile_;
            $timeout = _$timeout_;
            MultiselectHelper = _MultiselectHelper_;

            var element = angular.element("<div></div>");

            vm = $controller('pyAngularMultiselectController',{
                $element: element
            });

            vm.name = 'name';
        }));

        it('should add result to chips total', function() {
            spyOn(vm, "checkMaxChipAmount");
            vm.chips = [{id:123}];
            var mockChip = {
                name: 'something',
                id: 234
            };
            vm.addResult(mockChip);
            expect(mockChip.selected).toBeTruthy();
            expect(vm.chips.length).toEqual(2);
            expect(vm.chips[1]).toEqual(mockChip);
            expect(vm.checkMaxChipAmount).toHaveBeenCalled();
            expect(vm.dropdownHelpText).toEqual('');
        });

        it('should not add to results if chip has already been selected', function() {
            spyOn(vm, "checkMaxChipAmount");
            vm.chips = [{id:123}];
            vm.dropdownHelpText = "something";
            var mockChip = {
                name: 'something',
                selected: true,
                id: 234
            };
            vm.addResult(mockChip);

            expect(vm.checkMaxChipAmount).not.toHaveBeenCalled();
            expect(vm.dropdownHelpText).toEqual("something");
        });

        it('should change suggested help text to blank', function() {
            vm.dropdownHelpText = "whatever";
            vm.searchText = '';

            expect(vm.getSuggestedHelpText()).toEqual('');
        });

        it('should change suggested help text if found in chips', function() {
            spyOn(vm, "findInChips").and.returnValue(true);
            vm.dropdownHelpText = '';
            vm.searchText = 'something';
            vm.getSuggestedHelpText();

            expect(vm.getSuggestedHelpText()).toEqual(HELP_TEXT_SELECTED);
        });

        it('should change suggested help text if found in suggestions', function() {
            spyOn(vm, "findInChips").and.returnValue(false);
            spyOn(vm, "findIndexInSuggestions").and.returnValue(1);
            vm.dropdownHelpText = '';
            vm.searchText = 'something';
            vm.getSuggestedHelpText();

            expect(vm.getSuggestedHelpText()).toEqual(HELP_TEXT_SUGGESTED);
        });

        it('should change suggested help text to create new', function() {
            spyOn(vm, "findInChips").and.returnValue(false);
            spyOn(vm, "findIndexInSuggestions").and.returnValue(-1);
            vm.dropdownHelpText = '';
            vm.searchText = 'something';
            vm.getSuggestedHelpText();

            expect(vm.getSuggestedHelpText()).toEqual(HELP_TEXT_NEW);
        });

        it('should set max chips reached to false', function() {
            vm.maxChipsReached = true;
            vm.maxChipsAmount = 2;
            vm.chips = [{}];

            vm.checkMaxChipAmount();

            expect(vm.maxChipsReached).toBeFalsy();
        });

        it('should set max chips reached to true', function() {
            vm.maxChipsReached = false;
            vm.maxChipsAmount = 2;
            vm.chips = [{}, {}];

            vm.checkMaxChipAmount();

            expect(vm.maxChipsReached).toBeTruthy();
        });

        it('should set string to lower case if set', function() {
            var string = "Some STRING";

            string = vm.caseSensitive(string);
            expect(string).toEqual('some string');
        });

        it('should not set string to lower case', function() {
            var string = "Some STRING";
            vm.isCaseSensitive = true;
            string = vm.caseSensitive(string);
            expect(string).toEqual(string);
        });

        it('should clear input and suggested text', function() {
            vm.searchText = "Something";
            vm.suggestedCreateText = "mock text";

            vm.clearInput();

            expect(vm.searchText).toEqual('');
            expect(vm.suggestedCreateText).toEqual('');
        });

        it('should clear input if name matches selectedText', function() {
            spyOn(vm, 'clearInput');
            vm.searchText = "mock";
            var name = "mock";

            vm.clearInputIfNameMatches(name);

            expect(vm.clearInput).toHaveBeenCalled();
        });

        it('should not clear input if name does not matche selectedText', function() {
            spyOn(vm, 'clearInput');
            vm.searchText = "mock";
            var name = "mock2";

            vm.clearInputIfNameMatches(name);

            expect(vm.clearInput).not.toHaveBeenCalled();
        });

        it('should create new chip', function() {
            spyOn(vm, 'findInChips').and.returnValue(false);
            spyOn(vm, 'addResult');
            spyOn(vm, 'clearInput');
            vm.searchText = "newChip";
            vm.suggestedCreateText = "#newChip";
            var newChip = {
                name: vm.suggestedCreateText
            };

            vm.createNewChip();

            expect(vm.addResult).toHaveBeenCalledWith(newChip);
            expect(vm.clearInput).toHaveBeenCalled();
        });

        it('should not create new chip because it already is in chips', function() {
            spyOn(vm, 'findInChips').and.returnValue(true);
            spyOn(vm, 'addResult');
            spyOn(vm, 'clearInput');
            vm.searchText = "newChip";

            vm.createNewChip();

            expect(vm.addResult).not.toHaveBeenCalled();
            expect(vm.clearInput).not.toHaveBeenCalled();
        });

        it('should not create new chip because input is blank', function() {
            spyOn(vm, 'findInChips').and.returnValue(false);
            spyOn(vm, 'addResult');
            spyOn(vm, 'clearInput');
            vm.searchText = "";

            vm.createNewChip();

            expect(vm.addResult).not.toHaveBeenCalled();
            expect(vm.clearInput).not.toHaveBeenCalled();
        });

        it('should focus on chip', function() {
            vm.chipFocus = -1;
            vm.focusChip(2);

            expect(vm.chipFocus).toEqual(2);
        });

        it('should get adjacent chip index', function() {
            vm.chips = [{},{}];
            var index = vm.getAdjacentChipIndex(1);

            expect(index).toEqual(0);
        });

        it('should return -1 if chip length is 1', function() {
            vm.chips = [{}];
            var index = vm.getAdjacentChipIndex(0);
            expect(index).toEqual(-1);
        });

        it('should return 0 if last chip', function() {
            vm.chips = [{},{},{}];
            var index = vm.getAdjacentChipIndex(0);
            expect(index).toEqual(0);
        });

        it('should on arrow down increase the focusIndex', function() {
            vm.suggestionList = [{},{},{}];
            vm.chipFocus = -1;
            vm.focusIndex = 1;

            vm.onArrowDown();

            expect(vm.focusIndex).toEqual(2);

        });

        it('should on arrow down if last in list, return same index', function() {
            vm.suggestionList = [{},{},{}];
            vm.chipFocus = -1;
            vm.focusIndex = 2;

            vm.onArrowDown();

            expect(vm.focusIndex).toEqual(2);
        });

        it('should not affect index on arrow down if we have chip focus', function() {
            vm.suggestionList = [{},{},{}];
            vm.chipFocus = 0;
            vm.focusIndex = 1;

            vm.onArrowDown();

            expect(vm.focusIndex).toEqual(1);
        });

        it('should on arrow up decrease the focusIndex', function() {
            vm.chipFocus = -1;
            vm.focusIndex = 1;

            vm.onArrowUp();

            expect(vm.focusIndex).toEqual(0);
        });

        it('should on arrow up if last in suggestions not change', function() {
            vm.chipFocus = -1;
            vm.focusIndex = 0;

            vm.onArrowUp();

            expect(vm.focusIndex).toEqual(0);
        });

        it('should not affect index on arrow up if we have chip focus', function() {
            vm.chipFocus = 1;
            vm.focusIndex = 2;

            vm.onArrowUp();

            expect(vm.focusIndex).toEqual(2);
        });

        it('should select first chip on arrow left if cursor is at 0', function() {
            spyOn(MultiselectHelper, 'getCursorPosition').and.returnValue(0);
            spyOn(vm, 'removeInputFocus');
            spyOn(vm, 'focusChip');
            vm.chips = [{},{}];
            vm.chipFocus = -1;

            vm.onArrowLeft();

            expect(vm.focusChip).toHaveBeenCalledWith(1);
            expect(vm.removeInputFocus).toHaveBeenCalled();
            expect(vm.chipFocus).toEqual(1);
        });

        it('should select first chip on arrow left if cursor is at 0', function() {
            spyOn(MultiselectHelper, 'getCursorPosition').and.returnValue(1);
            spyOn(vm, 'removeInputFocus');
            spyOn(vm, 'focusChip');
            vm.chips = [{},{}];
            vm.chipFocus = -1;

            vm.onArrowLeft();

            expect(vm.chipFocus).toEqual(-1);
        });

        it('should select next chip on arrow left if cursor is at 0', function() {
            spyOn(MultiselectHelper, 'getCursorPosition').and.returnValue(0);
            spyOn(vm, 'removeInputFocus');
            spyOn(vm, 'focusChip');
            vm.chips = [{},{}];
            vm.chipFocus = 1;

            vm.onArrowLeft();

            expect(vm.chipFocus).toEqual(0);
            expect(vm.focusChip).toHaveBeenCalledWith(0);
        });


        it('should select input on arrow right if focus in on last chip', function() {
            spyOn(vm, 'setInputFocus');
            vm.chips = [{},{}];
            vm.chipFocus = 1;

            vm.onArrowRight();

            expect(vm.setInputFocus).toHaveBeenCalled();
            expect(vm.chipFocus).toEqual(-1);
        });

        it('should select next chip on arrow right if not last', function() {
            vm.chips = [{},{}];
            vm.chipFocus = 0;

            vm.onArrowRight();

            expect(vm.chipFocus).toEqual(1);
        });

        it('should not move chip focus on arrow right if chips not selected', function() {
            vm.chips = [{},{}];
            vm.chipFocus = -1;

            vm.onArrowRight();

            expect(vm.chipFocus).toEqual(-1);
        });

        it('should delete chip and focus adjacent chip on backspace', function() {
            spyOn(vm, 'removeAndSelectAdjacentChip');
            spyOn(vm, 'removeLastFromChoices');
            vm.chipFocus = 1;

            vm.onBackspace();

            expect(vm.removeAndSelectAdjacentChip).toHaveBeenCalledWith(1);
            expect(vm.removeLastFromChoices).not.toHaveBeenCalled();
        });

        it('should delete chip and focus adjacent chip on backspace', function() {
            spyOn(vm, 'removeAndSelectAdjacentChip');
            spyOn(vm, 'removeLastFromChoices');
            spyOn(MultiselectHelper, 'getCursorPosition').and.returnValue(0);

            vm.chipFocus = -1;

            vm.onBackspace();

            expect(vm.removeAndSelectAdjacentChip).not.toHaveBeenCalled();
            expect(vm.removeLastFromChoices).toHaveBeenCalled();
        });

        it('should hide dropdown if you click outside of component', function() {
            vm.hideSuggestionsDropdown = false;
            var event = {
                relatedTarget: ''
            };
            vm.onBlurInput(event);

            expect(vm.hideSuggestionsDropdown).toBeTruthy();
        });

        it('should not hide dropdown if you click inside of component', function() {
            vm.hideSuggestionsDropdown = false;
            var event = {
                relatedTarget: 'something'
            };
            vm.onBlurInput(event);

            expect(vm.hideSuggestionsDropdown).toBeFalsy();
        });

        it('should reset chip focus on input focus', function() {
            vm.chipFocus = 1;
            vm.onFocusShowDropdown = true;
            vm.hideSuggestionsDropdown = true;

            vm.onFocusInput();

            expect(vm.chipFocus).toEqual(-1);
            expect(vm.hideSuggestionsDropdown).toBeFalsy();
        });

        it('should not show suggestion dropdown if options were set', function() {
            vm.onFocusShowDropdown = false;
            vm.hideSuggestionsDropdown = true;

            vm.onFocusInput();

            expect(vm.hideSuggestionsDropdown).toBeTruthy();
        });

        it('should prepend option string onto string', function() {
            vm.createNewOptions.prepend = "#";
            var mockString = "something";

            var newString = vm.prependCreateNewOptions(mockString);

            expect(newString).toEqual('#something');
        });

        it('should not prepend option string if not set', function() {
            vm.createNewOptions.prepend = "";
            var mockString = "something";

            var newString = vm.prependCreateNewOptions(mockString);

            expect(newString).toEqual(mockString);
        });

        it('should not prepend option string if already there', function() {
            vm.createNewOptions.prepend = "#";
            var mockString = "#something";

            var newString = vm.prependCreateNewOptions(mockString);

            expect(newString).toEqual(mockString);
        });

        it('should remove and select adjacent chip', function() {
            var index = 1;
            spyOn(vm, 'getAdjacentChipIndex').and.returnValue(0);
            spyOn(vm, 'removeChip');
            spyOn(vm, 'focusChip');
            vm.chips = [{id:1},{id:2},{id:3},{id:4}];

            vm.removeAndSelectAdjacentChip(index);
            $timeout.flush();

            expect(vm.removeChip).toHaveBeenCalledWith(vm.chips[index]);
            expect(vm.focusChip).toHaveBeenCalledWith(0);
        });

        it('should remove and select input if only one left', function() {
            var index = 0;
            spyOn(vm, 'getAdjacentChipIndex').and.returnValue(-1);
            spyOn(vm, 'removeChip');
            spyOn(vm, 'focusChip');
            spyOn(vm, 'setInputFocus');
            vm.chips = [{id:1}];

            vm.removeAndSelectAdjacentChip(index);

            expect(vm.removeChip).toHaveBeenCalledWith(vm.chips[index]);
            expect(vm.focusChip).not.toHaveBeenCalled();
            expect(vm.setInputFocus).toHaveBeenCalled();
        });

        it('expect to remove chip from chips list', function() {
            spyOn(vm, 'setInputFocus');
            spyOn(vm, 'checkMaxChipAmount');
            spyOn(vm, 'clearInput');
            vm.chips = [{id:1, selected: true, name:"mock"},{id:2, selected: true}];
            vm.removeChip(vm.chips[0]);
            $timeout.flush();

            expect(vm.chips.length).toEqual(1);
            expect(vm.chips[0]).toEqual({id:2, selected: true});
            expect(vm.clearInput).not.toHaveBeenCalled();
        });

        it('expect to remove chip and clear input if matches name', function() {
            vm.searchText = "something";
            spyOn(vm, 'setInputFocus');
            spyOn(vm, 'checkMaxChipAmount');
            spyOn(vm, 'clearInput');
            vm.chips = [{id:1, selected: true, name: vm.searchText},{id:2, selected: true}];
            vm.removeChip(vm.chips[0]);
            $timeout.flush();

            expect(vm.chips.length).toEqual(1);
            expect(vm.chips[0]).toEqual({id:2, selected: true});
            expect(vm.clearInput).toHaveBeenCalled();
        });

        it('should remove last from choices', function() {
            vm.chips = [{id:1, selected: true},{id:2, selected: true}];

            vm.removeLastFromChoices();

            expect(vm.chips.length).toEqual(1);
            expect(vm.chips[0]).toEqual({id:1, selected: true});
        });

        it('should sanitize suggestions', function() {
            spyOn(MultiselectHelper, 'sanitizeString');
            spyOn(vm, 'prependCreateNewOptions');
            vm.suggestionList = [{name: "moCK!"}];

            vm.sanitizeSuggestions();

            expect(MultiselectHelper.sanitizeString).toHaveBeenCalled();
            expect(vm.prependCreateNewOptions).toHaveBeenCalled();
        });

        it('should set focus to suggestion', function() {
            vm.focusIndex = 0;
            var found = 1;
            spyOn(vm, 'findIndexInSuggestions').and.returnValue(found);

            vm.setFocusToSuggestion();

            expect(vm.focusIndex).toEqual(found);
        });

        it('should set input focus', function() {
            vm.chipFocus = 2;
            vm.inputElement = angular.element('<div></div>');
            vm.setInputFocus();

            expect(vm.chipFocus).toEqual(-1);
        });

        it('should set focus and toggle when clicking on suggestion', function() {
            spyOn(vm, 'toggleSuggestion');
            var suggestion = {id:1};
            var index = 0;
            vm.focusIndex = 1;

            vm.suggestionClick(suggestion, index);

            expect(vm.focusIndex).toEqual(index);
            expect(vm.toggleSuggestion).toHaveBeenCalledWith(suggestion);
        });

        it('should toggle suggestion', function() {
            spyOn(vm, 'setInputFocus');
            spyOn(vm, 'removeChip');
            spyOn(vm, 'getSuggestedHelpText');
            vm.canAddChoice = false;
            var suggestion = {name: "mock", selected: true};

            vm.toggleSuggestion(suggestion);

            expect(vm.setInputFocus).toHaveBeenCalled();
            expect(vm.getSuggestedHelpText).toHaveBeenCalled();
            expect(vm.removeChip).toHaveBeenCalledWith(suggestion);
        });

        it('should toggle suggestion', function() {
            spyOn(vm, 'setInputFocus');
            spyOn(vm, 'addResult');
            spyOn(vm, 'getSuggestedHelpText');
            vm.canAddChoice = false;
            var suggestion = {name: "mock", selected: false};

            vm.toggleSuggestion(suggestion);

            expect(vm.getSuggestedHelpText).toHaveBeenCalled();
            expect(vm.addResult).toHaveBeenCalledWith(suggestion);
        });

        it('should create a new chip if focus is on create new', function() {
            spyOn(vm, 'setInputFocus');
            spyOn(vm, 'addResult');
            spyOn(vm, 'createNewChip');
            vm.canAddChoice = true;
            vm.focusIndex = 0;
            vm.chipFocus = -1;
            var suggestion = {name: "mock", selected: false};

            vm.toggleSuggestion(suggestion);

            expect(vm.createNewChip).toHaveBeenCalled();
        });
    });
})();
