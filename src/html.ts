export const defaultElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 't', 'span', 'a'];

export function markAndSwapAll(body: HTMLElement, selectorGroups: string[] = defaultElements): void {
  restructureTable(body);
  selectorGroups.forEach(selectors => mark(body, selectors));
  swap(body);
}

function isPaired(prev: Element, element: Element): boolean {
  return prev && prev.nextElementSibling === element &&
      prev.tagName === element.tagName && prev.className === element.className;
}

export function mark(element: Element, selector: string): void {
  const elements = element.querySelectorAll(selector);
  elements.forEach(element => {
    if (containsChinese(element.textContent!)) {
      const prev = element.previousElementSibling!;
      if (isPaired(prev, element) && !containsChinese(prev.textContent!)) {
        element.setAttribute('translation-result', 'on');
        prev.setAttribute('translation-origin', 'off');
        // 交换 id，中文内容应该占用原文的 id
        const id = prev.getAttribute('id');
        if (id) {
          prev.removeAttribute('id');
          element.setAttribute('id', id);
        }
        const href = prev.getAttribute('href');
        if (href) {
          element.setAttribute('href', href);
        }
        if (element.tagName.match(/H[1-6]/)) {
          const prevAnchor = prev.querySelector('a[href]');
          const thisAnchor = element.querySelector('a[href]');
          if (prevAnchor && thisAnchor && containsChinese(thisAnchor.getAttribute('href')!)) {
            thisAnchor.setAttribute('href', prevAnchor.getAttribute('href')!);
          }
        }
      }
    }
  });
}

function shouldMergeTable(element: HTMLTableElement): boolean {
  return element.getAttribute('translation-merge-rows') === 'no';
}

function shouldMergeRow(element: HTMLTableRowElement): boolean {
  if (element.getAttribute('translation-merge-rows') === 'no') {
    return false;
  }
  // 如果内部有 p 元素，则禁止自动合并
  for (let i = 0; i < element.cells.length; ++i) {
    if (element.cells.item(i)!.querySelector('p')) {
      return false;
    }
  }
  return true;
}

// 重塑表格结构
export function restructureTable(element: Element): void {
  const items = element.querySelectorAll('table');
  items.forEach(table => {
    if (shouldMergeTable(table)) {
      return;
    }
    // 对出现在 thead 的行和出现在 tbody 的行进行统一处理
    const rows = table.querySelectorAll('* > tr');
    const translationRows: HTMLElement[] = [];
    for (let i = 0; i < rows.length - 1; ++i) {
      const thisRow = rows.item(i) as HTMLTableRowElement;
      const nextRow = rows.item(i + 1) as HTMLTableRowElement;
      if (shouldMergeRow(nextRow) && containsChinese(nextRow.textContent!!) && !containsChinese(thisRow.textContent!!)) {
        translationRows.push(nextRow);
        mergeRows(thisRow, nextRow);
      }
    }
    translationRows.forEach(row => row.remove());
  });
}

function mergeRows(originRow: HTMLTableRowElement, translationRow: HTMLTableRowElement): void {
  if (originRow.cells.length !== translationRow.cells.length) {
    console.warn('Origin row must have same cells count with translation row!');
    return;
  }
  for (let i = 0; i < originRow.cells.length; ++i) {
    const originCell = originRow.cells.item(i)!;
    const translationCell = translationRow.cells.item(i)!;
    if (originCell.innerHTML !== translationCell.innerHTML) {
      originCell.innerHTML = `<p>${originCell.innerHTML}</p><p>${translationCell.innerHTML}</p>`;
    }
  }
}

export function swap(element: Element): void {
  const pairList = element.querySelectorAll('[translation-origin]+[translation-result]');
  pairList.forEach(element => {
    const prev = element.previousElementSibling;
    element.parentElement!.insertBefore(element, prev);
  });
}

function containsChinese(text: string): boolean {
  return text.search(/[\u4e00-\u9fa5]/gm) !== -1;
}

