import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

function request(secret, message) {
  return new Request('https://example.org/webhook', {
    method: 'POST',
    headers: {'X-Telegram-Bot-Api-Secret-Token': secret},
    body: JSON.stringify({update_id: 42, message})
  });
}

test('unauthorized webhook never reaches storage', async () => {
  const response = await worker.fetch(request('unknown', {}), {WEBHOOK_SECRET:'test-secret'});
  assert.equal(response.status, 403);
});

test('private messages from another account are ignored before storage', async () => {
  const other = {chat:{id:21,type:'private'}, from:{id:21}, text:'/start'};
  const response = await worker.fetch(request('test-secret', other), {WEBHOOK_SECRET:'test-secret', OWNER_ID:'10'});
  assert.equal(response.status, 200);
});

test('clear removes history only and replies to the owner', async t => {
  const statements = [];
  let outgoing;
  t.mock.method(globalThis,'fetch',async (_,options) => {
    outgoing = JSON.parse(options.body);
    return Response.json({ok:true,result:{}});
  });
  const DB = {prepare(sql) {
    statements.push(sql);
    return {bind(){return this}, async run(){return {meta:{changes:1}}}};
  }};
  let pending;
  const owner = {chat:{id:10,type:'private'}, from:{id:10}, text:'/clear'};
  await worker.fetch(request('test-secret',owner),{WEBHOOK_SECRET:'test-secret',OWNER_ID:'10',DB},{waitUntil(p){pending=p}});
  await pending;
  assert.deepEqual(statements.filter(s=>s.startsWith('DELETE')),["DELETE FROM state WHERE id='history'"]);
  assert.equal(outgoing.chat_id,'10');
});
