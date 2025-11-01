/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import { useFabricCanvas } from '../hooks/useFabricCanvas';
import { useSocket } from '../hooks/useSocket';
import { updateDesign } from '../api/api';
import Toolbar from './Toolbar';
import '../CanvasEditor.css';
import '../styles/ui-panels.css';
import debounce from 'lodash.debounce';
import * as fabric from 'fabric';

interface Props {
  designId: string;
  canvasData: any;
}

const CANVAS_ID = 'fabric-container';
// const CANVAS_SIZE = { width: 512, height: 512 };

function hashString(s: string) {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash) + s.charCodeAt(i);
    hash = hash & hash;
  }
  return (hash >>> 0).toString(36);
}

const CanvasEditor: React.FC<Props> = ({ designId, canvasData }) => {
  const { canvasRef, ready } = useFabricCanvas(CANVAS_ID);
  const socket = useSocket();
  const saveTimeout = useRef<any>(null);
  const isApplyingRemote = useRef(false);
  const listenersAttached = useRef(false);
  const lastSentHash = useRef<string | null>(null);

  // History handling
  const history = useRef<string[]>([]);
  const step = useRef(-1);
  const MAX = 20;

  const push = () => {
    if (!canvasRef.current) return;
    const json = JSON.stringify(canvasRef.current.toJSON());
    if (step.current >= 0 && history.current[step.current] === json) return;
    history.current = history.current.slice(0, step.current + 1);
    history.current.push(json);
    if (history.current.length > MAX) history.current.shift();
    step.current = history.current.length - 1;
  };

  const undo = () => {
    if (step.current <= 0 || !canvasRef.current) return;
    step.current--;
    canvasRef.current.loadFromJSON(JSON.parse(history.current[step.current]), () => canvasRef.current?.renderAll());
  };

  const redo = () => {
    if (step.current >= history.current.length - 1 || !canvasRef.current) return;
    step.current++;
    canvasRef.current.loadFromJSON(JSON.parse(history.current[step.current]), () => canvasRef.current?.renderAll());
  };

  const exportPNG = () => {
    const url = canvasRef.current?.toDataURL({ format: 'png', multiplier: 2 });
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.png';
    a.click();
  };

  // ---------- Load initial design ----------
  useEffect(() => {
    if (!canvasRef.current || !canvasData) return;
    isApplyingRemote.current = true;
    canvasRef.current.loadFromJSON(canvasData, () => {
      canvasRef.current?.renderAll();
      push();
      isApplyingRemote.current = false;
      try {
        const serialized = JSON.stringify(canvasRef.current?.toJSON() || {});
        lastSentHash.current = hashString(serialized);
      } catch { /* ignore */ }
    });
  }, [canvasData, canvasRef]);

  // ---------- Remote updates ----------
  useEffect(() => {
    const s = socket.current;
    const c = canvasRef.current;
    if (!s || !c) return;

    const onRemote = ({ canvas: remoteCanvas }: { canvas: any }) => {
      try {
        const currentSerialized = JSON.stringify(c.toJSON());
        const remoteSerialized = JSON.stringify(remoteCanvas);
        const curHash = hashString(currentSerialized);
        const remoteHash = hashString(remoteSerialized);
        if (curHash === remoteHash) return;
        isApplyingRemote.current = true;
        c.loadFromJSON(remoteCanvas, () => {
          c.renderAll();
          push();
          lastSentHash.current = remoteHash;
          isApplyingRemote.current = false;
        });
      } catch (e) {
        console.error('Failed to apply remote canvas update', e);
        isApplyingRemote.current = false;
      }
    };

    s.on('canvas:update', onRemote);
    s.on('canvas:object:add', ({ object }: { object: any }) => {
      fabric.util.enlivenObjects([object], (objs: fabric.Object[]) => {
        objs.forEach(o => c.add(o));
        c.renderAll();
        push();
      });
    });

    return () => {
      s.off('canvas:update', onRemote);
      s.off('canvas:object:add');
    };
  }, [socket, canvasRef]);

  // ---------- Broadcast changes ----------
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || listenersAttached.current) return;
    listenersAttached.current = true;

    const broadcast = () => {
      if (isApplyingRemote.current) return;
      try {
        const json = c.toJSON();
        const serialized = JSON.stringify(json);
        const h = hashString(serialized);
        if (lastSentHash.current && lastSentHash.current === h) return;
        lastSentHash.current = h;
        socket.current?.emit('canvas:update', { designId, canvas: json });
        push();
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
          updateDesign(designId, { canvas: json }).catch(console.error);
        }, 1000);
      } catch (e) {
        console.error('Failed to broadcast canvas', e);
      }
    };

    const debouncedBroadcast = debounce(broadcast, 150);
    c.on('object:modified', debouncedBroadcast);
    c.on('object:added', debouncedBroadcast);
    c.on('object:removed', debouncedBroadcast);

    return () => {
      c.off('object:modified', debouncedBroadcast);
      c.off('object:added', debouncedBroadcast);
      c.off('object:removed', debouncedBroadcast);
      debouncedBroadcast.cancel?.();
      listenersAttached.current = false;
    };
  }, [canvasRef, socket, designId, push]);

  return (
    <div className="canvas-editor-wrapper">
      {ready && canvasRef.current ? (
        <Toolbar
          canvas={canvasRef}
          undo={undo}
          redo={redo}
          exportPNG={exportPNG}
          designId={designId}
        />
      ) : (
        <div style={{ padding: 10, textAlign: 'center' }}>Loading editor…</div>
      )}

      <div className="canvas-editor-center">
        {/* ⬇️ Important: Let Fabric build its own canvases inside this DIV */}
        <div id={CANVAS_ID} className="ui-canvas-frame" />
      </div>
    </div>
  );
};

export default CanvasEditor;
