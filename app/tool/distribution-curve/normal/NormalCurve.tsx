import React, { useEffect, useRef } from "react";
import { WIDTH, HEIGHT, PADDING, OFFSET } from "@/tools/distCurve";
import { normalPdf, normalCdf } from "@/tools/normDist";
const N = 200;

export interface CurveConfig {
  mu: number;
  sigma: number;
  color?: string;
  name?: string;
}

interface NormalCurveProps {
  curves: CurveConfig[];
  setSvgString: (svg: string) => void;
  showLegend?: boolean;
}

const NormalCurve: React.FC<NormalCurveProps> = ({ curves, setSvgString, showLegend }) => {
  const ref = useRef<SVGSVGElement>(null);

  // Defensive: ensure curves is always an array
  const safeCurves = Array.isArray(curves) ? curves : [];

  // Find global min/max for all curves
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = 0;
  safeCurves.forEach(({ mu, sigma }) => {
    minX = Math.min(minX, mu - 4 * sigma);
    maxX = Math.max(maxX, mu + 4 * sigma);
  });
  if (!isFinite(minX) || !isFinite(maxX)) {
    minX = -4;
    maxX = 4;
  }
  const step = (maxX - minX) / N;
  // Find maxY for all curves
  for (let i = 0; i <= N; i++) {
    const x = minX + i * step;
    for (const { mu, sigma } of safeCurves) {
      const y = normalPdf(x, mu, sigma);
      if (y > maxY) maxY = y;
    }
  }

  // Export SVG string for download
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
      {showLegend !== false && (
        <g transform={`translate(${WIDTH - PADDING - 120},${PADDING - 10})`}>
          <rect x={0} y={0} width={150} height={24 + 22 * safeCurves.length} rx={6} fill="transparent" stroke="transparent" strokeWidth={0} />
          {safeCurves.map((curve, idx) => (
            <g key={idx}>
              <rect x={8} y={22 + idx * 22 - 10} width={14} height={14} rx={3} fill={curve.color || '#2563eb'} />
              <text x={28} y={22 + idx * 22} fontSize={12} fill="#333" fontWeight="bold">
                {curve.name ?? ""} {curve.name ? '(' : ''} μ={curve.mu}, σ={curve.sigma} {curve.name ? ')' : ''} 
              </text>
            </g>
          ))}
        </g>
      )}
      {/* Axes */}
      {/* X axis */}
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={WIDTH - (PADDING-OFFSET)} y2={HEIGHT - PADDING} stroke="#888" strokeWidth={2} />
      {/* Y axis */}
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={PADDING+OFFSET} y2={PADDING} stroke="#888" strokeWidth={2} />
      
      {/* X axis ticks and labels */}
      {Array.from({ length: 9 }).map((_, i) => {
        const xVal = minX + (i / 8) * (maxX - minX);
        const px = PADDING + OFFSET + ((xVal - minX) / (maxX - minX)) * (WIDTH - 2 * PADDING);
        return (
          <g key={i}>
            <line x1={px} y1={HEIGHT - PADDING} x2={px} y2={HEIGHT - PADDING + 8} stroke="#888" strokeWidth={1} />
            <text x={px} y={HEIGHT - PADDING + 22} textAnchor="middle" className="fill-gray-500 text-xs">
              {xVal.toFixed(1)}
            </text>
          </g>
        );
      })}
      {/* Y axis ticks and labels */}
      {Array.from({ length: 5 }).map((_, i) => {
        const yVal = (i / 4);
        const fy = (1 - yVal) * (HEIGHT - 2 * PADDING) + PADDING;
        const label = (maxY * yVal).toPrecision(2);
        return (
          <g key={i}>
            <line x1={PADDING + OFFSET - 8} y1={fy} x2={PADDING+ OFFSET} y2={fy} stroke="#888" strokeWidth={1} />
            <text x={PADDING + OFFSET - 12} y={fy + 4} textAnchor="end" className="fill-gray-500 text-xs">
              {label}
            </text>
          </g>
        );
      })}
      {/* Curves */}
      {safeCurves.map(({ mu, sigma, color }, idx) => {
        const points: [number, number][] = [];
        for (let i = 0; i <= N; i++) {
          const x = minX + i * step;
          const y = normalPdf(x, mu, sigma);
          const px = PADDING + OFFSET + ((x - minX) / (maxX - minX)) * (WIDTH - 2 * PADDING);
          const py = HEIGHT - PADDING - (y / maxY) * (HEIGHT - 2 * PADDING);
          points.push([px, py]);
        }
        const pathData = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
        return (
          <path
            key={idx}
            d={pathData}
            fill="none"
            stroke={color || '#2563eb'}
            strokeWidth={3}
          />
        );
      })}
      {/* Mu markers for each curve */}
      {safeCurves.map(({ mu, sigma, color }, idx) => {
        // 计算 mu 处的概率密度对应的 y 坐标
        const px = PADDING + OFFSET + ((mu - minX) / (maxX - minX)) * (WIDTH - 2 * PADDING);
        const yVal = normalPdf(mu, mu, sigma);
        const py = HEIGHT - PADDING - (yVal / maxY) * (HEIGHT - 2 * PADDING);
        return (
          <line
            key={idx}
            x1={px}
            y1={py}
            x2={px}
            y2={HEIGHT - PADDING}
            stroke={color || '#f59e42'}
            strokeDasharray="4 2"
            strokeWidth={2}
          />
        );
      })}
      {/* Labels removed as requested */}
    </svg>
  );
};

