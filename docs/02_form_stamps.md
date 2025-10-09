# **App Name**: Form Stamps

## Instructions:
- Only do the implementation in phases, as provided by the developer. You may read the other phases for context but don't worry about implementation of other phases.

### Phase 1:
- Create a new navitem called 'Form Stamps' and add /form-stamps as a route, it should work the same way as paperwork-generators work, there should be a global form stamps, there should be a section for handling hidden ones, there should be a section for handling faction-specific ones as defined within manifests, effectively the fetching of forms should be the same way as usual.

### Phase 2:
- Within the data/form-stamps folder, create an img folder & font folder.
- accessing a form stamp should be simple, the left side should have input fields as defined within the json, the right side should have an image preview, the json should define which image is being manipulated, the json also defines which input field has which text and where on the image the text is displayed.
- As the user types in the input box, it should change the text on the image on the preview.
- A download button should be displayed below the image to then download the image with the text appended onto it.