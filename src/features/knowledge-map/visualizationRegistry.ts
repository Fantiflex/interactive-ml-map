import type { ComponentType } from "react";

import AdamVisualization from "../optimization/visualizations/AdamVisualization";
import GradientDescentVisualization from "../optimization/visualizations/GradientDescentVisualization";
import OrthogonalizationDemo from "../optimization/visualizations/OrthogonalizationDemo";

export type VisualizationProps = {
  onClose: () => void;
};

export const visualizationRegistry: Partial<
  Record<string, ComponentType<VisualizationProps>>
> = {
  adam: AdamVisualization,
  gd: GradientDescentVisualization,
  gradient_descent: GradientDescentVisualization,
  orthogonalization: OrthogonalizationDemo,
};