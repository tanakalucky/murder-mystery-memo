export const getTextAreaCaretCoordinates = (
  textarea: HTMLTextAreaElement,
  position: number,
) => {
  const div = document.createElement("div");
  const style = window.getComputedStyle(textarea);

  const properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderWidth",
    "borderStyle",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontFamily",
    "fontWeight",
    "fontSize",
    "fontStyle",
    "fontVariant",
    "fontStretch",
    "lineHeight",
    "wordBreak",
    "wordWrap",
    "letterSpacing",
    "whiteSpace",
    "textTransform",
  ];

  properties.forEach((prop) => {
    div.style[prop as any] = style[prop as any];
  });

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordBreak = "break-all";

  div.textContent = textarea.value.substring(0, position);

  const span = document.createElement("span");
  span.textContent = textarea.value.substring(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);

  const textareaRect = textarea.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  const divRect = div.getBoundingClientRect();

  const coordinates = {
    top: spanRect.top - divRect.top + textareaRect.top - textarea.scrollTop,
    left:
      spanRect.left - divRect.left + textareaRect.left - textarea.scrollLeft,
  };

  document.body.removeChild(div);

  return coordinates;
};
