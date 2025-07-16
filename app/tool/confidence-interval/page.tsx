import ConfidenceInterval from "./ConfidenceInterval";

export const metadata = {
  title: "Confidence Interval Visualizer",
  description: "Interactive online tool to visualize confidence intervals, sample means, and coverage probability for the normal distribution. Adjust confidence level, sample size, and number of samples to explore statistical concepts visually.",
};

export default function ConfidenceIntervalPage() {
  return <ConfidenceInterval/>;
}
