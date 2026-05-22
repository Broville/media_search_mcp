#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const TARGET = resolve('dist/index.js');
const SHEBANG = '#!/usr/bin/env node\n';

let content = readFileSync(TARGET, 'utf8');
if (!content.startsWith(SHEBANG)) {
  writeFileSync(TARGET, SHEBANG + content);
  console.log('✅ Shebang injected');
} else {
  console.log('✅ Shebang already present');
}
