"use client";

import { normalPdf, normSInv } from "@/tools/normDist";
import React, { useState, useEffect } from "react";

// 置信区间 z 值查表
const getZ = (confLevel: number) => {
  // 常用置信水平查表
  const zTable: Record<number, number> = {90: 1.645, 95: 1.96, 99: 2.576};
  if (zTable[confLevel]) return zTable[confLevel];
  // 其他置信水平用正态分布反函数近似
  const p = 1 - (1 - confLevel / 100) / 2;
  // 近似算法（可用 erfinv 或查表）
  return normSInv(p);
};

export default function ConfidenceInterval() {
  const [confLevel, setConfLevel] = useState(90);
  const [sampleSize, setSampleSize] = useState(1);
  const [sampleCount, setSampleCount] = useState(30);
  const [means, setMeans] = useState<number[]>([]);
  const [urlInitialized, setUrlInitialized] = useState(false);
  useEffect(() => {
    if (urlInitialized) return;
    if (typeof window === "undefined") return;
    const search = window.location.search;
    if (!search) return;
    const paramsObj = Object.fromEntries(new URLSearchParams(search));
    if (paramsObj.confLevel && !isNaN(Number(paramsObj.confLevel))) {
      setConfLevel(Number(paramsObj.confLevel));
    }
    if (paramsObj.sampleSize && !isNaN(Number(paramsObj.sampleSize))) {
      setSampleSize(Number(paramsObj.sampleSize));
    }
    if (paramsObj.sampleCount && !isNaN(Number(paramsObj.sampleCount))) {
      setSampleCount(Number(paramsObj.sampleCount));
    }
    setUrlInitialized(true);
  }, [urlInitialized]);
  const z = getZ(confLevel);
  const xMin = -4, xMax = 4, N = 200;
  const points = Array.from({ length: N + 1 }, (_, i) => {
    const x = xMin + (xMax - xMin) * (i / N);
    return { x, y: normalPdf(x) };
  });
  const yMax = normalPdf(0);
  const ciLeft = -z, ciRight = z;

  // Box-Muller 采样标准正态分布
  function sampleNormal() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function handleGenerate() {
    const arr: number[] = [];
    for (let i = 0; i < sampleCount; i++) {
      let sum = 0;
      for (let j = 0; j < sampleSize; j++) {
        sum += sampleNormal();
      }
      arr.push(sum / sampleSize);
    }
    setMeans(arr);
  }

  // 重新采样逻辑
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleSize, sampleCount]);

  return (
  <>
    <h1 className="text-3xl font-bold pt-5 text-center text-black">Confidence Interval Visualizer</h1>
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:gap-6 items-center justify-center">
        {/* Parameter settings area */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center">
          <div className="flex flex-col items-start font-bold text-gray-600">
            <label className="text-xs mb-1" htmlFor="conf-level-input">Confidence Level</label>
            <div className="flex items-center gap-1">
              <input
                id="conf-level-input"
                type="number"
                min={1}
                max={99}
                step={1}
                value={confLevel}
                onChange={e => setConfLevel(Number(e.target.value))}
                className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full min-w-[100px]"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
          <div className="flex flex-col items-start font-bold text-gray-600">
            <label className="text-xs mb-1" htmlFor="sample-count-input">Number of Samples</label>
            <input
              id="sample-count-input"
              type="number"
              min={0}
              max={1000}
              value={sampleCount}
              onChange={e => setSampleCount(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full min-w-[100px]"
            />
          </div>
          <div className="flex flex-col items-start font-bold text-gray-600">
            <label className="text-xs mb-1" htmlFor="sample-size-input">Sample Size</label>
            <input
              id="sample-size-input"
              type="number"
              min={1}
              max={10000}
              value={sampleSize}
              onChange={e => setSampleSize(Math.max(1,Number(e.target.value)))}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full min-w-[100px]"
            />
          </div>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-bold mt-4"
          onClick={handleGenerate}
        >
          Resample
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs font-bold mt-4"
          onClick={async () => {
            if (typeof window === 'undefined') return;
            const baseUrl = window.location.origin + window.location.pathname;
            const urlParams = [
              `confLevel=${confLevel}`,
              `sampleSize=${sampleSize}`,
              `sampleCount=${sampleCount}`
            ].join('&');
            const url = baseUrl + '?' + urlParams;
            await navigator.clipboard.writeText(url);
            window.history.replaceState(null, '', url);
          }}
        >
          Copy URL
        </button>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1 text-center">Z ~ 𝓝(0,1)</div>
        <svg
            viewBox="0 0 500 220"
            width="100%"
            height="220"
            className="bg-gray-100 rounded shadow"
        >
            {/* 显著性水平 legend */}
            <text x="440" y="40" fontSize="14" fill="#2563eb" fontWeight="bold">
            α = {(1 - confLevel / 100).toFixed(2)}
            </text>
            {/* 坐标轴 */}
            <line x1={40} y1={180} x2={460} y2={180} stroke="#888" strokeWidth={2} />
            <line x1={250} y1={30} x2={250} y2={180} stroke="#888" strokeWidth={1} />
            {/* 曲线 */}
            <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth={2}
            points={points.map(p => `${40 + ((p.x - xMin) / (xMax - xMin)) * 420},${180 - (p.y / yMax) * 140}`).join(" ")}
            />
            {/* 置信区间阴影 */}
            <polygon
            fill="#2563eb22"
            stroke="none"
            points={points
                .filter(p => p.x >= ciLeft && p.x <= ciRight)
                .map(p => `${40 + ((p.x - xMin) / (xMax - xMin)) * 420},${180 - (p.y / yMax) * 140}`)
                .concat([
                `${40 + ((ciRight - xMin) / (xMax - xMin)) * 420},180`,
                `${40 + ((ciLeft - xMin) / (xMax - xMin)) * 420},180`
                ]).join(" ")}
            />
            {/* x 轴刻度和标签 */}
            {[-3, -2, -1, 0, 1, 2, 3].map(x => {
            const px = 40 + ((x - xMin) / (xMax - xMin)) * 420;
            return (
                <g key={x}>
                <line x1={px} y1={180} x2={px} y2={185} stroke="#888" strokeWidth={1} />
                <text x={px} y={200} textAnchor="middle" className="fill-gray-600 text-xs">{x}</text>
                </g>
            );
            })}
            {/* 置信区间边界标注 */}
            <line x1={40 + ((ciLeft - xMin) / (xMax - xMin)) * 420} y1={50} x2={40 + ((ciLeft - xMin) / (xMax - xMin)) * 420} y2={180} stroke="#e11d48" strokeDasharray="4,2" />
            <line x1={40 + ((ciRight - xMin) / (xMax - xMin)) * 420} y1={50} x2={40 + ((ciRight - xMin) / (xMax - xMin)) * 420} y2={180} stroke="#e11d48" strokeDasharray="4,2" />
            <text x={40 + ((ciLeft - xMin) / (xMax - xMin)) * 420} y={40} textAnchor="middle" className="fill-red-600 text-xs">{ciLeft.toFixed(2)}</text>
            <text x={40 + ((ciRight - xMin) / (xMax - xMin)) * 420} y={40} textAnchor="middle" className="fill-red-600 text-xs">{ciRight.toFixed(2)}</text>
        </svg>
      </div>
      {/* 新增样本点可视化区域 */}
      <div className="mt-8">
        <div className="text-xs text-gray-500 mb-1 text-center"> Overlapping CI between x̄ and μ</div>
        <svg viewBox="0 0 500 220" width="100%" height="220" className="bg-gray-100 rounded shadow">
          {/* legend 区域 */}
          {(() => {
            const total = means.length;
            let cover = 0, miss = 0;
            means.forEach(mean => {
              const ciLeft = mean - z / Math.sqrt(sampleSize);
              const ciRight = mean + z / Math.sqrt(sampleSize);
              if (ciLeft <= 0 && ciRight >= 0) cover++; else miss++;
            });
            const legendX = 450;
            return (
              <g>
                {[{color: "#22c55e", y: 30, val: cover}, {color: "#e11d48", y: 50, val: miss}].map((item, idx) => (
                  <g key={idx}>
                    <circle cx={legendX} cy={item.y} r={4} fill={item.color} opacity={1} />
                    <text x={legendX+10} y={item.y+4} fontSize={13} fill={item.color} fontWeight="bold">{total ? ((item.val/total)*100).toFixed(1) : 0}%</text>
                  </g>
                ))}
              </g>
            );
          })()}
          {/* 坐标轴 */}
          <line x1={250} y1={20} x2={250} y2={180} stroke="#888" strokeWidth={1} />
          <line x1={40} y1={180} x2={460} y2={180} stroke="#888" strokeWidth={2} />
          {/* x 轴刻度 */}
          {[...Array(7)].map((_, i) => {
            const x = i - 3;
            const px = 40 + ((x - xMin) / (xMax - xMin)) * 420;
            const label = (x === 0) ? 'μ' : `μ${x > 0 ? '+' : '-'}${Math.abs(x)}σ`;
            return (
              <g key={x}>
                <line x1={px} y1={180} x2={px} y2={185} stroke="#888" strokeWidth={1} />
                <text x={px} y={200} textAnchor="middle" className="fill-gray-600 text-xs">{label}</text>
              </g>
            );
          })}
          {/* 样本均值及其置信区间 */}
          {means.map((mean, i) => {
            const px = 40 + ((mean - xMin) / (xMax - xMin)) * 420;
            const py = 20 + 160 * ((i + 0.5) / means.length);
            const cr = 3 - Math.max(0, Math.min(0.8, (means.length - 30) / 20));
            const lw = 1.5 - Math.max(0, Math.min(0.5, (means.length - 30) / 20));
            const ciLeft = mean - z / Math.sqrt(sampleSize);
            const ciRight = mean + z / Math.sqrt(sampleSize);
            const pxL = 40 + ((ciLeft - xMin) / (xMax - xMin)) * 420;
            const pxR = 40 + ((ciRight - xMin) / (xMax - xMin)) * 420;
            const coversY = ciLeft <= 0 && ciRight >= 0;
            const color = coversY ? "#22c55e" : "#e11d48";
            return (
              <g key={i}>
                <line x1={pxL} y1={py} x2={pxR} y2={py} stroke={color} strokeWidth={lw} opacity={0.4} strokeLinecap="round" />
                <circle cx={px} cy={py} r={cr} fill={color} opacity={1} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  </>
  );
}