import fs from 'node:fs';
const out = 'site-dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const name of ['guide.css', 'guide-data.json', 'revisions.json', 'curricula.json', 'department-logo.jpg']) {
  fs.copyFileSync(`public/${name}`, `${out}/${name}`);
}
const html = fs.readFileSync('public/guide.html', 'utf8')
  .replace(/<a href="\/index.html" id="manage" hidden>.*?<\/a>/, '')
  .replaceAll('href="/"', 'href="./"')
  .replaceAll('href="/department-logo.jpg', 'href="./department-logo.jpg')
  .replaceAll('src="/department-logo.jpg', 'src="./department-logo.jpg');
let js = fs.readFileSync('public/guide.js', 'utf8');
const adminRequest = "fetch('/api/session')";
if (!js.includes(adminRequest)) throw new Error('Review changed guide.js admin request before publishing');
js = js.slice(0, js.indexOf(adminRequest)) + '\n' + fs.readFileSync('public/details.js', 'utf8');
js = js.replaceAll("fetch('/", "fetch('./");
fs.writeFileSync(`${out}/index.html`, html);
fs.writeFileSync(`${out}/guide.js`, js);
fs.writeFileSync(`${out}/.nojekyll`, '');
console.log('Student site built in site-dist/');
