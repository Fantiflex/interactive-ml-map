import type { Concept } from "./concepts";

// Merge these descriptions into the existing dictionary; keep equations,
// animations and other fields already present in concepts.ts.
export const optimizationConcepts: Record<string, Concept> = {
  ml: { title: "Machine Learning", category: "Overview", kind: "concept", short: "Learn patterns from data.", intuition: "Machine learning fits models to data and evaluates how well they generalize." },
  generalization: { title: "Generalization", category: "Generalization", kind: "concept", short: "Perform well on unseen data.", intuition: "Generalization measures how well a learned model performs beyond its training examples." },
  optimization: { title: "Optimization", category: "Optimization", kind: "concept", short: "Find parameters that reduce a loss.", intuition: "Optimization connects an objective, its derivatives, and an update rule for the model parameters." },
  loss: { title: "Loss Function", category: "Optimization", kind: "math", short: "Define the objective to minimize.", intuition: "A loss maps model parameters to a scalar objective. Its geometry shapes the optimization trajectory.", prerequisites: ["optimization"] },
  gradient: { title: "Gradient", category: "Optimization", kind: "math", short: "Measure the local slope.", intuition: "The gradient collects the partial derivatives of the loss. Its negative gives the steepest local descent direction in Euclidean coordinates.", prerequisites: ["loss"] },
  learning_rate: { title: "Learning Rate", category: "Optimization", kind: "concept", short: "Control the update scale.", intuition: "The learning rate scales an optimizer's proposed update. Too large a rate can cause oscillation or divergence.", prerequisites: ["gradient"] },
  gradient_estimation: { title: "Gradient Estimation", category: "Optimization", kind: "concept", short: "Full dataset or sampled examples.", intuition: "A full gradient uses the entire training objective. A stochastic estimate uses sampled examples or a mini-batch, trading exactness for cheaper updates.", prerequisites: ["gradient"] },
  momentum: { title: "Momentum", category: "Optimization", kind: "mechanism", short: "Remember previous directions.", intuition: "Momentum maintains a running gradient history. Directions that persist accumulate, while alternating components can partially cancel.", prerequisites: ["gradient"] },
  adaptive_scaling: {
    title: "Adaptive Scaling",
    category: "Optimization",
    kind: "mechanism",
    short: "Rescale each coordinate.",
    intuition:
      "Track the recent magnitude of each gradient coordinate. Coordinates with larger squared-gradient history receive a smaller scaling factor; those with smaller history receive a larger one.",

    prerequisites: ["gradient", "learning_rate"],

    updates: [
      // 1. Compute the current gradient.
      String.raw`g_t = \nabla L(\theta_{t-1})`,

      // 2. Square each coordinate independently.
      String.raw`g_t^{\odot 2}
        = \begin{bmatrix}
            g_{t,1}^{2} \\
            \vdots \\
            g_{t,d}^{2}
          \end{bmatrix}`,

      // 3. Track squared-gradient history.
      String.raw`v_0 = 0,\qquad
        v_t = \beta v_{t-1} + (1-\beta)g_t^{\odot 2},
        \qquad 0 \leq \beta < 1`,

      // 4. Build a separate scaling factor for each coordinate.
      String.raw`s_{t,i}
        = \frac{1}{\sqrt{v_{t,i}}+\varepsilon},
        \qquad \varepsilon > 0`,

      // 5. Apply the scaling to the gradient.
      String.raw`\widetilde{g}_{t,i}
        = s_{t,i}g_{t,i}
        = \frac{g_{t,i}}{\sqrt{v_{t,i}}+\varepsilon}`,

      // 6. Use the scaled gradient in an RMSProp-style update.
      String.raw`\theta_{t,i}
        = \theta_{t-1,i}
        - \eta\widetilde{g}_{t,i}`,

      // 7. Compare two coordinates.
      String.raw`v_{t,i} > v_{t,j}
        \quad\Longrightarrow\quad
        s_{t,i} < s_{t,j}`,
    ],
  }, 
  bias_correction: { title: "Bias Correction", category: "Optimization", kind: "mechanism", short: "Correct zero-initialized averages.", intuition: "An exponential moving average initialized at zero is initially biased toward zero. Adam compensates using factors involving one minus the decay coefficient raised to the step count.", prerequisites: ["momentum", "adaptive_scaling"] },
  weight_decay: { title: "Decoupled Weight Decay", category: "Optimization", kind: "mechanism", short: "Shrink parameters separately.", intuition: "Decoupled weight decay contracts the parameters independently of the gradient transformation. AdamW applies it separately from the adaptive update.", prerequisites: ["learning_rate"] },
  orthogonalization: { title: "Update Orthogonalization", category: "Optimization", kind: "mechanism", short: "Reshape a matrix update.", intuition: "A polar-factor transformation reshapes a matrix update's singular values. Muon uses a finite Newton–Schulz approximation; its output is not generally an exactly orthogonal matrix.", prerequisites: ["momentum"] },
  gd: { title: "Gradient Descent", category: "Optimization", kind: "algorithm", short: "Use the full gradient.", intuition: "Classic gradient descent updates parameters along the negative full gradient with a learning rate, without momentum or adaptive scaling.", prerequisites: ["gradient_estimation", "learning_rate"] },
  sgd: { title: "SGD", category: "Optimization", kind: "algorithm", short: "Use a stochastic gradient.", intuition: "Basic stochastic gradient descent uses a gradient estimate from sampled examples or a mini-batch. Momentum is an optional extension.", prerequisites: ["gradient_estimation", "learning_rate"] },
  rmsprop: { title: "RMSProp", category: "Optimization", kind: "algorithm", short: "Scale using squared-gradient history.", intuition: "Basic RMSProp divides the gradient by the square root of an exponential average of squared gradients plus a stability term. It is an optimizer that implements adaptive scaling.", prerequisites: ["gradient_estimation", "adaptive_scaling"] },
  adam: { title: "Adam", category: "Optimization", kind: "algorithm", short: "First moment + adaptive scaling.", intuition: "Adam combines a first-moment gradient estimate, second-moment scaling, and bias correction. Its normalization is related to RMSProp, but RMSProp is not literally called inside Adam.", prerequisites: ["momentum", "adaptive_scaling", "bias_correction"] },
  adamw: { title: "AdamW", category: "Optimization", kind: "algorithm", short: "Adam + decoupled weight decay.", intuition: "AdamW uses Adam's gradient transformation and applies weight decay separately to the parameters.", prerequisites: ["adam", "weight_decay"] },
  muon: { title: "Muon", category: "Optimization", kind: "algorithm", short: "Momentum + matrix orthogonalization.", intuition: "Muon builds a matrix update from momentum, optionally with Nesterov mixing, then applies a Newton–Schulz transformation before updating matrix-valued weights.", prerequisites: ["momentum", "orthogonalization"] },
};

