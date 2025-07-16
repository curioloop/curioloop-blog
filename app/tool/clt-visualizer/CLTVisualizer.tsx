/* eslint-disable prefer-const */
"use client";

import React, { useState, useEffect } from "react";

const WIDTH = 600;
const HEIGHT = 300;
const PADDING = 40;

const DISTRIBUTIONS = [
  { key: "normal", name: "Normal(μ, σ)", params: ["mu", "sigma"] },
  { key: "exponential", name: "Exponential(λ)", params: ["lambda"] },
  { key: "uniform", name: "Uniform(a, b)", params: ["a", "b"] },
  { key: "poisson", name: "Poisson(λ)", params: ["lambda"] },
];

// 正态分布采样（Box-Muller）
export function sampleNormal(mu: number, sigma: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mu + sigma * z;
}

// 指数分布采样
export function sampleExponential(lambda: number): number {
  let u = 0;
  while (u === 0) u = Math.random();
  return -Math.log(u) / lambda;
}

// 均匀分布采样
export function sampleUniform(a: number, b: number): number {
  return a + (b - a) * Math.random();
}

// 泊松分布采样（Knuth算法）
export function samplePoisson(lambda: number): number {
  let L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function getSampler(dist: string) {
  switch (dist) {
    case "normal": return (p: any) => sampleNormal(Number(p.mu), Number(p.sigma));
    case "exponential": return (p: any) => sampleExponential(Number(p.lambda));
    case "uniform": return (p: any) => sampleUniform(Number(p.a), Number(p.b));
    case "poisson": return (p: any) => samplePoisson(Number(p.lambda));
    default: return () => 0;
  }
}

export default function CLTVisualizer() {
  const [dist, setDist] = useState("normal");
  const [params, setParams] = useState<any>({ mu: 0, sigma: 1, lambda: 1, a: 0, b: 5 });
  const [sampleCount, setSampleCount] = useState(1000);
  const [sampleSize, setSampleSize] = useState(10);
  const [rawSamples, setRawSamples] = useState<number[]>([]);
  const [meanSamples, setMeanSamples] = useState<number[]>([]);
  const [urlInitialized, setUrlInitialized] = useState(false);

  useEffect(() => {
    if (urlInitialized) return;
    if (typeof window === "undefined") return;
    const search = window.location.search;
    if (!search) return;
    // ?dist=normal(0,1)&sampleCount=1000&sampleSize=10
    // ?dist=exponential(2)&sampleCount=1000&sampleSize=10
    // ?dist=poisson(3)&sampleCount=1000&sampleSize=10
    // ?dist=uniform(0,5)&sampleCount=1000&sampleSize=10
    const paramsObj = Object.fromEntries(new URLSearchParams(search));
    let distKey = dist;
    let newParams: any = { ...params };
    if (paramsObj.dist) {
      const match = paramsObj.dist.match(/^(\w+)\(([^)]*)\)$/);
      if (match) {
        distKey = match[1];
        setDist(distKey);
        const distDef = DISTRIBUTIONS.find(d => d.key === distKey);
        if (distDef) {
          const paramValues = match[2].split(",").map(s => s.trim());
          distDef.params.forEach((p, i) => {
            if (paramValues[i] !== undefined && !isNaN(Number(paramValues[i]))) {
              newParams[p] = paramValues[i];
            }
          });
        }
      } else if (DISTRIBUTIONS.some(d => d.key === paramsObj.dist)) {
        distKey = paramsObj.dist;
        setDist(distKey);
      }
    }
    setParams(newParams);
    if (paramsObj.sampleCount && !isNaN(Number(paramsObj.sampleCount))) {
      setSampleCount(Number(paramsObj.sampleCount));
    }
    if (paramsObj.sampleSize && !isNaN(Number(paramsObj.sampleSize))) {
      setSampleSize(Number(paramsObj.sampleSize));
    }
    setUrlInitialized(true);
    const distDef = DISTRIBUTIONS.find(d => d.key === distKey);
    const hasAllParams = distDef && distDef.params.every(p => newParams[p] !== undefined && !isNaN(Number(newParams[p])));
    if (hasAllParams && paramsObj.sampleCount && paramsObj.sampleSize) {
      // 直接用解析到的参数采样，避免异步 setState 导致 handleSample 用到旧参数
      const sampler = getSampler(distKey);
      updateSample(Number(paramsObj.sampleCount), Number(paramsObj.sampleSize), sampler, newParams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlInitialized]);

  // 采样并计算均值
  const handleSample = () => {
    const sampler = getSampler(dist);
    updateSample(sampleCount, sampleSize, sampler, params);
  };

  const updateSample = (count:number, size:number, sampler: (p: any) => number, params:any) => {
      const raw: number[] = [];
      const means: number[] = [];
      for (let i = 0; i < count; i++) {
        const group: number[] = [];
        for (let j = 0; j < size; j++) {
          group.push(sampler(params));
        }
        raw.push(...group);
        means.push(group.reduce((a, b) => a + b, 0) / size);
      }
      setRawSamples(raw);
      setMeanSamples(means);
  };

  // 直方图数据
  function getHistogram(data: number[], binCount = 40) {
    if (!data.length) return { bins: [], counts: [] };
    let min = data[0], max = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i] < min) min = data[i];
      if (data[i] > max) max = data[i];
    }
    // 若所有值相等，避免分母为0
    if (min === max) {
      const bins = Array.from({ length: binCount + 1 }, () => min);
      const counts = Array(binCount).fill(0);
      counts[0] = data.length;
      return { bins, counts };
    }
    const bins = Array.from({ length: binCount + 1 }, (_, i) => min + (max - min) * (i / binCount));
    const counts = Array(binCount).fill(0);
    for (const v of data) {
      let idx = Math.floor(((v - min) / (max - min)) * binCount);
      if (idx < 0) idx = 0;
      if (idx >= binCount) idx = binCount - 1;
      counts[idx]++;
    }
    return { bins, counts };
  }

  const rawHist = getHistogram(rawSamples);
  const meanHist = getHistogram(meanSamples);
  const maxRaw = Math.max(...rawHist.counts, 1);
  const maxMean = Math.max(...meanHist.counts, 1);

  return (
    <>
      <h1 className="text-3xl font-bold pt-5 text-center text-black">Central Limit Theorem Visualizer</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex flex-wrap gap-4 mb-2 items-end w-full">
          <label className="flex flex-col text-xs font-bold text-gray-600">
            Distribution
            <select
              value={dist}
              onChange={e => setDist(e.target.value)}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full min-w-[160px]"
            >
              {DISTRIBUTIONS.map(d => (
                <option key={d.key} value={d.key}>{d.name}</option>
              ))}
            </select>
          </label>
          {DISTRIBUTIONS.find(d => d.key === dist)?.params.map(p => (
            <label key={p} className="flex flex-col text-xs font-bold text-gray-600">
              {p}
              <input
                type="number"
                value={params[p]}
                step="any"
                onChange={e => setParams((old: any) => ({ ...old, [p]: e.target.value }))}
                className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full min-w-[100px]"
              />
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mb-4 items-end w-full">
          <label className="flex flex-col text-xs font-bold text-gray-600">
            Number of Samples
            <input
              type="number"
              value={sampleCount}
              min={1}
              step={1}
              onChange={e => setSampleCount(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full min-w-[100px]"
            />
          </label>
          <label className="flex flex-col text-xs font-bold text-gray-600">
            Sample Size
            <input
              type="number"
              value={sampleSize}
              min={1}
              step={1}
              onChange={e => setSampleSize(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white w-full min-w-[100px]"
            />
          </label>
          <button
            onClick={handleSample}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-bold mt-4">
            Resample
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs font-bold mt-4"
            onClick={async () => {
              if (typeof window === 'undefined') return;
              const distDef = DISTRIBUTIONS.find(d => d.key === dist);
              let distParamStr = dist;
              if (distDef) {
                const paramStr = distDef.params.map(p => params[p]).join(',');
                distParamStr = `${dist}(${paramStr})`;
              }
              const baseUrl = window.location.origin + window.location.pathname;
              const urlParams = [
                `dist=${distParamStr}`,
                `sampleCount=${sampleCount}`,
                `sampleSize=${sampleSize}`
              ].join('&');
              const url = baseUrl + '?' + urlParams;
              await navigator.clipboard.writeText(url);
              window.history.replaceState(null, '', url);
            }}
          >
            Copy URL
          </button>
        </div>
        <div className="flex flex-col gap-8 justify-center items-center mt-6">
          <div>
            <div className="text-xs text-gray-500 mb-1 text-center">Samples Distribution</div>
            <svg width={WIDTH} height={HEIGHT} className="bg-gray-100 rounded shadow" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}> 
              {/* x axis */}
              <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke="#888" strokeWidth={2} />
              {/* y axis */}
              <line x1={PADDING} y1={HEIGHT - PADDING} x2={PADDING} y2={PADDING} stroke="#888" strokeWidth={2} />
              {/* x/y axis ticks and labels only if data exists */}
              {rawSamples.length > 0 && rawHist.bins.map((bin, i) => {
                if (i % 5 !== 0 && i !== 0 && i !== rawHist.bins.length - 1) return null;
                const x = PADDING + (i / (rawHist.bins.length - 1)) * (WIDTH - 2 * PADDING);
                return (
                  <g key={i}>
                    <line x1={x} y1={HEIGHT - PADDING} x2={x} y2={HEIGHT - PADDING + 6} stroke="#888" strokeWidth={1} />
                    <text x={x} y={HEIGHT - PADDING + 18} textAnchor="middle" className="fill-gray-500 text-xs">{bin.toFixed(2)}</text>
                  </g>
                );
              })}
              {rawSamples.length > 0 && Array.from({ length: 5 }).map((_, i) => {
                const frac = i / 4;
                const y = HEIGHT - PADDING - frac * (HEIGHT - 2 * PADDING);
                const val = Math.round(maxRaw * frac);
                return (
                  <g key={i}>
                    <line x1={PADDING - 6} y1={y} x2={PADDING} y2={y} stroke="#888" strokeWidth={1} />
                    <text x={PADDING - 10} y={y + 4} textAnchor="end" className="fill-gray-500 text-xs">{val}</text>
                  </g>
                );
              })}
              {/* 柱状图 */}
              {rawHist.counts.map((c, i) => {
                const x0 = PADDING + (i / rawHist.counts.length) * (WIDTH - 2 * PADDING);
                const x1 = PADDING + ((i + 1) / rawHist.counts.length) * (WIDTH - 2 * PADDING);
                const y = HEIGHT - PADDING - (c / maxRaw) * (HEIGHT - 2 * PADDING);
                return (
                  <rect
                    key={i}
                    x={x0}
                    y={y}
                    width={x1 - x0 - 1}
                    height={HEIGHT - PADDING - y}
                    fill="#2563eb"
                    opacity={0.7}
                  />
                );
              })}
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 text-center">Sample Means Distribution</div>
            <svg width={WIDTH} height={HEIGHT} className="bg-gray-100 rounded shadow" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}> 
              {/* x axis */}
              <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke="#888" strokeWidth={2} />
              {/* y axis */}
              <line x1={PADDING} y1={HEIGHT - PADDING} x2={PADDING} y2={PADDING} stroke="#888" strokeWidth={2} />
              {/* x/y axis ticks and labels only if data exists */}
              {meanSamples.length > 0 && meanHist.bins.map((bin, i) => {
                if (i % 5 !== 0 && i !== 0 && i !== meanHist.bins.length - 1) return null;
                const x = PADDING + (i / (meanHist.bins.length - 1)) * (WIDTH - 2 * PADDING);
                return (
                  <g key={i}>
                    <line x1={x} y1={HEIGHT - PADDING} x2={x} y2={HEIGHT - PADDING + 6} stroke="#888" strokeWidth={1} />
                    <text x={x} y={HEIGHT - PADDING + 18} textAnchor="middle" className="fill-gray-500 text-xs">{bin.toFixed(2)}</text>
                  </g>
                );
              })}
              {meanSamples.length > 0 && Array.from({ length: 5 }).map((_, i) => {
                const frac = i / 4;
                const y = HEIGHT - PADDING - frac * (HEIGHT - 2 * PADDING);
                const val = Math.round(maxMean * frac);
                return (
                  <g key={i}>
                    <line x1={PADDING - 6} y1={y} x2={PADDING} y2={y} stroke="#888" strokeWidth={1} />
                    <text x={PADDING - 10} y={y + 4} textAnchor="end" className="fill-gray-500 text-xs">{val}</text>
                  </g>
                );
              })}
              {/* 柱状图 */}
              {meanHist.counts.map((c, i) => {
                const x0 = PADDING + (i / meanHist.counts.length) * (WIDTH - 2 * PADDING);
                const x1 = PADDING + ((i + 1) / meanHist.counts.length) * (WIDTH - 2 * PADDING);
                const y = HEIGHT - PADDING - (c / maxMean) * (HEIGHT - 2 * PADDING);
                return (
                  <rect
                    key={i}
                    x={x0}
                    y={y}
                    width={x1 - x0 - 1}
                    height={HEIGHT - PADDING - y}
                    fill="#e11d48"
                    opacity={0.7}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}