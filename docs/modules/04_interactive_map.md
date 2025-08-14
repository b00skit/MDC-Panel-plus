# **Module Name**: Interactive Map

Create a new item in the navbar named "Interactive Map", should route to /map

## Instructions:
- This will be implemented within x phases, work on the phase you've been instructed to work on, don't worry about the other phases but feel free to take in the information for more context.

## Phase 1:
- Install react-leaflet to use for this project, the dependencies are:
npm install react@rc react-dom@rc leaflet
npm install react-leaflet@next
- Create a /map which lands someone into a page that loads the entire San Andreas map, use an implementation similar to what's presented in /docs/examples/
- The map images are located in /map/mapStyles/ (it has the same implementation as in the example)
- Don't worry about creating a search for the streets.
- Ensure the map is within it's own UI component for re-usability.

## Phase 2:
- Create a streets.json and compile a list of coordinates as presented in /docs/examples/
- Create a search bar inside of the leaflet map which if someone searches a street, it should scroll the map into the street, similar as to how the implementation in /docs/examples/ works.

## Phase 3:
- Add the ability to draw on the map, some basic tools such as an undo, redo button, the ability to draw with a sort of marker and ensure that there's at least a few colors to chose from, the ability to draw should be setup on the right side of the map.