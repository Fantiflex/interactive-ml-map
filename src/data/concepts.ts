export type Concept = {
  title: string;
  category: string;
  short: string;
  intuition: string;
};

export const concepts: Record<string, Concept> = {
  ml: {
    title: "Machine Learning",
    category: "Overview",
    short: "Learn patterns from data to make predictions or decisions.",
    intuition:
      "Machine learning connects a real-world objective to a model, a loss, and an optimization procedure.",
  },

  optimization: {
    title: "Optimization",
    category: "Training",
    short: "Update model parameters to reduce the loss.",
    intuition:
      "Optimization determines how the model changes its parameters during training.",
  },

  generalization: {
    title: "Generalization",
    category: "Training",
    short: "Perform well on unseen data.",
    intuition:
      "A model should not only fit the training set, but also work well on new examples.",
  },

  gd: {
    title: "Gradient Descent",
    category: "Optimization",
    short: "Move parameters in the opposite direction of the gradient.",
    intuition:
      "Gradient descent uses the full dataset to compute a direction that reduces the loss.",
  },

  sgd: {
    title: "SGD",
    category: "Optimization",
    short: "Estimate the gradient using a mini-batch.",
    intuition:
      "Instead of computing the gradient over the full dataset, SGD uses a smaller random batch, making updates cheaper but noisier.",
  },

  momentum: {
    title: "Momentum",
    category: "Optimization",
    short: "Gradient descent with inertia.",
    intuition:
      "Momentum keeps memory of previous update directions, which can reduce oscillation and accelerate movement in consistent directions.",
  },

  rmsprop: {
    title: "RMSProp",
    category: "Optimization",
    short: "Adapt the step size using recent squared gradients.",
    intuition:
      "RMSProp rescales updates coordinate-wise using a moving average of squared gradients.",
  },

  adam: {
    title: "Adam",
    category: "Optimization",
    short: "Combine momentum and adaptive scaling.",
    intuition:
      "Adam combines a moving average of gradients with a moving average of squared gradients.",
  },
};