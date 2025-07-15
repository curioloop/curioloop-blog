/* eslint-disable prefer-const */

import React, { useEffect, useRef } from "react";
import { WIDTH, HEIGHT, PADDING, OFFSET } from "@/tools/distCurve";

export interface ExponentialCurveConfig {
  lambda: number;
  color?: string;
  name?: string;
}

function exponentialPDF(x: number, lambda: number) {
  if (x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

function exponentialCDF(x: number, lambda: number) {
  if (x < 0) return 0;
  return 1 - Math.exp(-lambda * x);
}

const ExponentialCurve: React.FC<{
  curves: ExponentialCurveConfig[];
  setSvgString: (svg: string) => void;
  showLegend?: boolean;
}> = ({ curves, setSvgString, showLegend }) => {
  const ref = useRef<SVGSVGElement>(null);
  const safeCurves = Array.isArray(curves) ? curves : [];

  // Find global min/max for all curves
  let minX = 0;
  let maxX = 5;
  safeCurves.forEach(({ lambda }) => {
    // 99% quantile for exponential: -ln(0.01)/lambda
    maxX = Math.max(maxX, Math.ceil(-Math.log(0.01) / lambda));
  });

  // Find maxY for all curves
  let maxY = 0;
  for (let i = 0; i <= 300; i++) {
    const x = minX + (maxX - minX) * (i / 300);
    for (const { lambda } of safeCurves) {
      const y = exponentialPDF(x, lambda);
      if (y > maxY) maxY = y;
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
      {Array.from({ length: 5 + 1 }).map((_, i) => {
        const yVal = (maxY * i) / 5;
        const py = HEIGHT - PADDING - (yVal / (maxY || 1)) * (HEIGHT - 2 * PADDING);
        return (
          <g key={i}>
            <line x1={PADDING + OFFSET - 8} y1={py} x2={PADDING + OFFSET} y2={py} stroke="#888" strokeWidth={1} />
            <text x={PADDING + OFFSET - 12} y={py + 4} textAnchor="end" className="fill-gray-500 text-xs">
              {yVal.toFixed(2)}
            </text>
          </g>
        );
      })}
      {/* X axis ticks and labels */}
      {Array.from({ length: 11 }).map((_, i) => {
        const xVal = minX + (maxX - minX) * (i / 10);
        const px = PADDING + OFFSET + ((WIDTH - 2 * PADDING) * (i / 10));
        return (
          <g key={i}>
            <line x1={px} y1={HEIGHT - PADDING} x2={px} y2={HEIGHT - PADDING + 8} stroke="#888" strokeWidth={1} />
            <text x={px} y={HEIGHT - PADDING + 22} textAnchor="middle" className="fill-gray-500 text-xs">
              {xVal.toFixed(1)}
            </text>
          </g>
        );
      })}
      {/* PDF curves */}
      {safeCurves.map((curve, cidx) => (
        <polyline
          key={cidx}
          fill="none"
          stroke={curve.color || '#2563eb'}
          strokeWidth={3}
          points={Array.from({ length: 300 }).map((_, i) => {
            const x = minX + (maxX - minX) * (i / 299);
            const y = exponentialPDF(x, curve.lambda);
            const px = PADDING + OFFSET + ((x - minX) / (maxX - minX)) * (WIDTH - 2 * PADDING);
            const py = HEIGHT - PADDING - (y / (maxY || 1)) * (HEIGHT - 2 * PADDING);
            return `${px},${py}`;
          }).join(' ')}
          opacity={0.8}
        />
      ))}
    </svg>
  );
};

export const ExponentialCDFCurve: React.FC<{
  curves: ExponentialCurveConfig[];
  setSvgString: (svg: string) => void;
  showLegend?: boolean;
}> = ({ curves, setSvgString, showLegend }) => {
  const ref = useRef<SVGSVGElement>(null);
  const safeCurves = Array.isArray(curves) ? curves : [];

  let minX = 0;
  let maxX = 5;
  safeCurves.forEach(({ lambda }) => {
    maxX = Math.max(maxX, Math.ceil(-Math.log(0.01) / lambda));
  });

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
      {/* Y axis ticks and labels (0~1) */}
      {Array.from({ length: 5 + 1 }).map((_, i) => {
        const yVal = i / 5;
        const py = HEIGHT - PADDING - yVal * (HEIGHT - 2 * PADDING);
        return (
          <g key={i}>
            <line x1={PADDING + OFFSET - 8} y1={py} x2={PADDING + OFFSET} y2={py} stroke="#888" strokeWidth={1} />
            <text x={PADDING + OFFSET - 12} y={py + 4} textAnchor="end" className="fill-gray-500 text-xs">
              {yVal.toFixed(2)}
            </text>
          </g>
        );
      })}
      {/* X axis ticks and labels */}
      {Array.from({ length: 11 }).map((_, i) => {
        const xVal = minX + (maxX - minX) * (i / 10);
        const px = PADDING + OFFSET + ((WIDTH - 2 * PADDING) * (i / 10));
        return (
          <g key={i}>
            <line x1={px} y1={HEIGHT - PADDING} x2={px} y2={HEIGHT - PADDING + 8} stroke="#888" strokeWidth={1} />
            <text x={px} y={HEIGHT - PADDING + 22} textAnchor="middle" className="fill-gray-500 text-xs">
              {xVal.toFixed(1)}
            </text>
          </g>
        );
      })}
      {/* CDF curves */}
      {safeCurves.map((curve, cidx) => (
        <polyline
          key={cidx}
          fill="none"
          stroke={curve.color || '#2563eb'}
          strokeWidth={3}
          points={Array.from({ length: 300 }).map((_, i) => {
            const x = minX + (maxX - minX) * (i / 299);
            const y = exponentialCDF(x, curve.lambda);
            const px = PADDING + OFFSET + ((x - minX) / (maxX - minX)) * (WIDTH - 2 * PADDING);
            const py = HEIGHT - PADDING - y * (HEIGHT - 2 * PADDING);
            return `${px},${py}`;
          }).join(' ')}
          opacity={0.8}
        />
      ))}
    </svg>
  );
};

export default ExponentialCurve;
