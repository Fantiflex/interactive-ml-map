import { optimizationConcepts } from "./optimizationHierarchy";



export type ConceptKind =
  | "concept"
  | "optimizer"
  | "mechanism"
  | "math"
  | "algorithm";


export type Concept = {
  title: string;
  category: string;
  kind: ConceptKind;

  short: string;
  intuition: string;
  prerequisites?: string[];
  advantages?: string[];
  disadvantages?: string[];
  parameters?: string[];
  updates?: string[];

  uses?: string[];

  animation?: "momentum" | "gd" | "rmsprop" | "adam";
};

export const concepts: Record<string, Concept> = {
  ml: {
    title: "Machine Learning",
    category: "Overview",
    kind: "concept",
    short: "Learn patterns from data.",
    intuition:
      "Machine learning uses data to learn models that can make predictions or decisions.",
  },

  optimization: {
    title: "Optimization",
    category: "Optimization",
    kind: "concept",
    short: "Find parameters that minimize an objective.",
    intuition:
      "Optimization is the general problem of adjusting model parameters to reduce an objective function.",
  },

  generalization: {
    title: "Generalization",
    category: "Generalization",
    kind: "concept",
    short: "Perform well on unseen data.",
    intuition:
      "Generalization describes how well a trained model performs on data it did not see during training.",
  },

  // ------------------------------------------------------------------
  // MECHANISMS
  // ------------------------------------------------------------------

  gradient: {
    title: "Gradient",
    category: "Optimization",
    kind: "math",
    short: "Local direction of steepest increase.",
    intuition:
      "The gradient tells us how the objective changes locally with respect to each parameter.",
  },

  momentum: {
    title: "Momentum",
    category: "Optimization",
    kind: "mechanism",
    short: "Add memory to parameter updates.",
    intuition:
      "Momentum accumulates information from previous gradients or updates to reduce oscillation and accelerate movement in persistent directions.",
    animation: "momentum",
  },

  "adaptive-scaling": {
    title: "Adaptive Scaling",
    category: "Optimization",
    kind: "mechanism",
    short: "Use different effective step sizes across parameters.",
    intuition:
      "Adaptive scaling changes the magnitude of parameter updates based on recent gradient statistics.",
  },

  "weight-decay": {
    title: "Weight Decay",
    category: "Optimization",
    kind: "mechanism",
    short: "Shrink parameters during optimization.",
    intuition:
      "Weight decay directly shrinks parameters during training and can provide regularization.",
  },

  orthogonalization: {
    title: "Orthogonalization",
    category: "Optimization",
    kind: "mechanism",
    short: "Transform matrix updates toward orthogonal structure.",
    intuition:
      "Orthogonalization modifies matrix-valued updates so that their singular directions are more evenly scaled.",
  },

  // ------------------------------------------------------------------
  // OPTIMIZERS
  // ------------------------------------------------------------------

  gd: {
    title: "Gradient Descent",
    category: "Optimization",
    kind: "optimizer",

    short: "Update parameters using the full gradient.",

    intuition:
        "Gradient Descent moves parameters in the direction opposite to the gradient of the objective.",

    advantages: [
        "Simple and easy to interpret",
        "Deterministic when using the full dataset",
    ],

    disadvantages: [
        "Computing the full gradient can be expensive",
        "Can be slow in poorly conditioned landscapes",
    ],

    parameters: [
        "Learning rate η",
    ],

    updates: [
        "g_t = \\nabla L(\\theta_t)",
        "\\theta_{t+1} = \\theta_t - \\eta g_t",
    ],

    uses: ["gradient"],
    },

  rmsprop: {
    title: "RMSProp",
    category: "Optimization",
    kind: "optimizer",

    short: "Adapt updates using squared-gradient statistics.",

    intuition:
        "RMSProp keeps an exponential moving average of squared gradients and uses it to rescale updates.",

    parameters: [
        "Learning rate η",
        "Decay β",
        "Numerical stability ε",
    ],

    updates: [
        "g_t = \\nabla L(\\theta_t)",
        "v_t = \\beta v_{t-1} + (1-\\beta)g_t^2",
        "\\theta_{t+1} = \\theta_t - \\eta \\frac{g_t}{\\sqrt{v_t}+\\epsilon}",
    ],

    uses: ["gradient", "adaptive-scaling"],
    },

  adam: {
    title: "Adam",
    category: "Optimization",
    kind: "optimizer",

    short: "Momentum-like updates + adaptive scaling.",

    intuition:
        "Adam maintains moving averages of both gradients and squared gradients.",

    parameters: [
        "Learning rate η",
        "β₁",
        "β₂",
        "Numerical stability ε",
    ],

    updates: [
        "g_t = \\nabla L(\\theta_t)",
        "m_t = \\beta_1 m_{t-1} + (1-\\beta_1)g_t",
        "v_t = \\beta_2 v_{t-1} + (1-\\beta_2)g_t^2",
        "\\hat{m}_t = \\frac{m_t}{1-\\beta_1^t}",
        "\\hat{v}_t = \\frac{v_t}{1-\\beta_2^t}",
        "\\theta_{t+1} = \\theta_t - \\eta \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t}+\\epsilon}",
    ],

    uses: ["gradient", "momentum", "adaptive-scaling"],
    },

  adamw: {
    title: "AdamW",
    category: "Optimization",
    kind: "optimizer",

    short: "Adam with decoupled weight decay.",

    intuition:
      "AdamW separates weight decay from Adam's adaptive gradient update instead of treating it as an L2 penalty inside the gradient.",

    advantages: [
      "Decouples optimization from weight decay",
      "Widely used for modern neural-network training",
      "Weight decay behavior is easier to reason about than Adam + L2",
    ],

    disadvantages: [
      "Requires tuning weight decay",
      "Keeps Adam's additional optimizer state",
      "Still has several hyperparameters",
    ],

    parameters: [
      "Learning rate η",
      "β₁",
      "β₂",
      "Numerical stability ε",
      "Weight decay λ",
    ],

    updates: [
      "θₜ₊₁ = AdamUpdate(θₜ) − ηλθₜ",
    ],

    uses: [
      "gradient",
      "momentum",
      "adaptive-scaling",
      "weight-decay",
    ],
  },

  muon: {
    title: "MuOn",
    category: "Optimization",
    kind: "optimizer",

    short: "Momentum + matrix update orthogonalization.",

    intuition:
      "MuOn forms momentum-based updates for matrix-valued parameters and applies an orthogonalization procedure before updating the weights.",

    advantages: [
      "Exploits matrix structure",
      "Controls update geometry through orthogonalization",
      "Designed for efficient neural-network training",
    ],

    disadvantages: [
      "Not naturally applied to every type of parameter",
      "Requires an orthogonalization procedure",
      "Optimizer grouping is more involved than with AdamW",
    ],

    parameters: [
      "Learning rate",
      "Momentum coefficient",
      "Orthogonalization settings",
    ],

    uses: ["gradient", "momentum", "orthogonalization"],
  },
};

for (const [id, definition] of Object.entries(optimizationConcepts)) {
  concepts[id] = {
    ...concepts[id],
    ...definition,
  };
}