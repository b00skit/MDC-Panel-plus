
'use client';
import { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Eraser, MapPin, Edit, Trash2 } from 'lucide-react';
import './map.css';
import { cn } from '@/lib/utils';

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#a855f7', '#ec4899'];

const MapDrawControl = () => {
  const map = useMap();
  const [history, setHistory] = useState<L.Layer[]>([]);
  const [redoStack, setRedoStack] = useState<L.Layer[]>([]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const activeDrawerRef = useRef<any>(null);


  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    if (!map.hasLayer(drawnItems)) {
        map.addLayer(drawnItems);
    }
    
    const handleCreated = (e: any) => {
        const layer = e.layer;
        if (layer instanceof L.Path) {
            layer.setStyle({ color: selectedColor });
        }
        drawnItems.addLayer(layer);
        setHistory((prev) => [...prev, layer]);
        setRedoStack([]);
        if(activeDrawerRef.current?.disable) {
            activeDrawerRef.current.disable();
        }
    }
    
    map.on(L.Draw.Event.CREATED, handleCreated);

    return () => {
        map.off(L.Draw.Event.CREATED, handleCreated);
    }
  }, [map, selectedColor]);
  
  const activateDrawer = (type: 'marker' | 'polyline' | 'polygon') => {
      if (activeDrawerRef.current?.disable) {
          activeDrawerRef.current.disable();
      }

      let drawer;
      const options = {
          shapeOptions: {
              color: selectedColor,
          },
      };

      switch(type) {
          case 'marker':
            drawer = new L.Draw.Marker(map);
            break;
          case 'polyline':
            drawer = new L.Draw.Polyline(map, options);
            break;
          case 'polygon':
            drawer = new L.Draw.Polygon(map, options);
            break;
      }
      activeDrawerRef.current = drawer;
      drawer.enable();
  }

  const undo = () => {
      setHistory((prev) => {
          if (prev.length === 0) return prev;
          const newHistory = [...prev];
          const lastLayer = newHistory.pop();
          if (lastLayer) {
              drawnItemsRef.current.removeLayer(lastLayer);
              setRedoStack((redo) => [...redo, lastLayer]);
          }
          return newHistory;
      });
  };

  const redo = () => {
      setRedoStack((prev) => {
          if (prev.length === 0) return prev;
          const newRedoStack = [...prev];
          const lastRedoLayer = newRedoStack.pop();
          if (lastRedoLayer) {
              drawnItemsRef.current.addLayer(lastRedoLayer);
              setHistory((h) => [...h, lastRedoLayer]);
          }
          return newRedoStack;
      });
  };

  const clearAll = () => {
      drawnItemsRef.current.clearLayers();
      setHistory([]);
      setRedoStack([]);
  };

  useEffect(() => {
    const controlContainer = L.control({ position: 'topright' });
    controlContainer.onAdd = () => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-custom-draw-controls');
        L.DomEvent.disableClickPropagation(container);

        const createButton = (icon: string, title: string, onClick: () => void, disabled?: () => boolean) => {
            const btn = document.createElement('button');
            btn.className = "p-2 hover:bg-muted rounded-md disabled:opacity-50";
            btn.title = title;
            btn.innerHTML = icon;
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled || !disabled()) onClick();
            };
            
            // This is a bit of a hack to re-render disabled state
            const interval = setInterval(() => {
                if(disabled) {
                    btn.disabled = disabled();
                }
            }, 200)

            // Cleanup
            const observer = new MutationObserver(() => {
                if (!document.body.contains(btn)) {
                    clearInterval(interval);
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });

            return btn;
        };

        const drawContainer = L.DomUtil.create('div', 'leaflet-draw-custom-container', container);
        drawContainer.appendChild(createButton(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`, 'Draw a marker', () => activateDrawer('marker')));
        drawContainer.appendChild(createButton(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-spline"><path d="M8 22c5 0 5-11.5 5-20"/><path d="M16 22c-5 0-5-11.5-5-20"/></svg>`, 'Draw a polyline', () => activateDrawer('polyline')));
        drawContainer.appendChild(createButton(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hexagon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`, 'Draw a polygon', () => activateDrawer('polygon')));

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
        
        container.appendChild(createButton('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-undo-2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>', 'Undo', undo, () => history.length === 0));
        container.appendChild(createButton('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo-2"><path d="M15 14 20 9l-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>', 'Redo', redo, () => redoStack.length === 0));
        container.appendChild(createButton('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eraser"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 12 5 5"/></svg>', 'Clear All', clearAll, () => history.length === 0));
        
        return container;
    };
    
    controlContainer.addTo(map);

    return () => {
        map.removeControl(controlContainer);
    };
  }, [map, selectedColor, history, redoStack]);

  return null;
};

export default MapDrawControl;
