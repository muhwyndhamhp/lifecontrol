/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'lifecontrol',
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
            {
              name: 'ISSUER_URL',
              secretName:
                $app.stage === 'production'
                  ? 'ISSUER_URL_PRODUCTION'
                  : 'ISSUER_URL_STAGING',
              storeId: '115b6e7cab0c47cfb5fb4e07cba3e93e',
              type: 'secrets_store_secret',
            },
            {
              name: 'CEREBRAS_SECRET',
              secretName: 'CEREBRAS_SECRET',
              storeId: '115b6e7cab0c47cfb5fb4e07cba3e93e',
              type: 'secrets_store_secret',
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
