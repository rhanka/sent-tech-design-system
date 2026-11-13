#!/usr/bin/env node
import * as bench from './lib.mjs';
import { runCheck } from '../../../scripts/vue-conversion-bench/check.mjs';
runCheck(bench);
