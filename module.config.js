module.exports = {
  localModules: [
    {
      moduleName: "@edx/frontend-lib-content-components/dist",
      dir: "./frontend-lib-test",
      dist: "src",
    },
    {
      moduleName: "@edx/frontend-lib-content-components",
      dir: "./frontend-lib-test",
      dist: "src",
    },
  ],
};
