/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { useSocket } from '../hooks/useSocket';
import { updateDesign } from '../api/api';
import Toolbar from './Toolbar';
import LayerPanel from './LayerPanel';
import debounce from 'lodash.debounce';
import '../styles/ui-panels.css';

interface KonvaObject {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fill?: string;
  fontSize?: number;
  rotation?: number;
}

interface DesignLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  objects: KonvaObject[];
}

interface Props {
  designId: string;
  canvasData: any;
  onSelectObject?: (id: string | null) => void;
  onColorSelect?: (color: string) => void;
  selectedColor?: string;
}

const CANVAS_SIZE = { width: 1080, height: 1080 };

const CanvasEditor: React.FC<Props> = ({
  designId,
  canvasData,
  onSelectObject,
  onColorSelect,
  selectedColor,
}) => {
  const socket = useSocket();
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // ---- Undo/Redo stacks ----
  const history = useRef<string[]>([]);
  const step = useRef(-1);
  const MAX = 20;

  // ---------- Load initial layers ----------
  useEffect(() => {
    if (canvasData?.layers?.length) {
      setLayers(canvasData.layers);
      setSelectedLayerId(canvasData.layers[0].id);
    } else {
      const defaultLayer: DesignLayer = {
        id: 'layer_1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        objects: [],
      };
      setLayers([defaultLayer]);
      setSelectedLayerId(defaultLayer.id);
    }
  }, [canvasData]);

  // ---------- Push history ----------
  useEffect(() => {
    if (!layers.length) return;
    const json = JSON.stringify(layers);
    if (step.current >= 0 && history.current[step.current] === json) return;
    history.current = history.current.slice(0, step.current + 1);
    history.current.push(json);
    if (history.current.length > MAX) history.current.shift();
    step.current = history.current.length - 1;
  }, [layers]);

  const undo = () => {
    if (step.current <= 0) return;
    step.current--;
    setLayers(JSON.parse(history.current[step.current]));
  };

  const redo = () => {
    if (step.current >= history.current.length - 1) return;
    step.current++;
    setLayers(JSON.parse(history.current[step.current]));
  };

  // ---------- Notify parent of selection ----------
  useEffect(() => {
    onSelectObject?.(selectedId);
  }, [selectedId, onSelectObject]);

  // ---------- Apply external color from parent ----------
  useEffect(() => {
    if (!selectedId || !selectedColor) return;
    setLayers((prev) =>
      prev.map((l) => ({
        ...l,
        objects: l.objects.map((o) =>
          o.id === selectedId ? { ...o, fill: selectedColor } : o
        ),
      }))
    );
  }, [selectedColor, selectedId]);

  // ---------- Add Object ----------
  const addObject = (type: KonvaObject['type']) => {
    if (!selectedLayerId) return;
    const newObj: KonvaObject = {
      id: `obj_${Date.now()}`,
      type,
      x: 100,
      y: 100,
      fill: type === 'text' ? '#000' : type === 'rect' ? '#4caf50' : '#ff9800',
      width: type === 'rect' ? 200 : undefined,
      height: type === 'rect' ? 100 : undefined,
      radius: type === 'circle' ? 60 : undefined,
      text: type === 'text' ? 'Double click to edit' : undefined,
      fontSize: type === 'text' ? 28 : undefined,
      rotation: 0,
    };
    setLayers((prev) =>
      prev.map((l) =>
        l.id === selectedLayerId
          ? { ...l, objects: [...l.objects, newObj] }
          : l
      )
    );
    setSelectedId(newObj.id);
  };

  // ---------- Local Color Update ----------
  const handleColorSelect = (color: string) => {
    if (!selectedId) return;
    setLayers((prev) =>
      prev.map((l) => ({
        ...l,
        objects: l.objects.map((o) =>
          o.id === selectedId ? { ...o, fill: color } : o
        ),
      }))
    );

    onColorSelect?.(color); // Notify parent

    socket.current?.emit('canvas:colorChange', {
      designId,
      objectId: selectedId,
      color,
      source: 'ui',
    });
  };

  // ---------- Listen for colorChange events ----------
  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const handleColorChange = ({
      designId: eventDesignId,
      objectId,
      color,
    }: {
      designId: string;
      objectId: string;
      color: string;
    }) => {
      if (eventDesignId !== designId) return;
      setLayers((prev) =>
        prev.map((l) => ({
          ...l,
          objects: l.objects.map((o) =>
            o.id === objectId ? { ...o, fill: color } : o
          ),
        }))
      );
    };

    s.on('canvas:colorChange', handleColorChange);
    return () => s.off('canvas:colorChange', handleColorChange);
  }, [socket, designId]);

  // ---------- LayerPanel Updates (preserve objects) ----------
  const handleUpdateLayers = (updatedUI: any[]) => {
    setLayers((prev) =>
      updatedUI.map((uiL) => {
        const old = prev.find((l) => l.id === uiL.id);
        return old
          ? { ...old, ...uiL, objects: old.objects ?? [] }
          : { ...uiL, objects: [] };
      })
    );
  };

  // ---------- Drag / Transform ----------
  const onDragEnd = (layerId: string, id: string, e: any) => {
    const { x, y } = e.target.position();
    setLayers((prev) =>
      prev.map((l) =>
        l.id === layerId
          ? {
              ...l,
              objects: l.objects.map((o) =>
                o.id === id ? { ...o, x, y } : o
              ),
            }
          : l
      )
    );
  };

  const onTransformEnd = (layerId: string, id: string, e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    setLayers((prev) =>
      prev.map((l) =>
        l.id === layerId
          ? {
              ...l,
              objects: l.objects.map((o) =>
                o.id === id
                  ? {
                      ...o,
                      x: node.x(),
                      y: node.y(),
                      width: node.width() * scaleX,
                      height: node.height() * scaleY,
                      rotation: node.rotation(),
                    }
                  : o
              ),
            }
          : l
      )
    );
  };

  // ---------- Delete Selected ----------
  const deleteSelected = () => {
    if (!selectedId) return;
    setLayers((prev) =>
      prev.map((l) => ({
        ...l,
        objects: l.objects.filter((o) => o.id !== selectedId),
      }))
    );
    setSelectedId(null);
  };

  // ---------- Broadcast to backend ----------
  const broadcast = useCallback(
    debounce((newLayers: DesignLayer[]) => {
      socket.current?.emit('canvas:update', {
        designId,
        canvas: { layers: newLayers },
      });
      updateDesign(designId, { canvas: { layers: newLayers } }).catch(console.error);
    }, 500),
    [socket, designId]
  );

  useEffect(() => {
    if (layers.length) broadcast(layers);
  }, [layers, broadcast]);

  // ---------- Transformer sync ----------
  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;
    if (!transformer) return;
    const selectedNode = selectedId ? stage.findOne(`#${selectedId}`) : null;
    transformer.nodes(selectedNode ? [selectedNode] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedId, layers]);

  // ---------- Inline Text Editing ----------
  const handleTextDblClick = (layerId: string, obj: KonvaObject, e: any) => {
    const stage = stageRef.current;
    const textNode = e.target as Konva.Text;
    const textPosition = textNode.getAbsolutePosition(stage);
    const scale = stage.scaleX();

    const areaPosition = {
      x: textPosition.x * scale + stage.container().offsetLeft,
      y: textPosition.y * scale + stage.container().offsetTop,
    };

    const textarea = document.createElement('textarea');
    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width() * scale}px`;
    textarea.style.fontSize = `${textNode.fontSize() * scale}px`;
    textarea.style.border = '1px solid #ccc';
    textarea.style.padding = '2px';
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.zIndex = '1000';

    document.body.appendChild(textarea);
    textAreaRef.current = textarea;
    textarea.focus();

    const removeTextarea = () => {
      const value = textarea.value;
      document.body.removeChild(textarea);
      textAreaRef.current = null;

      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId
            ? {
                ...l,
                objects: l.objects.map((o) =>
                  o.id === obj.id ? { ...o, text: value } : o
                ),
              }
            : l
        )
      );
    };

    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) removeTextarea();
    });
    textarea.addEventListener('blur', removeTextarea);
  };

  // ---------- RENDER ----------
  return (
    <div className="canvas-editor-wrapper" style={{ display: 'flex' }}>
      <LayerPanel
        layers={layers.map(({ id, name, visible, locked }) => ({
          id,
          name,
          visible,
          locked,
        }))}
        designId={designId}
        selectedLayerId={selectedLayerId}
        onSelect={setSelectedLayerId}
        onUpdate={handleUpdateLayers}
      />

      <div className="canvas-editor-center">
        <Toolbar
          addObject={addObject}
          undo={undo}
          redo={redo}
          exportPNG={() => {
            const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
            const a = document.createElement('a');
            a.href = uri;
            a.download = 'design.png';
            a.click();
          }}
          deleteSelected={deleteSelected}
        />

        <Stage
          ref={stageRef}
          width={CANVAS_SIZE.width}
          height={CANVAS_SIZE.height}
          style={{
            background: '#fff',
            border: '1px solid #ccc',
            margin: '0 auto',
          }}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
        >
          {layers
            .filter((l) => l.visible)
            .map((layer) => (
              <Layer key={layer.id} listening={!layer.locked}>
                {layer.objects.map((obj) => {
                  switch (obj.type) {
                    case 'rect':
                      return (
                        <Rect
                          key={obj.id}
                          id={obj.id}
                          x={obj.x}
                          y={obj.y}
                          width={obj.width}
                          height={obj.height}
                          fill={obj.fill}
                          draggable={!layer.locked}
                          rotation={obj.rotation}
                          onClick={() => setSelectedId(obj.id)}
                          onDragEnd={(e) => onDragEnd(layer.id, obj.id, e)}
                          onTransformEnd={(e) =>
                            onTransformEnd(layer.id, obj.id, e)
                          }
                        />
                      );
                    case 'circle':
                      return (
                        <Circle
                          key={obj.id}
                          id={obj.id}
                          x={obj.x}
                          y={obj.y}
                          radius={obj.radius}
                          fill={obj.fill}
                          draggable={!layer.locked}
                          rotation={obj.rotation}
                          onClick={() => setSelectedId(obj.id)}
                          onDragEnd={(e) => onDragEnd(layer.id, obj.id, e)}
                          onTransformEnd={(e) =>
                            onTransformEnd(layer.id, obj.id, e)
                          }
                        />
                      );
                    case 'text':
                      return (
                        <Text
                          key={obj.id}
                          id={obj.id}
                          x={obj.x}
                          y={obj.y}
                          text={obj.text}
                          fill={obj.fill}
                          fontSize={obj.fontSize}
                          draggable={!layer.locked}
                          rotation={obj.rotation}
                          onClick={() => setSelectedId(obj.id)}
                          onDblClick={(e) => handleTextDblClick(layer.id, obj, e)}
                          onDragEnd={(e) => onDragEnd(layer.id, obj.id, e)}
                          onTransformEnd={(e) =>
                            onTransformEnd(layer.id, obj.id, e)
                          }
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </Layer>
            ))}
          <Layer>
            <Transformer ref={transformerRef} rotateEnabled />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default CanvasEditor;
