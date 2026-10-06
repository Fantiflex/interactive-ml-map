

export type ConceptKind =
  | "concept"
  | "algorithm"
  | "mechanism"
  | "math";

export type Concept = {
  title: string;
  category: string;
  kind: ConceptKind;
  short: string;
  intuition: string;
  prerequisites?: string[];
};

export const concepts: Record<string, Concept> = {
    optimization: {
    title: "Optimization",
    category: "Optimization",
    kind: "concept",
    short: "Find parameters that reduce an objective.",
    intuition:
        "Optimization is the general problem of adjusting model parameters to minimize a loss.",
    },

    gd: {
    title: "Gradient Descent",
    category: "Optimization",
    kind: "algorithm",
    short: "Follow the negative gradient.",
    intuition:
        "Gradient Descent is an optimization algorithm that updates parameters using the full gradient.",
    },

    sgd: {
    title: "SGD",
    category: "Optimization",
    kind: "algorithm",
    short: "Use stochastic mini-batch gradients.",
    intuition:
        "SGD is an optimization algorithm that approximates the full gradient using mini-batches.",
    },

    momentum: {
    title: "Momentum",
    category: "Optimization",
    kind: "mechanism",
    short: "Add memory to the update.",
    intuition:
        "Momentum is a mechanism that accumulates previous update directions to reduce oscillation and accelerate consistent movement.",
    },

    rmsprop: {
    title: "RMSProp",
    category: "Optimization",
    kind: "algorithm",
    short: "Adapt step sizes using squared gradients.",
    intuition:
        "RMSProp is an adaptive optimization algorithm that rescales updates using a moving average of squared gradients.",
    },

    adam: {
    title: "Adam",
    category: "Optimization",
    kind: "algorithm",
    short: "Combine momentum-like and adaptive updates.",
    intuition:
        "Adam is an optimization algorithm combining momentum-like first-moment estimates with RMSProp-like second-moment scaling.",
    },
};