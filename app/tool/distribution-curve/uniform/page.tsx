import UniformDiscreteDistribution from "./UniformDistribution";

export const metadata = {
  title: "Discrete Uniform Distribution Visualizer",
  description: "Interactive online tool to visualize and compare discrete uniform distributions. Adjust a and b, add multiple curves, and export SVG/PNG. Use it online for instant probability curve analysis.",
};

export default function UniformDiscreteDistributionPage() {
  return <UniformDiscreteDistribution />;
}
