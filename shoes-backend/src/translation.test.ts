import assert from 'node:assert/strict';
import { isSupportedTranslationLanguage } from './translation.js';

assert.equal(isSupportedTranslationLanguage('en'), true);
assert.equal(isSupportedTranslationLanguage('fr'), true);
assert.equal(isSupportedTranslationLanguage('xx'), false);
