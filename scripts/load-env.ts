/**
 * scripts/load-env.ts
 *
 * Loads env files for standalone tsx scripts. This MUST be imported as the
 * very first import in a script — ES module imports are hoisted and evaluated
 * in order, so importing this before any app modules guarantees the env vars
 * exist before modules like src/lib/dodo.ts instantiate their clients at
 * module-eval time.
 *
 * .env.local takes priority over .env (dotenv keeps the first value it sees).
 */
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })
