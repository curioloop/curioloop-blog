import Preview from "../Preview";
import CLTVisualizer from "./CLTVisualizer";

export const metadata = {
  title: "Central Limit Theorem Visualizer",
  description: "Interactive online CLT visualizer: sample from various distributions, see sample means, histograms, and export SVG/PNG. Supports multi-curve and parameter editing. Use it online for instant probability/statistics education.",
};

export default function CLTVisualizerPage() {
  return (
    <Preview>
      <CLTVisualizer />
    </Preview>
  );
}
