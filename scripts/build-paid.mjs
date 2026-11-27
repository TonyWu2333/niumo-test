// 生成付费解读的加密文件 paid.enc.json。
// 明文在 private/paid.json，会员码在 private/codes.txt（这两个文件都不进 git）。
// 用法：node scripts/build-paid.mjs
// codes.txt 不存在时会自动生成 10 个会员码；已有的会员码不会变，改完解读重新跑一次即可。
import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const P = (f) => path.join(root, f);
const ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // 去掉了 I L O U，避免看错
const ITER = 300000;

const norm = (s) => s.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1').replace(/[^0-9A-Z]/g, '');
const b64 = (u8) => Buffer.from(u8).toString('base64');

function newCode() {
  const r = crypto.getRandomValues(new Uint8Array(12));
  const s = Array.from(r, (b) => ALPHA[b & 31]).join('');
  return s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8);
}

if (!fs.existsSync(P('private/codes.txt'))) {
  const codes = Array.from({ length: 10 }, newCode);
  fs.writeFileSync(P('private/codes.txt'), codes.join('\n') + '\n');
  console.log('生成了 10 个会员码：private/codes.txt');
}
const codes = fs.readFileSync(P('private/codes.txt'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const content = JSON.parse(fs.readFileSync(P('private/paid.json'), 'utf8'));

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const rawKey = crypto.getRandomValues(new Uint8Array(32));
const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
const iv = crypto.getRandomValues(new Uint8Array(12));
const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(content))));

const keys = [];
for (const c of codes) {
  const base = await crypto.subtle.importKey('raw', enc.encode(norm(c)), 'PBKDF2', false, ['deriveKey']);
  const kek = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const kiv = crypto.getRandomValues(new Uint8Array(12));
  keys.push({ iv: b64(kiv), k: b64(new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: kiv }, kek, rawKey))) });
}
keys.sort(() => Math.random() - 0.5);

fs.writeFileSync(P('paid.enc.json'), JSON.stringify({ v: 1, it: ITER, salt: b64(salt), iv: b64(iv), data: b64(data), keys }));
console.log('已写入 paid.enc.json（' + Object.keys(content).length + ' 种人格，' + codes.length + ' 个会员码）');
