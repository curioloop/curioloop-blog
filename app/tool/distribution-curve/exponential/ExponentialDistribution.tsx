"use client";

import React, { useState, useRef, useEffect } from "react";
import ExponentialCurve, { ExponentialCurveConfig, ExponentialCDFCurve } from "./ExponentialCurve";
import { downloadSvg, exportSvgToPng, COMMON_COLORS } from "@/tools/distCurve";

export default function ExponentialDistribution() {

  const [curves, setCurves] = useState<ExponentialCurveConfig[]>([
    { lambda: 1, color: COMMON_COLORS[0], name: undefined }
  ]);

  // Parse URL params for curves
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // 1. ?curves=[{"lambda":1,"color":"#2563eb","name":"A"},...]
    // 2. ?curve1=1,2563eb,A&curve2=2,e11d48,B（lambda,color,name）
    const params = new URLSearchParams(window.location.search);
    const curvesFromUrl: ExponentialCurveConfig[] = [];
    const curvesJson = params.get('curves');
    if (curvesJson) {
      try {
        const arr = JSON.parse(decodeURIComponent(curvesJson));
        if (Array.isArray(arr)) {
          for (const c of arr) {
            if (typeof c.lambda === 'number' && typeof c.color === 'string') {
              curvesFromUrl.push({
                lambda: c.lambda,
                color: `#${c.color.replace('#', '')}`,
                name: typeof c.name === 'string' ? c.name : undefined
              });
            }
          }
        }
      } catch {}
    } else {
      let idx = 1;
      while (true) {
        const v = params.get('curve' + idx);
        if (!v) break;
        const [lambda, color, ...nameArr] = v.split(',');
        if (!lambda || !color) break;
        curvesFromUrl.push({
          lambda: Number(lambda),
          color: `#${color.replace('#', '')}`,
          name: nameArr.length ? decodeURIComponent(nameArr.join(',')) : undefined
        });
        idx++;
      }
    }
    if (curvesFromUrl.length > 0) {
      setCurves(curvesFromUrl);
    }
  }, []);

  const [svgString, setSvgString] = useState<string | null>(null);
  const [cdfSvgString, setCdfSvgString] = useState<string | null>(null);
  const [pngWidth, setPngWidth] = useState(600);
  const [pngHeight, setPngHeight] = useState(300);
  const [showPngSize, setShowPngSize] = useState(false);
  const pngBtnRef = useRef<HTMLButtonElement>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showCDF, setShowCDF] = useState(false);
  const [svgDropdownOpen, setSvgDropdownOpen] = useState(false);
  const svgDropdownBtnRef = useRef<HTMLButtonElement>(null);

  // Add curve handler
  const handleAddCurve = () => {
    const usedColors = new Set(curves.map(c => c.color));
    const availableColors = COMMON_COLORS.filter(c => !usedColors.has(c));
    const nextColor = availableColors.length > 0
      ? availableColors[Math.floor(Math.random() * availableColors.length)]
      : COMMON_COLORS[Math.floor(Math.random() * COMMON_COLORS.length)];
    setCurves([
      ...curves,
      { lambda: 1, color: nextColor, name: undefined }
    ]);
  };

  return (
    <>
      <h1 className="text-3xl font-bold pt-5 text-center text-black">Exponential Distribution Curve Tool</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 mt-6">
        {/* Curve list for editing */}
        <div className="mb-4">
          {curves.map((curve, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 mb-2 text-gray-700"
              draggable
              onDragStart={e => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("curve-idx", idx.toString());
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const fromIdx = Number(e.dataTransfer.getData("curve-idx"));
                if (fromIdx === idx || isNaN(fromIdx)) return;
                setCurves(curves => {
                  if (fromIdx < 0 || fromIdx >= curves.length) return curves;
                  const arr = [...curves];
                  const [moved] = arr.splice(fromIdx, 1);
                  arr.splice(idx, 0, moved);
                  return arr;
                });
              }}
              style={{ cursor: "grab" }}
            >
              <span
                className="text-gray-400 select-none cursor-grab px-1"
                title="Drag to reorder"
                style={{ fontSize: 18 }}
              >
                ⠿
              </span>
              <input
                type="text"
                value={curve.name ?? ""}
                onChange={e => {
                  const v = e.target.value;
                  setCurves(curves => curves.map((c, i) => i === idx ? { ...c, name: v } : c));
                }}
                placeholder={`#${idx + 1}`}
                className="w-20 border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white"
                title="Curve name"
                style={{ minWidth: 60 }}
              />
              <label className="flex items-center gap-1 text-xs">
                λ =
                <input
                  type="number"
                  value={curve.lambda}
                  min={0.01}
                  step="0.01"
                  onChange={e => {
                    const v = Math.max(0.01, Number(e.target.value));
                    setCurves(curves => curves.map((c, i) => i === idx ? { ...c, lambda: v } : c));
                  }}
                  className="w-15 border rounded px-2 py-1 text-center text-xs bg-gray-50 focus:bg-white"
                  title="lambda"
                />
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-6 h-6 rounded-full border-1 flex items-center justify-center p-0 mr-1 focus:outline-none"
                  style={{ background: curve.color, minWidth: 24, minHeight: 24, cursor: 'pointer' }}
                  onClick={() => {
                    const input = document.getElementById(`color-input-${idx}`) as HTMLInputElement;
                    if (input) input.click();
                  }}
                  title="color"
                >
                </button>
                <input
                  id={`color-input-${idx}`}
                  type="color"
                  value={curve.color}
                  onChange={e => {
                    const v = e.target.value;
                    setCurves(curves => curves.map((c, i) => i === idx ? { ...c, color: v } : c));
                  }}
                  className="absolute left-0 top-0 w-6 h-6 opacity-0 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                  tabIndex={-1}
                  title="color"
                />
              </div>
              <button
                onClick={() => setCurves(curves => curves.filter((_, i) => i !== idx))}
                className="ml-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-bold"
                title="Remove this curve"
              >
                ✖
              </button>
              <button
                onClick={() => {
                  const usedColors = new Set(curves.map(c => c.color));
                  const availableColors = COMMON_COLORS.filter(c => !usedColors.has(c));
                  const nextColor = availableColors.length > 0
                    ? availableColors[Math.floor(Math.random() * availableColors.length)]
                    : COMMON_COLORS[Math.floor(Math.random() * COMMON_COLORS.length)];
                  setCurves(curves => [
                    ...curves.slice(0, idx + 1),
                    { ...curves[idx], color: nextColor },
                    ...curves.slice(idx + 1)
                  ]);
                }}
                className="ml-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-bold"
                title="Copy this curve">
                ❏
              </button>
            </div>
          ))}
        </div>
        <ExponentialCurve curves={curves} setSvgString={setSvgString} showLegend={showLegend} />
        <div className="flex items-center justify-center m-5 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-legend"
              className="mr-2"
              checked={showLegend}
              onChange={e => setShowLegend(e.target.checked)}
            />
            <label htmlFor="show-legend" className="text-xs text-gray-600 select-none cursor-pointer">Show Legend</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-cdf"
              className="mr-2"
              checked={showCDF}
              onChange={e => setShowCDF(e.target.checked)}
            />
            <label htmlFor="show-cdf" className="text-xs text-gray-600 select-none cursor-pointer">Show CDF</label>
          </div>
        </div>
        {/* CDF 区域始终渲染，隐藏时用 hidden 保证 setCdfSvgString 可用 */}
        <div className={showCDF ? "" : "hidden"}>
          <ExponentialCDFCurve curves={curves} showLegend={showLegend} setSvgString={setCdfSvgString}/>
        </div>
      </div>
      <div className="w-full flex flex-row flex-wrap gap-2 justify-center items-center mt-6">
        <button
          onClick={handleAddCurve}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          New Curve
        </button>
        {(svgString || cdfSvgString) && (
          <div className="relative">
            <button
              ref={svgDropdownBtnRef}
              className="px-4 py-2 bg-white text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition"
              onClick={() => setSvgDropdownOpen(v => !v)}
            >
              Export as SVG
              <svg className="inline ml-1 -mt-1 w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {svgDropdownOpen && (
              <div className="absolute z-10 right-0 mt-2 w-auto bg-white border border-gray-200 rounded shadow p-2 flex flex-row gap-2 justify-center items-center" style={{minWidth:155}}>
                <button
                  className="px-3 py-1 bg-white text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition text-sm"
                  disabled={!svgString}
                  onClick={() => {
                    if (svgString) {
                      downloadSvg('exponential-curves', svgString);
                    }
                    setSvgDropdownOpen(false);
                  }}
                >
                 Curve
                </button>
                <button
                  className="px-3 py-1 bg-white text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition text-sm"
                  disabled={!cdfSvgString}
                  onClick={() => {
                    if (cdfSvgString) {
                      downloadSvg('exponential-cdf-curves', cdfSvgString);
                    }
                    setSvgDropdownOpen(false);
                  }}
                >
                 CDF
                </button>
              </div>
            )}
          </div>
        )}
        {svgString && (
          <>
            <div className="relative">
              <button
                ref={pngBtnRef}
                className="px-4 py-2 bg-white text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition"
                onClick={() => setShowPngSize(v => !v)}
              >
                Export as PNG
                <svg className="inline ml-1 -mt-1 w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showPngSize && (
                <div className="absolute z-10 top-0 left-full ml-2 w-auto bg-white border border-gray-200 rounded shadow p-4 flex flex-row gap-2 justify-center items-center" style={{minWidth:220}}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 mb-1">Size</label>
                      <input
                        type="number"
                        value={pngWidth}
                        onChange={e => {
                          setPngWidth(Number(e.target.value));
                        }}
                        onBlur={e => {
                          setPngHeight(Math.round(Number(e.target.value) * 0.5));
                        }}
                        className="w-20 border rounded px-2 py-1 text-xs text-center text-black"
                        style={{width: 70}}
                        title="Width"
                      />
                      <span className="text-xs text-gray-600">×</span>
                      <input
                        type="number"
                        value={pngHeight}
                        readOnly
                        className="w-20 border rounded px-2 py-1 text-xs text-center bg-gray-100 text-black"
                        style={{width: 70}}
                        title="Hight"
                      />
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center mt-2">
                      <button
                        className="px-3 py-1 bg-white text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition text-sm"
                        disabled={!svgString}
                        onClick={async () => {
                          const height = Math.max(100, pngHeight);
                          await exportSvgToPng(svgString, height * 2, height, "exponential-curves");
                          setShowPngSize(false);
                        }}
                      >
                        Curve
                      </button>
                      <button
                        className="px-3 py-1 bg-white text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition text-sm"
                        disabled={!cdfSvgString}
                        onClick={async () => {
                          const height = Math.max(100, pngHeight);
                          if (cdfSvgString) {
                            await exportSvgToPng(cdfSvgString, height * 2, height, "exponential-cdf-curves");
                          }
                          setShowPngSize(false);
                        }}
                      >
                        CDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={async () => {
            if (typeof window === 'undefined') return;
            const baseUrl = window.location.origin + window.location.pathname;
            const params = curves.map((c, i) => {
              const lambda = c.lambda;
              const color = (c.color || '').replace('#', '');
              const name = c.name ? encodeURIComponent(c.name) : '';
              return `curve${i+1}=${lambda},${color}${name ? ',' + name : ''}`;
            }).join('&');
            const url = baseUrl + (params ? '?' + params : '');
            await navigator.clipboard.writeText(url);
            window.history.replaceState(null, '', url);
          }}
        >
          Copy URL
        </button>
      </div>

    </>
  );
}
