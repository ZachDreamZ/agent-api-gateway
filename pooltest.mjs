import pg from 'pg';
const pw = 'XM2KgtsbNY7qOGnb';
const proj = 'roaftjpifewtalcsrjmb';
const host = 'aws-0-us-west-1.pooler.supabase.com';
// sslmode=require + rejectUnauthorized=false in Client config
const url = `postgresql://postgres.${proj}:${pw}@${host}:6543/postgres?sslmode=require&pgbouncer=true`;
const cl = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
try {
  await cl.connect();
  const r = await cl.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
  const tbl = r.rows.map(x=>x.table_name).join(', ') || '(none)';
  console.log('OK tables:', tbl);
  // Check if user table exists (Better Auth)
  const ur = await cl.query("select exists(select 1 from information_schema.tables where table_name='user' and table_schema='public')");
  console.log('user table exists:', ur.rows[0].exists);
  await cl.end();
} catch (e) {
  console.log('ERR', e.code||e.message.slice(0,120));
}
