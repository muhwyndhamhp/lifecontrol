/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'lifecontrol',
      home: 'cloudflare',
    };
  },
  async run() {
    const secrets = [new sst.Secret('IssuerUrl')];

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
        },
      },
    });

    return {
      api: hono.url,
    };
  },
});
