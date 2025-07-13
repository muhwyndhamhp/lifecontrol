export function migrate(sql: SqlStorage) {
// language=SQL format=false
  sql.exec(`
      create table if not exists migrations (
        id integer primary key autoincrement,
        name text not null unique,
        applied_at datetime default current_timestamp
      );
    `);

  const applied = new Set();
  for (const row of sql.exec('select name from migrations')) {
    applied.add(row.name);
  }

  for (const migration of migrations) {
    if (!applied.has(migration.name)) {
      sql.exec(migration.sql);
      sql.exec('insert into migrations (name) values (?)', migration.name);
    }
  }
}

// language=SQL format=false
const migrations = [
  {
    name: '001_create_event_table',
    // language=SQL format=false
    sql: `
    CREATE TABLE IF NOT EXISTS "calendar_events" (
      "id" text not null primary key,
      "date" datetime default current_timestamp
      "name" text not null default 'Calendar Event'
    )
    `,
  },
];
