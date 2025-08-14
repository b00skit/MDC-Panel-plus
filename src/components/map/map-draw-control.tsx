
'use client';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Eraser, MapPin } from 'lucide-react';
import './map.css';

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#a855f7', '#ec4899'];

const MapDrawControl = () => {
  const map = useMap();
  const [history, setHistory] = useState<L.Layer[]>([]);
  const [redoStack, setRedoStack] = useState<L.Layer[]>([]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polyline: {
          shapeOptions: { color: selectedColor },
        },
        polygon: {
          shapeOptions: { color: selectedColor },
        },
        rectangle: {
          shapeOptions: { color: selectedColor },
        },
        circle: {
            shapeOptions: { color: selectedColor },
        },
        circlemarker: false,
        marker: true,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });

    // This is a bit of a hack to add the control to a custom container
    const customControlContainer = L.DomUtil.create('div', 'leaflet-draw-custom-container');
    
    // We render the custom toolbar and then mount the leaflet-draw toolbar inside it
    const drawToolbar = new L.Draw.Toolbar(drawControl.options.draw);
    
    // @ts-ignore
    drawToolbar.addTo(map, customControlContainer);

    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      if (layer instanceof L.Path) {
        layer.setStyle({ color: selectedColor });
      }
      drawnItems.addLayer(layer);
      setHistory((prev) => [...prev, layer]);
      setRedoStack([]); // Clear redo stack on new action
    });
    
    map.on(L.Draw.Event.EDITED, (e) => {
       const layers = e.layers.getLayers();
       setHistory(prev => [...prev, ...layers]);
       setRedoStack([]);
    });

    map.on(L.Draw.Event.DELETED, (e) => {
        e.layers.eachLayer(layer => {
            setHistory(prev => prev.filter(l => l !== layer));
        });
        setRedoStack([]);
    });

    const undo = () => {
      setHistory((prev) => {
        const lastLayer = prev[prev.length - 1];
        if (lastLayer) {
          drawnItems.removeLayer(lastLayer);
          setRedoStack((redo) => [...redo, lastLayer]);
          return prev.slice(0, -1);
        }
        return prev;
      });
    };

    const redo = () => {
      setRedoStack((prev) => {
        const lastRedoLayer = prev[prev.length - 1];
        if (lastRedoLayer) {
          drawnItems.addLayer(lastRedoLayer);
          setHistory((h) => [...h, lastRedoLayer]);
          return prev.slice(0, -1);
        }
        return prev;
      });
    };
    
    const clearAll = () => {
        drawnItems.clearLayers();
        setHistory([]);
        setRedoStack([]);
    }

    const controlContainer = L.control({ position: 'topright' });
    controlContainer.onAdd = () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-custom-draw-controls');
        L.DomEvent.disableClickPropagation(container);

        const createButton = (icon: React.ReactNode, onClick: () => void, title: string, disabled?: boolean) => {
            const btn = L.DomUtil.create('a', 'leaflet-custom-draw-button', container);
            btn.innerHTML = (icon as any).props.outerHTML || '';
            btn.href = '#';
            btn.title = title;
            if(disabled) {
                L.DomUtil.addClass(btn, 'leaflet-disabled');
            }
            L.DomEvent.on(btn, 'click', (e) => {
                L.DomEvent.stop(e);
                if(!disabled) onClick();
            });
            return btn;
        }

        // We will create React components and mount them manually for better control
        const undoButton = document.createElement('button');
        undoButton.className = "p-2 hover:bg-muted rounded-md disabled:opacity-50";
        undoButton.title = "Undo";
        undoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/></svg>`;
        undoButton.onclick = (e) => { e.preventDefault(); e.stopPropagation(); undo(); };
        container.appendChild(undoButton);
        
        const redoButton = document.createElement('button');
        redoButton.className = "p-2 hover:bg-muted rounded-md disabled:opacity-50";
        redoButton.title = "Redo";
        redoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/></svg>`;
        redoButton.onclick = (e) => { e.preventDefault(); e.stopPropagation(); redo(); };
        container.appendChild(redoButton);
        
        const clearButton = document.createElement('button');
        clearButton.className = "p-2 hover:bg-muted rounded-md disabled:opacity-50";
        clearButton.title = "Clear All";
        clearButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eraser" viewBox="0 0 16 16"><path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/></svg>`;
        clearButton.onclick = (e) => { e.preventDefault(); e.stopPropagation(); clearAll(); };
        container.appendChild(clearButton);
        
        const colorPicker = L.DomUtil.create('div', 'leaflet-custom-color-picker', container);
        colors.forEach(color => {
            const colorButton = L.DomUtil.create('button', 'leaflet-color-button', colorPicker);
            colorButton.style.backgroundColor = color;
            if (color === selectedColor) {
                L.DomUtil.addClass(colorButton, 'selected');
            }
            L.DomEvent.on(colorButton, 'click', (e) => {
                L.DomEvent.stop(e);
                setSelectedColor(color);
                const oldSelected = colorPicker.querySelector('.selected');
                if (oldSelected) {
                    L.DomUtil.removeClass(oldSelected as HTMLElement, 'selected');
                }
                L.DomUtil.addClass(colorButton, 'selected');
            });
        });

        const markerButton = L.DomUtil.create('a', 'leaflet-draw-draw-marker', customControlContainer);
        markerButton.title = 'Draw a marker';
        markerButton.href = '#';

        const polylineButton = L.DomUtil.create('a', 'leaflet-draw-draw-polyline', customControlContainer);
        polylineButton.title = 'Draw a polyline';
        polylineButton.href = '#';

        const polygonButton = L.DomUtil.create('a', 'leaflet-draw-draw-polygon', customControlContainer);
        polygonButton.title = 'Draw a polygon';
        polygonButton.href = '#';

        container.appendChild(customControlContainer);

        return container;
    };
    controlContainer.addTo(map);

    return () => {
        // Cleanup when component unmounts
        map.removeControl(controlContainer);
        map.removeLayer(drawnItems);
    };
  }, [map, selectedColor]);

  return null;
};

export default MapDrawControl;
