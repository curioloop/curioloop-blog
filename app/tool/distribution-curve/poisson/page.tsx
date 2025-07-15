import PoissonDistribution from "./PoissonDistribution";

export const metadata = {
  title: "Poisson Distribution Visualizer",
  description: "Interactive online tool to visualize and compare Poisson distributions. Adjust lambda, add multiple curves, and export SVG/PNG. Use it online for instant probability curve analysis.",
};

export default function PoissonDistributionPage() {
  return <PoissonDistribution />;
}
