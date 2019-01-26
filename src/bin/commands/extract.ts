import { CommandBuilder } from 'yargs';
import { createWriteStream, WriteStream } from 'fs';
import { extractFromFiles } from '../../trans-kit';
import { map, toArray } from 'rxjs/operators';

export const command = `extract <sourceGlob> [outFile]`;

export const describe = '提取翻译对';

export const builder: CommandBuilder = {
  sourceGlob: {
    description: '文件通配符，注意：要包含在引号里，参见 https://github.com/isaacs/node-glob#glob-primer',
  },
  outFile: {
    description: '结果输出到的文件',
    default: 'STDOUT',
    coerce: (name: string) => {
      if (name === 'STDOUT') {
        return process.stdout;
      } else {
        return createWriteStream(name);
      }
    },
  },
  unique: {
    type: 'boolean',
    default: false,
  },
};

interface ExtractParams {
  sourceGlob: string;
  outFile: WriteStream;
  unique: boolean;
}

export const handler = function ({ sourceGlob, outFile, unique }: ExtractParams) {
  return extractFromFiles(sourceGlob, unique)
    .pipe(
      toArray(),
      map((pairs) => pairs.join('\n')),
    )
    .subscribe((pairs) => {
      outFile.write(pairs);
    });
};
