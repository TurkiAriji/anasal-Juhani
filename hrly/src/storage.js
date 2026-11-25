// All messages for this personal bot are handled by one Durable Object.
export class PersonalBot {
  constructor(ctx, env) {
    this.ctx = ctx;
    const sql = ctx.storage.sql;
    sql.exec('CREATE TABLE IF NOT EXISTS state(id TEXT PRIMARY KEY,value TEXT NOT NULL,updated INTEGER NOT NULL)');
    sql.exec('CREATE TABLE IF NOT EXISTS updates(id INTEGER PRIMARY KEY,created INTEGER NOT NULL)');
    sql.exec('CREATE TABLE IF NOT EXISTS usage(day TEXT PRIMARY KEY,calls INTEGER NOT NULL)');
    // Existing parameterized queries use the same SQLite engine as before.
    const prepare = (query, args = []) => ({
      bind: (...values) => prepare(query, values),
      first: () => sql.exec(query, ...args).toArray()[0] ?? null,
      run: () => ({meta: {changes: sql.exec(query, ...args).rowsWritten}})
    });
    this.env = {...env, DB: {prepare}};
  }
  async fetch(request) {
    const {default: bot} = await import('./worker.js');
    if (request.url === 'https://internal/digest') {
      await this.digest();
      return new Response('ok');
    }
    return bot.fetch(request, this.env, this.ctx);
  }
  async digest() {
    const {default: bot} = await import('./worker.js');
    await new Promise((resolve, reject) => bot.scheduled({}, this.env, {
      waitUntil: task => task.then(resolve, reject)
    }));
  }
}
