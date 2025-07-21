export function migrate(sql: SqlStorage) {
  console.log('*** Starting Migration');
  // language=SQL format=false
  sql.exec(`
      create table if not exists "migrations" (
        id integer primary key autoincrement,
        name text not null unique,
        applied_at datetime default current_timestamp
      );
    `);

  const result = sql.exec('SELECT COUNT(*) as count FROM migrations').one();

  const latestName =
    Number(result['count']) > 0
      ? sql.exec('select name from migrations order by id desc limit 1').one()
        .name
      : '';

  if (latestName === migrations[migrations.length - 1]?.name) {
    console.log('*** All migrations already applied, skipping...');
    return;
  }

  let startIndex = 0;
  if (latestName) {
    const idx = migrations.findIndex((m) => m.name === latestName);
    if (idx !== -1) {
      startIndex = idx + 1; // start after the last applied
    }
  }

  for (let i = startIndex; i < migrations.length; i++) {
    const migration = migrations[i];
    console.log('*** Executing Migration:', migration.name);
    sql.exec(migration.sql);
    sql.exec('INSERT INTO migrations (name) VALUES (?)', migration.name);
  }
}

// language=SQL format=false
const migrations = [
  {
    name: '001_create_event_table',
    // language=SQL format=false
    sql: `
    create table if not exists "calendar_events" (
      "id" text not null primary key,
      "date" datetime default current_timestamp,
      "name" text not null default 'Calendar Event'
    );
    `,
  },
  {
    name: `002_add_duration_and_color`,
    // language=SQL format=false
    sql: `
    alter table "calendar_events" add column "duration" integer not null default 60;
    alter table "calendar_events" add column "color" text not null default 'mauve';
    `,
  },
  {
    name: `003_add_deleted_at`,
    sql: `
    alter table "calendar_events" add column "deleted_at" datetime;
    `,
  },
  {
    name: `004_add_description`,
    sql: `alter table "calendar_events" add column "description" text;`,
  },
  {
    name: `005_migrate_date_to_unix_timestamp`,
    sql: `
      alter table "calendar_events" add column "date_unix" integer not null default 0;
      update "calendar_events" set date_unix = strftime('%s', date);
    `,
  },
  {
    name: `006_add_user_table`,
    sql: `
    create table if not exists "calendar_users" (
      id integer primary key autoincrement,
      name text not null,
      email text not null,
      githubOauthId text,
      googleOauthId text
    )
    `,
  },
  {
    name: `007_drop_user_table`,
    sql: `
    drop table if exists "calendar_users";
    `,
  },
  {
    name: `008_add_user_id`,
    sql: `
    alter table "calendar_events" add column "user_id" integer;
    update "calendar_events" set user_id = 1;
    `,
  },
  {
    name: `009_add_validation_cache`,
    sql: `
    create table if not exists "validation_cache" (
      access text not null primary key,
      refresh text,
      user_id integer not null,
      oauth_id text not null,
      email text not null,
      expiry_timestamp integer not null
    )
    `,
  },
];
