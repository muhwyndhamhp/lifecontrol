/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "lifecontrol",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
    };
  },
  async run() {
    const hono = new sst.cloudflare.Worker('PetaKopi', {
      url: true,
      handler: './server/src/index.ts',
      assets: {
        directory: './dist',
      },
    });

    return {
      api: hono.url,
    };

  },
});
