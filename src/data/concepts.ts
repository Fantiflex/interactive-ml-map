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
};