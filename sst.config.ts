/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'lifecontrol',
      home: 'cloudflare',
    };
  },
  async run() {
    const secrets = [new sst.Secret('IssuerUrl'), new sst.Secret('CerebrasSecret')];

    const hono = new sst.cloudflare.Worker('LifeControl', {
      url: true,
      link: [...secrets],
      handler: './server/src/index.ts',
      assets: {
        directory: './dist',
      },
      environment: {
        LOG_LEVEL: 'DEBUG',
      },
      domain:
        $app.stage === 'production' ? 'lifecontrol.mwyndham.dev' : undefined,
      transform: {
        worker: (args) => {
          if (!args.bindings) {
            return;
          }

          if (!!args.observability)
            args.observability = $resolve(args.observability).apply(
              (observe) => ({ ...observe, enabled: true })
            );

          args.bindings = $resolve(args.bindings).apply((bindings) => [
            ...bindings,
            {
              name: 'SQL_SERVER',
              type: 'durable_object_namespace',
              className: 'SqlServer',
            },
          ]);

          // args.migrations = {
          //   oldTag: $app.stage === 'production' ? '' : '',
          //   newTag: $app.stage === 'production' ? '' : 'v1',
          //   newSqliteClasses: ["SqlServer"]
          // }
        },
      },
    });

    return {
      api: hono.url,
    };
  },
});
