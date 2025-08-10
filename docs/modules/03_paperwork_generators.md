# **Module Name**: Paperwork Generators

We're going to be creating a dynamic paperwork generator, the end-goal is to allow users to create their own paperwork forms.

## Instructions:
- This will be implemented within phases, work on the phase you've been instructed to work on, don't worry about the other phases but feel free to take in the information for more context.

## Phase 1:
- Create a /paperwork-generators route, for now you'll only be loading from data/paperwork-generators (site-generated content), in here we'll have json files that effectively have the information for the forms. These paperwork generators should be loaded in cards. In the future, we'll allow users to create their own forms to be saved in data/forms (should be gitignored), these user entires should be loaded in a table.
- When a user clicks said generator from the selection, it should parse the json and create a form based on the user selection, the user should have the ability to customize input fields, dropdowns and even add multiple entires (for example an input group where you have +add for multiple inputs)
- Within the json there should be a generated format, the user should utilize wildcards with names of the input fields and in the case of multiple inputs, a start and end wildcard as well.
- Alongside basic input fields, add some features that the website offers, for example an officer section (with the ability to customize it), the arrest calculator (with the ability to modify which ids will show) and the general section.
- For now only worry about the data/paperwork-generators

## Phase 2:
- In this phase we're going to be making a form builder, this form builder should save inside of data/forms, create some basic handling that saves into a json that you can then parse into the actual site content.
- Enable/disable the ability to use the form builder (enable/disable the ability for the public to basically create their own forms) via config.json