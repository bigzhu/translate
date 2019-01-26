import { CommandBuilder } from 'yargs';
import { autoCheckFiles } from '../../trans-kit';
import { map, toArray } from 'rxjs/operators';

export const command = `check <sourceGlob>`;

export const describe = '自动（粗略）检查翻译结果';

export const builder: CommandBuilder = {
  sourceGlob: {
    description: '根据中英字符串长度粗略检查翻译结果',
  },
};

interface CheckParams {
  sourceGlob: string;
}

export const handler = function ({ sourceGlob }: CheckParams) {
  return autoCheckFiles(sourceGlob)
    .pipe(
      toArray(),
      map((pairs) => pairs.join('\n')),
    )
    .subscribe((pairs) => {
      console.log(pairs);
    });
};
