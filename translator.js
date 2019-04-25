document.addEventListener('click', function (event) {
  /** @type Element */
  var result = event.target;
  // 忽略 A 标签
  if (result.tagName === 'A') {
    return;
  }
  if (result.hasAttribute('translation-origin')) {
    var origin = result.nextElementSibling;
    if (origin.getAttribute('translation-result') === 'off') {
      origin.setAttribute('translation-result', 'on');
    } else {
      origin.setAttribute('translation-result', 'off');
    }
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
});
