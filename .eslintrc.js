module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "airbnb",
  overrides: [
    {
      files: ["*.js"],
      rules: {
        camelcase: ["error", {
          properties: "never",
          allow: ["user_id", "chat_id", "message_id", "first_name", "last_name", "session_token"], // Add "chat_id" to the "allow" array
        }],
      },
    },
    {
      files: ["*.js"],
      rules: {
        "react/jsx-one-expression-per-line": ["off"],
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    camelcase: "off",
    "react/jsx-filename-extension": ["error", { extensions: [".js"] }],
    "linebreak-style": ["error", "windows"],
  },
};
