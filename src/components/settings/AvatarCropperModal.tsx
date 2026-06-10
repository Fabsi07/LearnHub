"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const PREVIEW_SIZE = 280;
const OUTPUT_SIZE = 512;

interface AvatarCropperModalProps {
  file: File;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export function AvatarCropperModal({ file, onConfirm, onCancel }: AvatarCropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseScale = PREVIEW_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
    const drawW = img.naturalWidth * baseScale * zoom;
    const drawH = img.naturalHeight * baseScale * zoom;
    const drawX = (PREVIEW_SIZE - drawW) / 2 + offset.x;
    const drawY = (PREVIEW_SIZE - drawH) / 2 + offset.y;

    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, [zoom, offset, loaded]);

  function clampOffset(next: { x: number; y: number }, currentZoom: number) {
    const img = imgRef.current;
    if (!img) return next;
    const baseScale = PREVIEW_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
    const drawW = img.naturalWidth * baseScale * currentZoom;
    const drawH = img.naturalHeight * baseScale * currentZoom;
    const maxX = Math.max(0, (drawW - PREVIEW_SIZE) / 2);
    const maxY = Math.max(0, (drawH - PREVIEW_SIZE) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    setDragging(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging || !lastPointer.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => clampOffset({ x: prev.x + dx, y: prev.y + dy }, zoom));
  }

  function handlePointerUp() {
    setDragging(false);
    lastPointer.current = null;
  }

  function handleZoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    setOffset((prev) => clampOffset(prev, newZoom));
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img) return;

    const out = document.createElement("canvas");
    out.width = OUTPUT_SIZE;
    out.height = OUTPUT_SIZE;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    const ratio = OUTPUT_SIZE / PREVIEW_SIZE;
    const baseScale = PREVIEW_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
    const drawW = img.naturalWidth * baseScale * zoom * ratio;
    const drawH = img.naturalHeight * baseScale * zoom * ratio;
    const drawX = (OUTPUT_SIZE - drawW) / 2 + offset.x * ratio;
    const drawY = (OUTPUT_SIZE - drawH) / 2 + offset.y * ratio;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    out.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-cropper-title"
        className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 id="avatar-cropper-title" className="text-base font-semibold text-gray-950">Profilbild anpassen</h2>
          <p className="mt-1 text-sm text-gray-500">
            Bild verschieben und zoomen, dann übernehmen.
          </p>
        </div>

        <div className="flex justify-center">
          <div
            className="overflow-hidden rounded-full ring-2 ring-gray-200"
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
          >
            <canvas
              ref={canvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              className={dragging ? "cursor-grabbing" : "cursor-grab"}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="avatar-zoom" className="text-sm font-medium text-gray-700">Zoom</label>
          <input
            id="avatar-zoom"
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            className="w-full accent-gray-900"
          />
        </div>

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="button" className="flex-1" onClick={handleConfirm} disabled={!loaded}>
            Übernehmen
          </Button>
        </div>
      </div>
    </div>
  );
}
