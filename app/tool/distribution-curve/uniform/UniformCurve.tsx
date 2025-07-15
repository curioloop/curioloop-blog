/* eslint-disable prefer-const */
import React, { useEffect, useRef } from "react";
import { WIDTH, HEIGHT, PADDING, OFFSET } from "@/tools/distCurve";

export interface UniformDiscreteCurveConfig {
  a: number;
  b: number;
  color?: string;
  name?: string;
}

interface UniformDiscreteCurveProps {
  curves: UniformDiscreteCurveConfig[];
  setSvgString: (svg: string) => void;
  showLegend?: boolean;
}

function uniformDiscretePMF(k: number, a: number, b: number) {
  if (k < a || k > b) return 0;
  if (a === b) return 1;
  return 1 / (b - a + 1);
}

function uniformDiscreteCDF(k: number, a: number, b: number) {
  if (k < a) return 0;
  if (k > b) return 1;
  return (k - a + 1) / (b - a + 1);
}

const UniformDiscreteCurve: React.FC<UniformDiscreteCurveProps> = ({ curves, setSvgString, showLegend }) => {
  const ref = useRef<SVGSVGElement>(null);
  const safeCurves = Array.isArray(curves) ? curves : [];

  // Find global min/max for all curves
  let minK = Infinity;
  let maxK = -Infinity;
  let maxY = 0;
  safeCurves.forEach(({ a, b }) => {
    minK = Math.min(minK, a);
    maxK = Math.max(maxK, b);
  });
  if (!isFinite(minK) || !isFinite(maxK)) {
    minK = 0;
    maxK = 5;
  }

  // Find maxY for all curves
  for (let k = minK; k <= maxK; k++) {
    for (const { a, b } of safeCurves) {
      const y = uniformDiscretePMF(k, a, b);
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
  // 缩小柱宽，x 轴中心不变
  const barW2 = Math.max(1, barW * 0.28); // 原为0.5，现缩小为0.28

  // Y axis ticks and labels
  // 展示每个曲线对应的唯一概率刻度，若重复则共用
  // y 轴刻度分数形式
  let yTickDefs: { value: number, label: string }[] = [];
  if (safeCurves.length > 0) {
    yTickDefs = safeCurves.map(({ a, b }) => {
      if (a === b) return { value: 1, label: '1' };
      return { value: 1 / (b - a + 1), label: `1/${b - a + 1}` };
    });
    // 降序排列，1在最上
    yTickDefs.sort((a, b) => b.value - a.value);
  }
  let yTickEls: React.ReactElement[] = yTickDefs.map((def, idx) => (
    <g key={def.label + idx}>
      <line x1={PADDING + OFFSET - 8} y1={HEIGHT - PADDING - (def.value / (maxY || 1)) * (HEIGHT - 2 * PADDING)} x2={PADDING + OFFSET} y2={HEIGHT - PADDING - (def.value / (maxY || 1)) * (HEIGHT - 2 * PADDING)} stroke="#888" strokeWidth={1} />
      <text x={PADDING + OFFSET - 12} y={HEIGHT - PADDING - (def.value / (maxY || 1)) * (HEIGHT - 2 * PADDING) + 4} textAnchor="end" className="fill-gray-500 text-xs">
        {def.label}
      </text>
    </g>
  ));

  // X axis ticks and labels（与 PoissonCurve 逻辑一致）
  const totalTicks = maxK - minK + 1;
  let showArr: boolean[] = Array(totalTicks).fill(true);
  if (totalTicks > 30) {
    const step = Math.ceil(totalTicks / 20);
    for (let i = 0; i < totalTicks; i++) {
      showArr[i] = (i % step === 0) || i === 0;
    }
    if (showArr[totalTicks - 2]) {
      showArr[totalTicks - 1] = false;
    } else {
      showArr[totalTicks - 1] = true;
    }
  }

  return (
    <svg
      ref={ref}
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH+50} ${HEIGHT}`}
      className="w-full h-[400px] min-w-[600px] max-w-full bg-gray-100 rounded shadow mx-auto block"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Legend */}
      {showLegend !== false && safeCurves.length > 0 && (
        <g>
          {/* 居中放置 legend，水平排布 */}
          {safeCurves.map((curve, idx) => {
            const legendWidth = 150;
            const totalWidth = legendWidth * safeCurves.length;
            // 居中起点
            const startX = 50 + (WIDTH - totalWidth) / 2;
            const x = startX + idx * legendWidth;
            return (
              <g key={idx} transform={`translate(${x},${PADDING - 40})`}>
                <rect x={0} y={0} width={legendWidth} height={24} rx={6} fill="transparent" stroke="transparent" strokeWidth={0} />
                <rect x={8} y={5} width={14} height={14} rx={3} fill={curve.color || '#2563eb'} />
                <text x={28} y={18} fontSize={12} fill="#333" fontWeight="bold">
                  {curve.name ?? ""} {curve.name ? '(' : ''} a={curve.a}, b={curve.b} {curve.name ? ')' : ''}
                </text>
              </g>
            );
          })}
        </g>
      )}
      {/* Axes */}
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={WIDTH - (PADDING-OFFSET)} y2={HEIGHT - PADDING} stroke="#888" strokeWidth={2} />
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={PADDING+OFFSET} y2={PADDING} stroke="#888" strokeWidth={2} />
      {/* Y axis ticks and labels */}
      {yTickEls}
      {/* X axis ticks and labels */}
      {Array.from({ length: totalTicks }).map((_, i) => {
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
      })}
      {/* Bars for each curve */}
      {safeCurves.map((curve, cidx) => (
        Array.from({ length: maxK - minK + 1 }).map((_, i) => {
          const k = minK + i;
          const y = uniformDiscretePMF(k, curve.a, curve.b);
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

export default UniformDiscreteCurve;

export const CDFCurve: React.FC<{
  curves: UniformDiscreteCurveConfig[];
  setSvgString: (svg: string) => void;
  showLegend?: boolean;
}> = ({ curves, setSvgString, showLegend }) => {  
  const ref = useRef<SVGSVGElement>(null);
  const safeCurves = Array.isArray(curves) ? curves : [];
  let minK = Infinity;
  let maxK = -Infinity;
  safeCurves.forEach(({ a, b }) => {
    minK = Math.min(minK, a);
    maxK = Math.max(maxK, b);
  });
  if (!isFinite(minK) || !isFinite(maxK)) {
    minK = 0;
    maxK = 5;
  }
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

  // X axis ticks and labels（与 PoissonCurve 逻辑一致）
  const totalTicks = maxK - minK + 1;
  let showArr: boolean[] = Array(totalTicks).fill(true);
  if (totalTicks > 30) {
    const step = Math.ceil(totalTicks / 20);
    for (let i = 0; i < totalTicks; i++) {
      showArr[i] = (i % step === 0) || i === 0;
    }
    if (showArr[totalTicks - 2]) {
      showArr[totalTicks - 1] = false;
    } else {
      showArr[totalTicks - 1] = true;
    }
  }

  useEffect(() => {
    if (ref.current) {
      setSvgString(ref.current.outerHTML);
    }
  }, [curves, setSvgString]);

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
      {showLegend !== false && safeCurves.length > 0 && (
        <g>
          {/* 居中放置 legend，水平排布 */}
          {safeCurves.map((curve, idx) => {
            const legendWidth = 150;
            const totalWidth = legendWidth * safeCurves.length;
            // 居中起点
            const startX = 50 + (WIDTH - totalWidth) / 2;
            const x = startX + idx * legendWidth;
            return (
              <g key={idx} transform={`translate(${x},${PADDING - 40})`}>
                <rect x={0} y={0} width={legendWidth} height={24} rx={6} fill="transparent" stroke="transparent" strokeWidth={0} />
                <rect x={8} y={5} width={14} height={14} rx={3} fill={curve.color || '#2563eb'} />
                <text x={28} y={18} fontSize={12} fill="#333" fontWeight="bold">
                  {curve.name ?? ""} {curve.name ? '(' : ''} a={curve.a}, b={curve.b} {curve.name ? ')' : ''}
                </text>
              </g>
            );
          })}
        </g>
      )}
      {/* Axes */}
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={WIDTH - (PADDING-OFFSET)} y2={HEIGHT - PADDING} stroke="#888" strokeWidth={2} />
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={PADDING+OFFSET} y2={PADDING} stroke="#888" strokeWidth={2} />
      {/* Y axis ticks and labels */}
      {yTickEls}
      {/* X axis ticks and labels */}
      {Array.from({ length: totalTicks }).map((_, i) => {
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
      })}
      {/* CDF step lines for each curve */}
      {safeCurves.map((curve, cidx) => {
        const steps = [];
        // 0 段：概率为0的水平线
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
        const cdf0 = uniformDiscreteCDF(minK, curve.a, curve.b);
        const py0 = HEIGHT - PADDING - cdf0 * (HEIGHT - 2 * PADDING);
        steps.push(
          <line
            key={`v-${cidx}-zero`}
            x1={pxFirst}
            y1={pyZero}
            x2={pxFirst}
            y2={py0}
            stroke={curve.color || '#2563eb'}
            strokeWidth={2}
            strokeDasharray="2,2"
            opacity={0.5}
          />
        );
        // 主体阶梯（含第一个概率横线）
        let prevPx = pxFirst;
        let prevPy = py0;
        for (let i = 0; i <= maxK - minK; i++) {
          const k = minK + i;
          const cdfCurr = uniformDiscreteCDF(k, curve.a, curve.b);
          const cdfNext = uniformDiscreteCDF(k + 1, curve.a, curve.b);
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
                strokeWidth={2}
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