import { CommandBuilder } from 'yargs';
import { extractFromFiles } from '../../trans-kit';
import { toArray } from 'rxjs/operators';
import { writeFileSync } from 'fs';

export const command = `extract <sourceGlob> [outFile]`;

export const describe = '提取翻译对';

export const builder: CommandBuilder = {
  sourceGlob: {
    description: '文件通配符，注意：要包含在引号里，参见 https://github.com/isaacs/node-glob#glob-primer',
  },
  outFile: {
    description: '结果输出到的文件，不要带扩展名',
    default: 'STDOUT',
  },
  outType: {
    type: 'string',
    choices: ['google', 'ms'],
    default: 'google',
  },
  unique: {
    type: 'boolean',
    default: false,
  },
};

interface ExtractParams {
  sourceGlob: string;
  outFile: string;
  unique: boolean;
  outType: 'google' | 'ms';
}

export const handler = function ({ sourceGlob, outFile, unique, outType }: ExtractParams) {
  return extractFromFiles(sourceGlob, unique)
    .pipe(
      toArray(),
    )
    .subscribe((pairs) => {
      if (outType === 'google') {
        const content = pairs.map(it => `${it.english}\t${it.chinese}`).join('\n');
        writeTo(outFile, 'pair', content);
      } else if (outType === 'ms') {
        writeTo(outFile, 'en', pairs.map(it => it.english).join('\n'));
        writeTo(outFile, 'cn', pairs.map(it => it.chinese).join('\n'));
      }
    });
};

function writeTo(filename: string, lang: 'pair' | 'en' | 'cn', content: string): void {
  if (filename === 'STDOUT') {
    process.stdout.write(content);
  } else {
    writeFileSync(`${filename}_${lang}.txt`, content);
  }
}
