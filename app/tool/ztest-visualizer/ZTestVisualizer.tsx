"use client";

import { normalCdf, normalPdf, normSInv } from "@/tools/normDist";
import React, { useState, useEffect } from "react";

// 置信区间 z 值查表
const getZ = (alpha: number, tail: "left" | "right" | "two") => {
  // alpha: 显著性水平百分比 1-99
  const a = alpha / 100;
  let p;
  if (tail === "two") {
    p = 1 - a / 2;
  } else {
    p = 1 - a;
  }
  return normSInv(p);
};

// 计算 p 值
function getPValue(z: number, tail: "left" | "right" | "two") {
  if (tail === "left") {
    return normalCdf(z);
  } else if (tail === "right") {
    return 1 - normalCdf(z);
  } else {
    return 2 * (1 - normalCdf(Math.abs(z)));
  }
}

export default function ZTestVisualizer({ preview = false }) {
  const [alpha, setAlpha] = useState(5);
  const [tail, setTail] = useState<"left" | "right" | "two">("two");
  const [sampleMean, setSampleMean] = useState(1.2);
  const [mu, setMu] = useState(1);
  const [sigma, setSigma] = useState(1);
  const [n, setN] = useState(30);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = window.location.search;
    if (!search) return;
    const paramsObj = Object.fromEntries(new URLSearchParams(search));
    if (paramsObj.alpha && !isNaN(Number(paramsObj.alpha))) {
      setAlpha(Math.max(1, Math.min(99, Number(paramsObj.alpha))));
    }
    if (paramsObj.tail && ["left", "right", "two"].includes(paramsObj.tail)) {
      setTail(paramsObj.tail as "left" | "right" | "two");
    }
    if (paramsObj.mu && !isNaN(Number(paramsObj.mu))) {
      setMu(Number(paramsObj.mu));
    }
    if (paramsObj.sigma && !isNaN(Number(paramsObj.sigma))) {
      setSigma(Math.max(0.1, Math.min(1000, Number(paramsObj.sigma))));
    }
    if (paramsObj.n && !isNaN(Number(paramsObj.n))) {
      setN(Math.max(1, Math.min(10000, Number(paramsObj.n))));
    }
    if (paramsObj.sampleMean && !isNaN(Number(paramsObj.sampleMean))) {
      setSampleMean(Number(paramsObj.sampleMean));
    }
  }, []);

  // z statistic
  const z = (sampleMean - mu) / (sigma / Math.sqrt(n));
  const zCrit = getZ(alpha, tail);
  const pValue = getPValue(z, tail);

  // 统一两个绘图区的分布曲线和坐标轴范围
  // 以 mu 为中心，sigma 控制宽度，自动包含关键点
  const marginSigma = 0.5;
  // 计算所有关键点到 mu 的距离，取最大绝对值，保证 mu 居中
  const xCandidates = [z * sigma, zCrit * sigma, -zCrit * sigma, -4 * sigma, 4 * sigma];
  if (tail === "two") xCandidates.push(Math.abs(z) * sigma, -Math.abs(z) * sigma);
  let maxDelta = Math.max(...xCandidates.map(Math.abs)) + marginSigma * sigma;
  // 限制最大区间宽度，防止极端溢出
  if (maxDelta > 10 * sigma) maxDelta = 10 * sigma;
  const xMin = mu - maxDelta;
  const xMax = mu + maxDelta;
  const N = 200;
  // 统一分布点和 yMax
  const yMax = normalPdf(0) / sigma;
  // 坐标转换函数
  const getPx = (x: number) => 40 + ((x - xMin) / (xMax - xMin)) * 420;
  const getPy = (y: number) => 180 - (y / yMax) * 140;
  // 分布曲线采样点
  const getDistPoints = () => Array.from({ length: N + 1 }, (_, i) => {
    const x = xMin + (xMax - xMin) * (i / N);
    return { x, y: normalPdf((x - mu) / sigma) / sigma };
  });
  const points = getDistPoints();
  // 曲线 polyline points
  const getCurvePoints = () => points.map(p => `${getPx(p.x)},${getPy(p.y)}`).join(" ");
  // 生成 shading polygon points
  function getShadingPolygon(region: { from: number, to: number }) {
    // 边界点
    const fromY = normalPdf((region.from - mu) / sigma) / sigma;
    const toY = normalPdf((region.to - mu) / sigma) / sigma;
    // 区间内点
    const regionPoints = points.filter(p => p.x >= region.from && p.x <= region.to);
    // polygon点顺序：from边界点→区间内点→to边界点→to底部→from底部
    return [
      `${getPx(region.from)},${getPy(fromY)}`,
      ...regionPoints.map(p => `${getPx(p.x)},${getPy(p.y)}`),
      `${getPx(region.to)},${getPy(toY)}`,
      `${getPx(region.to)},180`,
      `${getPx(region.from)},180`
    ].join(" ");
  }

  // 动态计算 x 轴刻度数量，避免重叠
  // 画布宽度 420px，最小间距 60px
  const axisWidthPx = 420;
  const minTickPx = 60;
  const maxTicks = Math.floor(axisWidthPx / minTickPx);
  // 刻度步长为 sigma 的整数倍，保证主刻度落在 mu
  let tickStep = sigma;
  let tickCount = Math.floor((xMax - xMin) / tickStep);
  while (tickCount > maxTicks) {
    tickStep *= 2;
    tickCount = Math.floor((xMax - xMin) / tickStep);
  }
  // 生成刻度数组，覆盖 xMin~xMax，主刻度对齐 mu
  const firstTick = mu + Math.ceil((xMin - mu) / tickStep) * tickStep;
  const lastTick = mu + Math.floor((xMax - mu) / tickStep) * tickStep;
  const xTicks = [];
  for (let x = firstTick; x <= lastTick + 1e-8; x += tickStep) {
    xTicks.push(Number(x.toFixed(8)));
  }

  // 关键点全部映射到原始分布坐标
  // Critical region
  let critRegions: { from: number, to: number }[] = [];
  const se = sigma / Math.sqrt(n);
  if (tail === "left") {
    const left = Math.min(mu - zCrit * se, xMax);
    critRegions = [{ from: xMin, to: Math.max(xMin, left) }];
  } else if (tail === "right") {
    const right = Math.max(mu + zCrit * se, xMin);
    critRegions = [{ from: Math.min(xMax, right), to: xMax }];
  } else {
    const left = Math.min(mu - Math.abs(zCrit) * se, xMax);
    const right = Math.max(mu + Math.abs(zCrit) * se, xMin);
    critRegions = [
      { from: xMin, to: Math.max(xMin, left) },
      { from: Math.min(xMax, right), to: xMax }
    ];
  }

  return (
    <>
      {!preview && <h1 className="text-3xl font-bold pt-5 text-center text-black">Z-Test Visualizer</h1>}
        <div className={`max-w-2xl mx-auto bg-white rounded p-6 ${!preview ? 'shadow mt-6' : ''}`}>
        {!preview && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 font-bold text-gray-600">
          <div className="flex flex-col gap-2">
            <label className="text-xs mb-1 font-bold text-gray-600" htmlFor="mu-input">μ (Population Mean)</label>
            <input
              id="mu-input"
              type="number"
              value={mu}
              onChange={e => setMu(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs mb-1 font-bold text-gray-600" htmlFor="sigma-input">σ (Population Std. Dev.)</label>
            <input
              id="sigma-input"
              type="number"
              min={0.1}
              max={1000}
              value={sigma}
              onChange={e => setSigma(Math.max(0.1, Math.min(1000, Number(e.target.value))))}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs mb-1 font-bold text-gray-600" htmlFor="n-input">n (Sample Size)</label>
            <input
              id="n-input"
              type="number"
              min={1}
              max={10000}
              value={n}
              onChange={e => setN(Math.max(1, Math.min(10000, Number(e.target.value))))}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs mb-1 font-bold text-gray-600" htmlFor="sample-mean-input">x̄ (Sample Mean)</label>
            <input
              id="sample-mean-input"
              type="number"
              value={sampleMean}
              onChange={e => setSampleMean(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs mb-1 font-bold text-gray-600" htmlFor="alpha-input">α (Significance Level)</label>
            <div className="flex items-center gap-1">
              <input
                id="alpha-input"
                type="number"
                min={1}
                max={99}
                step={1}
                value={alpha}
                onChange={e => setAlpha(Math.max(1, Math.min(99, Number(e.target.value))))}
                className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full"
              />
              <span className="text-sm">%</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs mb-1 font-bold text-gray-600">Test Type</label>
            <div className="flex gap-2 flex-wrap">
              <button
                className={`px-2 py-1 rounded text-xs font-bold border ${tail === "left" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setTail("left")}
              >Left Tail</button>
              <button
                className={`px-2 py-1 rounded text-xs font-bold border ${tail === "right" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setTail("right")}
              >Right Tail</button>
              <button
                className={`px-2 py-1 rounded text-xs font-bold border ${tail === "two" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setTail("two")}
              >Two Tails</button>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <button
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs font-bold"
              onClick={async () => {
                if (typeof window === 'undefined') return;
                const baseUrl = window.location.origin + window.location.pathname;
                const urlParams = [
                  `alpha=${alpha}`,
                  `tail=${tail}`,
                  `mu=${mu}`,
                  `sigma=${sigma}`,
                  `n=${n}`,
                  `sampleMean=${sampleMean}`
                ].join('&');
                const url = baseUrl + '?' + urlParams;
                await navigator.clipboard.writeText(url);
                window.history.replaceState(null, '', url);
              }}
            >
              Copy URL
            </button>
          </div>
        </div>)}
        <div className="mb-4 text-center">
          {tail === "left" && (
            <div className="text-sm text-gray-700 font-mono">
              H<sub>0</sub>: μ ≥ {mu} &nbsp;&nbsp; H<sub>1</sub>: μ &lt; {mu}
            </div>
          )}
          {tail === "right" && (
            <div className="text-sm text-gray-700 font-mono">
              H<sub>0</sub>: μ ≤ {mu} &nbsp;&nbsp; H<sub>1</sub>: μ &gt; {mu}
            </div>
          )}
          {tail === "two" && (
            <div className="text-sm text-gray-700 font-mono">
              H<sub>0</sub>: μ = {mu} &nbsp;&nbsp; H<sub>1</sub>: μ ≠ {mu}
            </div>
          )}
        </div>
        <div>
            <svg viewBox="0 0 500 220" width="100%" height="220" className="bg-gray-100 rounded shadow">
              {/* Axes */}
              <line x1={40} y1={180} x2={460} y2={180} stroke="#888" strokeWidth={2} />
              <line x1={250} y1={30} x2={250} y2={180} stroke="#888" strokeWidth={1} />
              {/* Curve */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth={2}
                points={getCurvePoints()}
              />
              {/* Critical region shading + 临界值红线合并渲染 */}
              {critRegions.map((region, idx) => {
                if (!(region.from < region.to)) return null;
                // 边界点
                const fromY = normalPdf((region.from - mu) / sigma) / sigma;
                const toY = normalPdf((region.to - mu) / sigma) / sigma;
                // 红线高度
                const fromPx = getPx(region.from);
                const toPx = getPx(region.to);
                const fromPy = getPy(fromY);
                const toPy = getPy(toY);
                // shading
                const polyPoints = getShadingPolygon(region);
                return (
                  <g key={idx}>
                    <polygon
                      fill="#e11d473a"
                      stroke="none"
                      points={polyPoints}
                    />
                    {/* 临界值红线，z-index高于shading */}
                    <line x1={fromPx} y1={fromPy} x2={fromPx} y2={180} stroke="#e11d48" strokeDasharray="4,2" />
                    <line x1={toPx} y1={toPy} x2={toPx} y2={180} stroke="#e11d48" strokeDasharray="4,2" />
                  </g>
                );
              })}
              {/* x̄ marker (sampleMean), solid green, full y axis */}
              <line x1={getPx(sampleMean)} y1={30} x2={getPx(sampleMean)} y2={180} stroke="#22c55e" strokeWidth={1.5} />
              {/* x axis ticks and labels */}
              {xTicks.map((x, i) => {
                const px = 40 + ((x - xMin) / (xMax - xMin)) * 420;
                return (
                  <g key={i}>
                    <line x1={px} y1={180} x2={px} y2={185} stroke="#888" strokeWidth={1} />
                    <text x={px} y={200} textAnchor="middle" className="fill-gray-600 text-xs">{x.toFixed(2)}</text>
                  </g>
                );
              })}
              {/* legend */}
              <g>
                <text x={385} y={50} className="fill-green-600 text-xs" fontWeight="bold">
                  x̄ = {sampleMean.toFixed(2)}
                </text>
                <text x={385} y={70} className="fill-red-600 text-xs" fontWeight="bold">
                  {tail === "two"
                    ? `k₁ = ${(mu + zCrit * se).toFixed(2)}`
                    : `k = ${(tail === "left" ? mu - zCrit * se : mu + zCrit * se).toFixed(2)}`}
                </text>
                {tail === "two" && (
                  <text x={385} y={90} className="fill-red-600 text-xs" fontWeight="bold">
                    k₂ = {(mu - zCrit * se).toFixed(2)}
                  </text>
                )}
              </g>
            </svg>
            <div className="text-center mt-2 text-sm font-bold text-gray-700">
              p-value = {pValue.toFixed(4)} {pValue < alpha / 100 ? <span className="text-green-600">(Reject H₀)</span> : <span className="text-gray-500">(Fail to Reject H₀)</span>}
            </div>
          </div>
      </div>
    </>
  );
}
