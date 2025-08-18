
'use client';
import { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import FreeDraw from 'leaflet-freedraw';
import { Undo, Redo, Eraser, MapPin, Spline, Hexagon, Pencil } from 'lucide-react';
import './map.css';
import { cn } from '@/lib/utils';

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#a855f7', '#ec4899'];

type ToolType = 'marker' | 'polyline' | 'polygon' | 'freedraw' | null;

const MapDrawControl = () => {
  const map = useMap();
  const [history, setHistory] = useState<L.Layer[]>([]);
  const [redoStack, setRedoStack] = useState<L.Layer[]>([]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const activeDrawerRef = useRef<any>(null);
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const freeDrawRef = useRef<FreeDraw | null>(null);

  // Force map redraw when history changes to fix free-draw bug
  useEffect(() => {
    map.invalidateSize();
  }, [history.length, map]);


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
        setActiveTool(null);
    }
    
    map.on(L.Draw.Event.CREATED, handleCreated);

    return () => {
        map.off(L.Draw.Event.CREATED, handleCreated);
        if (freeDrawRef.current) {
            map.removeLayer(freeDrawRef.current);
            freeDrawRef.current = null;
        }
    }
  }, [map, selectedColor]);
  
  const stopCurrentDrawer = () => {
    if (activeDrawerRef.current) {
        if (activeDrawerRef.current.disable) {
            activeDrawerRef.current.disable();
        }
        activeDrawerRef.current = null;
    }
    if (freeDrawRef.current) {
        map.removeLayer(freeDrawRef.current);
        freeDrawRef.current = null;
    }
  };

  const activateDrawer = (type: ToolType) => {
      if (type === activeTool) {
        stopCurrentDrawer();
        setActiveTool(null);
        return;
      }
      
      stopCurrentDrawer();
      setActiveTool(type);

      if (type === null) return;

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
          case 'freedraw':
            const freeDraw = new FreeDraw({
                mode: 3, // CREATE | EDIT
                smoothFactor: 0.3,
                simplifyFactor: 1.5,
                createExitMode: 2, // EDIT
                editExitMode: 2, // EDIT
            });
            map.addLayer(freeDraw);
            
            freeDraw.on('markers', (event: any) => {
                const latlngs = event.latLngs;
                if(latlngs.length > 1) {
                    const polyline = L.polyline(latlngs, { color: selectedColor });
                    drawnItemsRef.current.addLayer(polyline);
                    setHistory((prev) => [...prev, polyline]);
                    setRedoStack([]);
                }
            });
            drawer = freeDraw;
            freeDrawRef.current = freeDraw;
            break;
      }
      activeDrawerRef.current = drawer;
      
      if(drawer?.enable) drawer.enable();
  }

  const undo = () => {
      const newHistory = [...history];
      const lastLayer = newHistory.pop();
      if (lastLayer) {
          drawnItemsRef.current.removeLayer(lastLayer);
          setRedoStack((redo) => [lastLayer, ...redo]);
          setHistory(newHistory);
      }
  };

  const redo = () => {
      const newRedoStack = [...redoStack];
      const nextLayer = newRedoStack.shift();
      if (nextLayer) {
          drawnItemsRef.current.addLayer(nextLayer);
          setHistory((h) => [...h, nextLayer]);
          setRedoStack(newRedoStack);
      }
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

        const drawTools: {type: ToolType, icon: React.ReactNode, title: string}[] = [
            { type: 'freedraw', icon: <Pencil />, title: 'Free Draw'},
            { type: 'marker', icon: <MapPin />, title: 'Draw a marker'},
            { type: 'polyline', icon: <Spline />, title: 'Draw a polyline'},
            { type: 'polygon', icon: <Hexagon />, title: 'Draw a polygon'},
        ];

        const actionTools = [
            { icon: <Undo />, title: 'Undo', action: undo, disabled: () => history.length === 0 },
            { icon: <Redo />, title: 'Redo', action: redo, disabled: () => redoStack.length === 0 },
            { icon: <Eraser />, title: 'Clear All', action: clearAll, disabled: () => history.length === 0 },
        ];

        const createButton = (tool: any) => {
            const btn = document.createElement('button');
            btn.className = "leaflet-custom-draw-button";
            btn.title = tool.title;
            
            if (tool.type && tool.type === activeTool) {
                btn.classList.add('active');
            }
            const root = createRoot(btn);
            root.render(tool.icon);


            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if(tool.type) {
                  activateDrawer(tool.type);
                } else {
                  tool.action();
                }
            };

            if (tool.disabled) {
                const interval = setInterval(() => {
                    btn.disabled = tool.disabled();
                }, 200);
                
                const observer = new MutationObserver(() => {
                    if (!document.body.contains(btn)) {
                        clearInterval(interval);
                        observer.disconnect();
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }
            return btn;
        };
        
        const drawContainer = L.DomUtil.create('div', 'leaflet-draw-custom-container', container);
        drawTools.forEach(tool => drawContainer.appendChild(createButton(tool)));

        const actionContainer = L.DomUtil.create('div', 'leaflet-draw-action-container', container);
        actionTools.forEach(tool => actionContainer.appendChild(createButton(tool)));

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
        
        return container;
    };
    
    controlContainer.addTo(map);

    return () => {
        map.removeControl(controlContainer);
    };
  }, [map, selectedColor, history, redoStack, activeTool]);

  return null;
};

export default MapDrawControl;
