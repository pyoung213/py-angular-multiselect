# py-angular-multiselect
Pure Angular multiselect (work in progress)

# Options

option  | description
------------- | -------------
canAddChoice  | <b>default:</b> true <br> <b>type:</b> boolean <br> Allows user to create their own choice.
createNewCase  | <b>default:</b> none <br> <b>type:</b> string <br> Helps sanitize a users choice ans suggestions. Options are: none, uppercase, lowercase, camelcase, capitalize, kebabcase, snakecase, startcase, nowhitespace;
createNewPrepend  | <b>default:</b> "" <br> <b>type:</b> string <br> Will prepend string onto suggestions and a users choice.
helpTextNew  | <b>default:</b> "(Create New)" <br> <b>type:</b> string <br> When a user is creating a choice, helpful text will display telling the user that they are creating a new choice.
helpTextSelected  | <b>default:</b> "(Already Selected)" <br> <b>type:</b> string <br> When a user is creating a choice, helpful text will display telling the user that their choice has already been selected.
helpTextSuggested  | <b>default:</b> "(Suggested)" <br> <b>type:</b> string <br> When a user is creating a choice, helpful text will display telling the user that their choice is in the suggested list.
isCaseSensitive  | <b>default:</b> false <br> <b>type:</b> boolean <br> If the suggestions should be case sensitive when matching user input.
maxChipsAmount  | <b>default:</b> null <br> <b>type:</b> integer <br> Number of max choices the user can make.
maxLengthInput  | <b>default:</b> null <br> <b>type:</b> integer <br> Max length a user can type into the input.
maxSuggestions  | <b>default:</b> null <br> <b>type:</b> integer <br> Max amount of suggestions that will display.
schemaDescription  | <b>default:</b> "description" <br> <b>type:</b> string <br> Allows you to change the description field to your schema.
schemaImage  | <b>default:</b> "url" <br> <b>type:</b> string <br> Allows you to change the image field to your schema.
schemaName  | <b>default:</b> "name" <br> <b>type:</b> string <br> Allows you to change the name field to your schema.
serverDebounceTime  |  <b>default:</b> 500 <br> <b>type:</b> integer <br> Lets you set a debounce to for the suggestions callback.
