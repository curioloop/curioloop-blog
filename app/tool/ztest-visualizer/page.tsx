
import Preview from "../Preview";
import ZTestVisualizer from "./ZTestVisualizer";

export const metadata = {
  title: "Z-Test Visualizer",
  description: "Interactive online tool to visualize Z-test hypothesis testing, critical regions, p-values, and the effect of parameters on the normal distribution. Supports left, right, and two-tailed tests.",
};


export default function ZTestVisualizerPage() {
  return (
    <Preview>
      <ZTestVisualizer />
    </Preview>
  );
}
