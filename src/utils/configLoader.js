const config = {};

export default config;

function load() {
  return fetch("./../config.json", {
    headers: {
      "content-Type": "application/json",
      accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((newConfig) => {
      for (let prop in config) {
        delete config[prop];
      }
      for (let prop in newConfig) {
        config[prop] = newConfig[prop];
      }
      return config;
    });
}

export { load };
