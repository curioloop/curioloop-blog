
import Preview from "../../Preview";
import ExponentialDistribution from "./ExponentialDistribution";

export const metadata = {
  title: "Exponential Distribution Visualizer",
  description: "Interactive online tool to visualize and compare exponential distributions. Adjust lambda, add multiple curves, and export SVG/PNG. Use it online for instant probability curve analysis.",
};


export default function ExponentialDistributionPage() {
  return (
    <Preview>
      <ExponentialDistribution />
    </Preview>
  );
}
