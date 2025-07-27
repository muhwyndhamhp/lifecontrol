import { SqlServer } from '@queries/durableObject';

export interface Env {
  ASSETS: Fetcher;
  SQL_SERVER: DurableObjectNamespace<SqlServer>;
  ISSUER_URL: SecretsStoreSecret;
  CEREBRAS_SECRET: SecretsStoreSecret;
  AUTH_DB_CREDS: SecretsStoreSecret;
  MASTER_SECRET_KEY: SecretsStoreSecret;
}