export default NormalCurve;

export const CDFCurve: React.FC<{
  curves: CurveConfig[];
  setSvgString: (svg: string) => void;
  showLegend?: boolean;
}> = ({ curves, setSvgString, showLegend }) => {  
  
  const ref = useRef<SVGSVGElement>(null);

  // Defensive: ensure curves is always an array
  const safeCurves = Array.isArray(curves) ? curves : [];

  // Find global min/max for all curves
  let minX = Infinity;
  let maxX = -Infinity;
  safeCurves.forEach(({ mu, sigma }) => {
    minX = Math.min(minX, mu - 4 * sigma);
    maxX = Math.max(maxX, mu + 4 * sigma);
  });
  if (!isFinite(minX) || !isFinite(maxX)) {
    minX = -4;
    maxX = 4;
  }
  const step = (maxX - minX) / N;

  // CDF 曲线
  const cdfCurves = safeCurves.map(({ mu, sigma, color = "#2563eb" }, idx) => {
    const points: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const x = minX + i * step;
      const y = normalCdf(x, mu, sigma);
      const px = PADDING + OFFSET + ((x - minX) / (maxX - minX)) * (WIDTH - 2 * PADDING);
      const py = HEIGHT - PADDING - y * (HEIGHT - 2 * PADDING);
      points.push([px, py]);
    }
    const pathData = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
    return (
      <path
        key={idx}
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={3}
      />
    );
  });

  // Axis
  const axis = (
    <g>
      {/* X axis */}
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={WIDTH - (PADDING-OFFSET)} y2={HEIGHT - PADDING} stroke="#888" strokeWidth={2} />
      {/* Y axis */}
      <line x1={PADDING+OFFSET} y1={HEIGHT - PADDING} x2={PADDING+OFFSET} y2={PADDING} stroke="#888" strokeWidth={2} />
    </g>
  );

  // X axis ticks and labels
  const xLabels = Array.from({ length: 9 }).map((_, i) => {
    const xVal = minX + (i / 8) * (maxX - minX);
    const px = PADDING + OFFSET + ((xVal - minX) / (maxX - minX)) * (WIDTH - 2 * PADDING);
    return (
      <g key={i}>
        <line x1={px} y1={HEIGHT - PADDING} x2={px} y2={HEIGHT - PADDING + 8} stroke="#888" strokeWidth={1} />
        <text x={px} y={HEIGHT - PADDING + 22} textAnchor="middle" className="fill-gray-500 text-xs">
          {xVal.toFixed(1)}
        </text>
      </g>
    );
  });
  // Y axis ticks and labels
  const yLabels = Array.from({ length: 5 }).map((_, i) => {
    const yVal = (i / 4);
    const fy = (1 - yVal) * (HEIGHT - 2 * PADDING) + PADDING;
    const label = yVal.toFixed(2);
    return (
      <g key={i}>
        <line x1={PADDING + OFFSET - 8} y1={fy} x2={PADDING+ OFFSET} y2={fy} stroke="#888" strokeWidth={1} />
        <text x={PADDING + OFFSET - 12} y={fy + 4} textAnchor="end" className="fill-gray-500 text-xs">
          {label}
        </text>
      </g>
    );
  });

  // Legend
  const legend = (
    <g transform={`translate(${20},${100})`}>
      {safeCurves.map((curve, idx) => (
        <g key={idx}>
          <rect x={WIDTH - PADDING - 120} y={PADDING + idx * 22} width={16} height={16} fill={curve.color || "#2563eb"} rx={3} />
          <text x={WIDTH - PADDING - 98} y={PADDING + idx * 22 + 13} fontSize={13} fill="#333" fontWeight="bold">
            {curve.name ?? ""} {curve.name ? '(' : ''} μ={curve.mu}, σ={curve.sigma} {curve.name ? ')' : ''} 
          </text>
        </g>
      ))}
    </g>
  );

    // Export SVG string for download
    useEffect(() => {
        if (ref.current) {
        setSvgString(ref.current.outerHTML);
        }
    }, [curves, setSvgString]);

  return (
    <svg ref={ref} width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto bg-gray-100 rounded shadow mx-auto block" 
        xmlns="http://www.w3.org/2000/svg">
      {axis}
      {cdfCurves}
      {xLabels}
      {yLabels}
      {showLegend && legend}
    </svg>
  );
};
