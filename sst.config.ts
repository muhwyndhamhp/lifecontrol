/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'lifecontrol',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'cloudflare',
    };
  },
  async run() {
    const hono = new sst.cloudflare.Worker('LifeControl', {
      url: true,
      handler: './server/src/index.ts',
      assets: {
        directory: './dist',
      },
      transform: {
        worker: (args) => {
          if (!args.bindings) {
            return;
          }

          if (!!args.observability)
            args.observability =
              $resolve(args.observability)
                .apply((observe) => ({ ...observe, enabled: true }));

          args.bindings = $resolve(args.bindings).apply((bindings) => [
            ...bindings,
            {
              name: 'SQL_SERVER',
              type: 'durable_object_namespace',
              className: 'SqlServer',
            },
          ]);

          // args.migrations = {
          //   oldTag: $app.stage === "production" ? "" : "",
          //   newTag: $app.stage === "production" ? "" : "v1",
          //   newSqliteClasses: ["SqlServer"],
          // }
        },
      },
    });

    return {
      api: hono.url,
    };
  },
});
