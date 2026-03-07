import fs from 'fs';
import path from 'path';

const templatePath = path.resolve('template/index.html');
const domainsDir = path.resolve('domains');
const distDir = path.resolve('dist');

const template = fs.readFileSync(templatePath, 'utf8');

fs.mkdirSync(distDir, { recursive: true });

for (const file of fs.readdirSync(domainsDir)) {
  if (!file.endsWith('.json')) continue;

  const config = JSON.parse(fs.readFileSync(path.join(domainsDir, file), 'utf8'));

  let html = template;
  for (const [key, value] of Object.entries(config)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  const outDir = path.join(distDir, config.domain);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);

  console.log(`Built: ${config.domain}`);
}
