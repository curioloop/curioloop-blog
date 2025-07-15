/* eslint-disable prefer-const */

import React, { useEffect, useRef } from "react";
import { WIDTH, HEIGHT, PADDING, OFFSET } from "@/tools/distCurve";

export interface PoissonCurveConfig {
  lambda: number;
  color?: string;
  name?: string;
}

interface PoissonCurveProps {
  curves: PoissonCurveConfig[];
  setSvgString: (svg: string) => void;
  showLegend?: boolean;
}

function poissonPMF(k: number, lambda: number) {
  if (k < 0) return 0;
  let logP = -lambda + k * Math.log(lambda) - logFactorial(k);
  return Math.exp(logP);
}

function logFactorial(n: number) {
  let res = 0;
  for (let i = 2; i <= n; i++) res += Math.log(i);
  return res;
}

function poissonCDF(k: number, lambda: number) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return sum;
}

const PoissonCurve: React.FC<PoissonCurveProps> = ({ curves, setSvgString, showLegend }) => {
  const ref = useRef<SVGSVGElement>(null);
  const safeCurves = Array.isArray(curves) ? curves : [];

  // Find global min/max for all curves
  let minK = 0;
  let maxK = 0;
  let maxY = 0;
  safeCurves.forEach(({ lambda }) => {
    minK = 0;
    maxK = Math.max(maxK, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
  });
  if (!isFinite(maxK) || maxK < 5) maxK = 10;

  // Find maxY for all curves
  for (let k = minK; k <= maxK; k++) {
    for (const { lambda } of safeCurves) {
      const y = poissonPMF(k, lambda);
      if (y > maxY) maxY = y;
    }
  }

  useEffect(() => {
    if (ref.current) {
      setSvgString(ref.current.outerHTML);
    }
  }, [curves, setSvgString]);

  // Bar width
  const barW = (WIDTH - 2 * PADDING) / (maxK - minK + 1);
  // 缩小柱宽为原来一半
  const barW2 = Math.max(2, barW * 0.5);

  // Y axis ticks and labels
  const yTicks = 5;
  const yTickEls = Array.from({ length: yTicks + 1 }).map((_, i) => {
    const yVal = (maxY * i) / yTicks;
    const py = HEIGHT - PADDING - (yVal / (maxY || 1)) * (HEIGHT - 2 * PADDING);
    return (
      <g key={i}>
        <line x1={PADDING + OFFSET - 8} y1={py} x2={PADDING + OFFSET} y2={py} stroke="#888" strokeWidth={1} />
        <text x={PADDING + OFFSET - 12} y={py + 4} textAnchor="end" className="fill-gray-500 text-xs">
          {yVal.toFixed(2)}
        </text>
      </g>
    );
  });

  return (
    <svg
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-[400px] min-w-[600px] max-w-full bg-gray-100 rounded shadow mx-auto block"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Legend */}
      {showLegend !== false && (
        <g transform={`translate(${WIDTH - PADDING - 120},${PADDING - 10})`}>
          <rect x={0} y={0} width={150} height={24 + 22 * safeCurves.length} rx={6} fill="transparent" stroke="transparent" strokeWidth={0} />
          {safeCurves.map((curve, idx) => (
            <g key={idx}>
              <rect x={8} y={22 + idx * 22 - 10} width={14} height={14} rx={3} fill={curve.color || '#2563eb'} />
              <text x={28} y={22 + idx * 22} fontSize={12} fill="#333" fontWeight="bold">
                {curve.name ?? ""} {curve.name ? '(' : ''} λ={curve.lambda} {curve.name ? ')' : ''} 
              </text>
            </g>
          ))}
        </g>
      )}
      {/* Axes */}
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={WIDTH - (PADDING-OFFSET)} y2={HEIGHT - PADDING} stroke="#888" strokeWidth={2} />
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={PADDING+OFFSET} y2={PADDING} stroke="#888" strokeWidth={2} />
      {/* Y axis ticks and labels */}
      {yTickEls}
      {/* X axis ticks and labels */}
      {(() => {
        const totalTicks = maxK - minK + 1;
        let showArr: boolean[] = Array(totalTicks).fill(true);
        if (totalTicks > 30) {
          const step = Math.ceil(totalTicks / 20);
          for (let i = 0; i < totalTicks; i++) {
            showArr[i] = (i % step === 0) || i === 0;
          }
          // 处理倒数第二和最后一个的特殊逻辑
          if (showArr[totalTicks - 2]) {
            showArr[totalTicks - 1] = false;
          } else {
            showArr[totalTicks - 1] = true;
          }
        }
        return Array.from({ length: totalTicks }).map((_, i) => {
          const k = minK + i;
          const px = PADDING + OFFSET + i * barW + barW / 2;
          return (
            <g key={i}>
              <line x1={px} y1={HEIGHT - PADDING} x2={px} y2={HEIGHT - PADDING + 8} stroke="#888" strokeWidth={1} />
              {showArr[i] && (
                <text x={px} y={HEIGHT - PADDING + 22} textAnchor="middle" className="fill-gray-500 text-xs">
                  {k}
                </text>
              )}
            </g>
          );
        });
      })()}
      {/* Bars for each curve */}
      {safeCurves.map((curve, cidx) => (
        Array.from({ length: maxK - minK + 1 }).map((_, i) => {
          const k = minK + i;
          const y = poissonPMF(k, curve.lambda);
          // 保持柱中心不变，缩小宽度
          const px = PADDING + OFFSET + i * barW + barW / 2 - barW2 / 2;
          const py = HEIGHT - PADDING - y * (HEIGHT - 2 * PADDING) / (maxY || 1);
          return (
            <rect
              key={cidx + '-' + k}
              x={px + cidx * (barW2 / safeCurves.length)}
              y={py}
              width={barW2 / safeCurves.length}
              height={HEIGHT - PADDING - py}
              fill={curve.color || '#2563eb'}
              opacity={0.7}
            />
          );
        })
      ))}
    </svg>
  );
};

export default PoissonCurve;

export const CDFCurve: React.FC<{
  curves: PoissonCurveConfig[];
  setSvgString: (svg: string) => void;
  showLegend?: boolean;
}> = ({ curves, setSvgString, showLegend }) => {  

  const ref = useRef<SVGSVGElement>(null);
  const safeCurves = Array.isArray(curves) ? curves : [];

  let minK = 0;
  let maxK = 0;
  safeCurves.forEach(({ lambda }) => {
    minK = 0;
    maxK = Math.max(maxK, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
  });
  if (!isFinite(maxK) || maxK < 5) maxK = 10;

  useEffect(() => {
    if (ref.current) {
      setSvgString(ref.current.outerHTML);
    }
  }, [curves, setSvgString]);

  const barW = (WIDTH - 2 * PADDING) / (maxK - minK + 1);

  // Y axis ticks and labels (for CDF, always 0~1)
  const yTicks = 5;
  const yTickEls = Array.from({ length: yTicks + 1 }).map((_, i) => {
    const yVal = (1 * i) / yTicks;
    const py = HEIGHT - PADDING - yVal * (HEIGHT - 2 * PADDING);
    return (
      <g key={i}>
        <line x1={PADDING + OFFSET - 8} y1={py} x2={PADDING + OFFSET} y2={py} stroke="#888" strokeWidth={1} />
        <text x={PADDING + OFFSET - 12} y={py + 4} textAnchor="end" className="fill-gray-500 text-xs">
          {yVal.toFixed(2)}
        </text>
      </g>
    );
  });

  return (
    <svg
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-[400px] min-w-[600px] max-w-full bg-gray-100 rounded shadow mx-auto block"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Legend */}
      {showLegend !== false && (
        <g transform={`translate(${WIDTH - PADDING - 120},${100})`}>
          <rect x={0} y={0} width={150} height={24 + 22 * safeCurves.length} rx={6} fill="transparent" stroke="transparent" strokeWidth={0} />
          {safeCurves.map((curve, idx) => (
            <g key={idx}>
              <rect x={8} y={22 + idx * 22 - 10} width={14} height={14} rx={3} fill={curve.color || '#2563eb'} />
              <text x={28} y={22 + idx * 22} fontSize={12} fill="#333" fontWeight="bold">
                {curve.name ?? ""} {curve.name ? '(' : ''} λ={curve.lambda} {curve.name ? ')' : ''} 
              </text>
            </g>
          ))}
        </g>
      )}
      {/* Axes */}
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={WIDTH - (PADDING-OFFSET)} y2={HEIGHT - PADDING} stroke="#888" strokeWidth={2} />
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={PADDING+OFFSET} y2={PADDING} stroke="#888" strokeWidth={2} />
      {/* Y axis ticks and labels */}
      {yTickEls}
      {/* X axis ticks and labels */}
      {(() => {
        const totalTicks = maxK - minK + 1;
        let showArr: boolean[] = Array(totalTicks).fill(true);
        if (totalTicks > 30) {
          const step = Math.ceil(totalTicks / 20);
          for (let i = 0; i < totalTicks; i++) {
            showArr[i] = (i % step === 0) || i === 0;
          }
          // 处理倒数第二和最后一个的特殊逻辑
          if (showArr[totalTicks - 2]) {
            showArr[totalTicks - 1] = false;
          } else {
            showArr[totalTicks - 1] = true;
          }
        }
        return Array.from({ length: totalTicks }).map((_, i) => {
          const k = minK + i;
          const px = PADDING + OFFSET + i * barW + barW / 2;
          return (
            <g key={i}>
              <line x1={px} y1={HEIGHT - PADDING} x2={px} y2={HEIGHT - PADDING + 8} stroke="#888" strokeWidth={1} />
              {showArr[i] && (
                <text x={px} y={HEIGHT - PADDING + 22} textAnchor="middle" className="fill-gray-500 text-xs">
                  {k}
                </text>
              )}
            </g>
          );
        });
      })()}
      {/* CDF step lines for each curve (阶梯+虚线，首段为0) */}
      {safeCurves.map((curve, cidx) => {
        const steps = [];
        // 概率为0的水平线
        const pxStart = PADDING + OFFSET;
        const pxFirst = pxStart + barW / 2;
        const pyZero = HEIGHT - PADDING;
        steps.push(
          <line
            key={`h-${cidx}-zero`}
            x1={pxStart}
            y1={pyZero}
            x2={pxFirst}
            y2={pyZero}
            stroke={curve.color || '#2563eb'}
            strokeWidth={3}
          />
        );
        // 虚线跳变到第一个概率
        const maxX = WIDTH - (PADDING-OFFSET);
        const cdf0 = poissonCDF(minK, curve.lambda);
        const py0 = HEIGHT - PADDING - cdf0 * (HEIGHT - 2 * PADDING);
        steps.push(
          <line
            key={`v-${cidx}-zero`}
            x1={pxFirst}
            y1={pyZero}
            x2={pxFirst}
            y2={py0}
            stroke={curve.color || '#2563eb'}
            strokeWidth={1.5}
            strokeDasharray="2,2"
            opacity={0.5}
          />
        );
        // 主体阶梯
        let prevPx = pxFirst;
        let prevPy = py0;
        for (let i = 0; i <= maxK - minK; i++) {
          const k = minK + i;
          const cdfCurr = poissonCDF(k, curve.lambda);
          const cdfNext = poissonCDF(k + 1, curve.lambda);
          const pxNext = PADDING + OFFSET + (i + 1) * barW + barW / 2;
          const pyCurr = HEIGHT - PADDING - cdfCurr * (HEIGHT - 2 * PADDING);
          const pyNext = HEIGHT - PADDING - cdfNext * (HEIGHT - 2 * PADDING);
          // 横线：从 prevPx 到 pxNext，y=pyCurr
          steps.push(
            <line
              key={`h-${cidx}-${k}`}
              x1={prevPx}
              y1={pyCurr}
              x2={Math.min(maxX, pxNext)}
              y2={pyCurr}
              stroke={curve.color || '#2563eb'}
              strokeWidth={3}
            />
          );
          // 竖线：在下一个 x 刻度处跳变
          if (i < maxK - minK) {
            steps.push(
              <line
                key={`v-${cidx}-${k}`}
                x1={pxNext}
                y1={pyCurr}
                x2={pxNext}
                y2={pyNext}
                stroke={curve.color || '#2563eb'}
                strokeWidth={1.5}
                strokeDasharray="2,2"
                opacity={0.5}
              />
            );
          }
          prevPx = pxNext;
          prevPy = pyNext;
        }
        return steps;
      })}
    </svg>
  );
};