'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import { Undo, Redo, Eraser, MapPin, Spline, Hexagon, Pencil, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';
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
    const map = useMap() as L.DrawMap;
    const [history, setHistory] = useState<L.Layer[]>([]);
    const [redoStack, setRedoStack] = useState<L.Layer[]>([]);
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [activeTool, setActiveTool] = useState<ToolType>(null);

    const drawnItemsRef = useRef(new L.FeatureGroup());
    const activeDrawerRef = useRef<any>(null);
    const controlContainerRef = useRef<HTMLDivElement | null>(null);

    const colorRef = useRef(selectedColor);
    useEffect(() => {
        colorRef.current = selectedColor;
    }, [selectedColor]);

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

    useEffect(() => {
        const handleCreated = (e: any) => {
            const layer = e.layer;
            if (layer instanceof L.Path) {
                layer.setStyle({ color: selectedColor });
            } else if (layer instanceof L.Marker) {
                const icon = L.divIcon({
                    className: '',
                    html: `<div style="background:${selectedColor};width:16px;height:16px;border:2px solid white;border-radius:50%"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                });
                layer.setIcon(icon);
            }

            drawnItemsRef.current.addLayer(layer);
            map.invalidateSize();
            setHistory((prev) => [...prev, layer]);
            setRedoStack([]);

            if (activeDrawerRef.current?.disable) {
                activeDrawerRef.current.disable();
            }
            setActiveTool(null);
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
    }, []);

    const activateDrawer = useCallback((type: ToolType) => {
        if (type === activeTool) {
            stopCurrentDrawer();
            setActiveTool(null);
            return;
        }

        stopCurrentDrawer();
        setActiveTool(type);

        if (type === null) return;

        let drawer : L.Draw.Feature;
        const options = { shapeOptions: { color: selectedColor } };

        switch (type) {
            case 'marker':
                drawer = new L.Draw.Marker(map, {
                    icon: L.divIcon({
                        className: '',
                        html: `<div style="background:${selectedColor};width:16px;height:16px;border:2px solid white;border-radius:50%"></div>`,
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                    }),
                });
                break;
            case 'polyline':
                drawer = new L.Draw.Polyline(map, options);
                break;
            case 'polygon':
                drawer = new L.Draw.Polygon(map, options);
                break;
            case 'freedraw':
                let isDrawing = false;
                let polyline: L.Polyline | null = null;

                const onMouseDown = (e: L.LeafletMouseEvent) => {
                    isDrawing = true;
                    polyline = L.polyline([e.latlng], { color: colorRef.current });
                    drawnItemsRef.current.addLayer(polyline);
                    map.dragging.disable();
                };

                const onMouseMove = (e: L.LeafletMouseEvent) => {
                    if (!isDrawing || !polyline) return;
                    polyline.addLatLng(e.latlng);
                };

                const finish = () => {
                    if (!isDrawing || !polyline) return;
                    isDrawing = false;
                    map.dragging.enable();
                    map.invalidateSize();
                    const currentPolyline = polyline;
                    setHistory((prev) => [...prev, currentPolyline as L.Layer]);
                    setRedoStack([]);
                    polyline = null;
                };

                map.on('mousedown', onMouseDown);
                map.on('mousemove', onMouseMove);
                map.on('mouseup', finish);
                map.on('mouseleave', finish);
                drawer = new L.Draw.Feature(map);
                drawer.disable = () => {
                    map.off('mousedown', onMouseDown);
                    map.off('mousemove', onMouseMove);
                    map.off('mouseup', finish);
                    map.off('mouseleave', finish);
                    map.dragging.enable();
                    return drawer;
                };
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

    const takeSnapshot = useCallback(() => {
        const mapContainer = map.getContainer();
        const uiControls = mapContainer.querySelectorAll<HTMLElement>('.leaflet-control, .leaflet-control-search, .leaflet-custom-draw-controls');

        uiControls.forEach(control => control.style.display = 'none');

        html2canvas(mapContainer, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null, 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'map_snapshot.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            uiControls.forEach(control => control.style.display = '');
        }).catch(err => {
            console.error("Failed to take snapshot:", err);
            uiControls.forEach(control => control.style.display = '');
        });
    }, [map]);


    useEffect(() => {
        const control = new L.Control({ position: 'topright' });

        control.onAdd = () => {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-custom-draw-controls');
            controlContainerRef.current = container;
            L.DomEvent.disableClickPropagation(container);

            const actionTools = [
                { id: 'undo', icon: <Undo />, title: 'Undo', action: undo },
                { id: 'redo', icon: <Redo />, title: 'Redo', action: redo },
                { id: 'clear', icon: <Eraser />, title: 'Clear All', action: clearAll },
                { id: 'snapshot', icon: <Camera />, title: 'Take Snapshot', action: takeSnapshot },
            ];

            const drawContainer = L.DomUtil.create('div', 'leaflet-draw-custom-container', container);
            DRAW_TOOLS.forEach(tool => {
                const btn = L.DomUtil.create('button', 'leaflet-custom-draw-button', drawContainer);
                btn.title = tool.title;
                btn.dataset.toolType = tool.type as string;
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
    }, [map, activateDrawer, undo, redo, clearAll, takeSnapshot]);

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