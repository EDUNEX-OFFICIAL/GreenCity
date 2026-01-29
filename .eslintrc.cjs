module.exports = {
  root: true,
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["apps/backend/*"],
            message: "Frontend cannot import backend code"
          },
          {
            group: ["apps/frontend/*"],
            message: "Backend cannot import frontend code"
          }
        ]
      }
    ]
  }
};
