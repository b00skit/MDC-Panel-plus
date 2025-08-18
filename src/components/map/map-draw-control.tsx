'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import FreeDraw from 'leaflet-freedraw';
import { Undo, Redo, Eraser, MapPin, Spline, Hexagon, Pencil } from 'lucide-react';
import './map.css';

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#a855f7', '#ec4899'];
type ToolType = 'marker' | 'polyline' | 'polygon' | 'freedraw' | null;

const DRAW_TOOLS: { type: ToolType; icon: React.ReactNode; title: string }[] = [
    { type: 'freedraw', icon: <Pencil />, title: 'Free Draw' },
    { type: 'marker', icon: <MapPin />, title: 'Draw a marker' },
    { type: 'polyline', icon: <Spline />, title: 'Draw a polyline' },
    { type: 'polygon', icon: <Hexagon />, title: 'Draw a polygon' },
];

const MapDrawControl = () => {
    const map = useMap();
    const [history, setHistory] = useState<L.Layer[]>([]);
    const [redoStack, setRedoStack] = useState<L.Layer[]>([]);
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [activeTool, setActiveTool] = useState<ToolType>(null);

    const drawnItemsRef = useRef(new L.FeatureGroup());
    const activeDrawerRef = useRef<any>(null);
    const freeDrawRef = useRef<FreeDraw | null>(null);
    const controlContainerRef = useRef<HTMLDivElement | null>(null);

    // Add the feature group to the map once
    useEffect(() => {
        const drawnItems = drawnItemsRef.current;
        if (!map.hasLayer(drawnItems)) {
            map.addLayer(drawnItems);
        }
        return () => {
            if (map.hasLayer(drawnItems)) {
                map.removeLayer(drawnItems);
            }
        };
    }, [map]);

    // Effect for handling the creation of a new drawing
    useEffect(() => {
        const handleCreated = (e: any) => {
            const layer = e.layer;
            if (layer instanceof L.Path) {
                layer.setStyle({ color: selectedColor });
            }

            // Always add to the FeatureGroup
            drawnItemsRef.current.addLayer(layer);

            // ✅ Force map to refresh immediately
            map.invalidateSize();

            setHistory((prev) => [...prev, layer]);
            setRedoStack([]); // Clear redo stack on new action

            if (activeDrawerRef.current?.disable) {
                activeDrawerRef.current.disable();
            }
            setActiveTool(null); // Deactivate tool after drawing
        };

        map.on(L.Draw.Event.CREATED, handleCreated);
        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated);
        };
    }, [map, selectedColor]);

    const stopCurrentDrawer = useCallback(() => {
        if (activeDrawerRef.current?.disable) {
            activeDrawerRef.current.disable();
            activeDrawerRef.current = null;
        }
        if (freeDrawRef.current) {
            map.removeLayer(freeDrawRef.current);
            freeDrawRef.current = null;
        }
    }, [map]);

    const activateDrawer = useCallback((type: ToolType) => {
        if (type === activeTool) {
            stopCurrentDrawer();
            setActiveTool(null);
            return;
        }

        stopCurrentDrawer();
        setActiveTool(type);

        if (type === null) return;

        let drawer;
        const options = { shapeOptions: { color: selectedColor } };

        switch (type) {
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
                    mode: 3,
                    smoothFactor: 0.3,
                    simplifyFactor: 1.5,
                });
                map.addLayer(freeDraw);

                freeDraw.on('markers', (event: any) => {
                    const latlngs = event.latLngs;
                    if (latlngs.length > 1) {
                        const polyline = L.polyline(latlngs, { color: selectedColor });
                        drawnItemsRef.current.addLayer(polyline);

                        // ✅ Force refresh
                        map.invalidateSize();

                        setHistory((prev) => [...prev, polyline]);
                        setRedoStack([]);
                    }
                });
                drawer = freeDraw;
                freeDrawRef.current = freeDraw;
                break;
        }
        activeDrawerRef.current = drawer;

        if (drawer?.enable) drawer.enable();
    }, [activeTool, map, selectedColor, stopCurrentDrawer]);

    const undo = useCallback(() => {
        const newHistory = [...history];
        const lastLayer = newHistory.pop();
        if (lastLayer) {
            drawnItemsRef.current.removeLayer(lastLayer);
            setRedoStack((redo) => [lastLayer, ...redo]);
            setHistory(newHistory);
        }
    }, [history]);

    const redo = useCallback(() => {
        const newRedoStack = [...redoStack];
        const nextLayer = newRedoStack.shift();
        if (nextLayer) {
            drawnItemsRef.current.addLayer(nextLayer);
            setHistory((h) => [...h, nextLayer]);
            setRedoStack(newRedoStack);
        }
    }, [redoStack]);

    const clearAll = useCallback(() => {
        drawnItemsRef.current.clearLayers();
        setHistory([]);
        setRedoStack([]);
    }, []);

    // **EFFECT 1: Create and add the control to the map (runs once)**
    useEffect(() => {
        const control = L.control({ position: 'topright' });

        control.onAdd = () => {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-custom-draw-controls');
            controlContainerRef.current = container;
            L.DomEvent.disableClickPropagation(container);

            const actionTools = [
                { id: 'undo', icon: <Undo />, title: 'Undo', action: undo },
                { id: 'redo', icon: <Redo />, title: 'Redo', action: redo },
                { id: 'clear', icon: <Eraser />, title: 'Clear All', action: clearAll },
            ];

            const drawContainer = L.DomUtil.create('div', 'leaflet-draw-custom-container', container);
            DRAW_TOOLS.forEach(tool => {
                const btn = L.DomUtil.create('button', 'leaflet-custom-draw-button', drawContainer);
                btn.title = tool.title;
                btn.dataset.toolType = tool.type;
                createRoot(btn).render(tool.icon);
                L.DomEvent.on(btn, 'click', () => activateDrawer(tool.type));
            });

            const actionContainer = L.DomUtil.create('div', 'leaflet-draw-action-container', container);
            actionTools.forEach(tool => {
                const btn = L.DomUtil.create('button', 'leaflet-custom-draw-button', actionContainer);
                btn.title = tool.title;
                btn.id = `leaflet-draw-tool-${tool.id}`;
                createRoot(btn).render(tool.icon);
                L.DomEvent.on(btn, 'click', tool.action);
            });

            const colorPicker = L.DomUtil.create('div', 'leaflet-custom-color-picker', container);
            colors.forEach(color => {
                const colorButton = L.DomUtil.create('button', 'leaflet-color-button', colorPicker);
                colorButton.style.backgroundColor = color;
                colorButton.dataset.color = color;
                L.DomEvent.on(colorButton, 'click', () => setSelectedColor(color));
            });

            return container;
        };

        control.addTo(map);
        return () => {
            map.removeControl(control);
        };
    }, [map, activateDrawer, undo, redo, clearAll]);

    // **EFFECT 2: Update the control's UI based on state changes**
    useEffect(() => {
        if (!controlContainerRef.current) return;
        const container = controlContainerRef.current;

        container.querySelectorAll<HTMLButtonElement>('[data-tool-type]').forEach(btn => {
            if (btn.dataset.toolType === activeTool) {
                L.DomUtil.addClass(btn, 'active');
            } else {
                L.DomUtil.removeClass(btn, 'active');
            }
        });

        (container.querySelector('#leaflet-draw-tool-undo') as HTMLButtonElement).disabled = history.length === 0;
        (container.querySelector('#leaflet-draw-tool-redo') as HTMLButtonElement).disabled = redoStack.length === 0;
        (container.querySelector('#leaflet-draw-tool-clear') as HTMLButtonElement).disabled = history.length === 0;

        container.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(btn => {
            if (btn.dataset.color === selectedColor) {
                L.DomUtil.addClass(btn, 'selected');
            } else {
                L.DomUtil.removeClass(btn, 'selected');
            }
        });
    }, [activeTool, history, redoStack, selectedColor]);

    return null;
};

export default MapDrawControl;
