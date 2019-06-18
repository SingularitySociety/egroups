// @flow

import MarkdownParser from './MarkdownParser';
import {stateFromElement} from './stateFromElement';

import {ContentState} from 'draft-js';
import {ElementStyles, CustomBlockFn, CustomInlineFn} from './stateFromElement';

/*
type = {
  elementStyles?: ElementStyles;
  blockTypes?: {[key: string]: string};
  customBlockFn?: CustomBlockFn;
  customInlineFn?: CustomInlineFn;
  parserOptions?: {[key: string]: mixed}; // TODO: Be more explicit
};
*/

let defaultOptions = {};

export function stateFromMarkdown(
  markdown,
  options,
) {
  let {parserOptions, ...otherOptions} = options || defaultOptions;
  let element = MarkdownParser.parse(markdown, {getAST: true, ...parserOptions});
  return stateFromElement(element, otherOptions);
}