export const hierarchyPositions = [
  { id: "ml", x: 600, y: 0 }, { id: "optimization", x: 400, y: 160 }, { id: "generalization", x: 1250, y: 160 },
  { id: "loss", x: 0, y: 390 }, { id: "gradient", x: 300, y: 390 }, { id: "learning_rate", x: 600, y: 390 }, { id: "gradient_estimation", x: 900, y: 390 },
  { id: "momentum", x: 0, y: 700 }, { id: "adaptive_scaling", x: 300, y: 700 }, { id: "bias_correction", x: 600, y: 700 }, { id: "weight_decay", x: 900, y: 700 }, { id: "orthogonalization", x: 1200, y: 700 },
  { id: "gd", x: 0, y: 1030 }, { id: "sgd", x: 300, y: 1030 }, { id: "rmsprop", x: 600, y: 1030 }, { id: "adam", x: 900, y: 1030 },
  { id: "adamw", x: 900, y: 1320 }, { id: "muon", x: 1200, y: 1320 },
];
export type RelationKind = "structure" | "uses" | "inspired";
export const hierarchyRelations: { source: string; target: string; kind: RelationKind; label: string }[] = [
  { source: "ml", target: "optimization", kind: "structure", label: "includes" },
  { source: "ml", target: "generalization", kind: "structure", label: "includes" },
  { source: "optimization", target: "loss", kind: "structure", label: "requires an objective" },
  { source: "loss", target: "gradient", kind: "structure", label: "differentiate" },
  { source: "gradient", target: "gradient_estimation", kind: "structure", label: "estimate" },
  { source: "gd", target: "gradient_estimation", kind: "uses", label: "uses full gradient" },
  { source: "gd", target: "learning_rate", kind: "uses", label: "uses" },
  { source: "sgd", target: "gradient_estimation", kind: "uses", label: "uses stochastic estimate" },
  { source: "sgd", target: "learning_rate", kind: "uses", label: "uses" },
  { source: "rmsprop", target: "adaptive_scaling", kind: "uses", label: "uses" },
  { source: "adam", target: "momentum", kind: "uses", label: "uses" },
  { source: "adam", target: "adaptive_scaling", kind: "uses", label: "uses" },
  { source: "adam", target: "bias_correction", kind: "uses", label: "uses" },
  { source: "adam", target: "rmsprop", kind: "inspired", label: "inspired by" },
  { source: "adamw", target: "adam", kind: "uses", label: "uses Adam update" },
  { source: "adamw", target: "weight_decay", kind: "uses", label: "uses" },
  { source: "muon", target: "momentum", kind: "uses", label: "uses" },
  { source: "muon", target: "orthogonalization", kind: "uses", label: "uses" },
];
