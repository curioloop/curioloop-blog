
import Preview from "../../Preview";
import NormallDistribution from "./NormallDistribution";

export const metadata = {
  title: "Normal Distribution Visualizer",
  description: "Interactive online tool to visualize and compare normal distributions. Adjust mu and sigma, add multiple curves, and export SVG/PNG. Use it online for instant probability curve analysis.",
};


export default function NormallDistributionPage() {
  return (
    <Preview>
      <NormallDistribution />
    </Preview>
  );
}
