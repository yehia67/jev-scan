import { parseUnifiedDiff } from "./parse-diff.ts";
import assert from "node:assert/strict";

const diff = `diff --git a/src/auth/session.ts b/src/auth/session.ts
--- a/src/auth/session.ts
+++ b/src/auth/session.ts
@@ -12,6 +12,7 @@ export async function clearSession(response: NextResponse) {
   currentUser = null;
+  response.cookies.delete(SESSION_COOKIE);
   return response;
 }
diff --git a/src/lib/dates.ts b/src/lib/dates.ts
--- a/src/lib/dates.ts
+++ b/src/lib/dates.ts
@@ -1,3 +1,3 @@ export function formatDate(d: Date) {
-  return d.toISOString().slice(0, 10);
+  return d.toISOString().slice(0, 10)
 }
`;

const hunks = parseUnifiedDiff(diff);
assert.equal(hunks.length, 2);
assert.equal(hunks[0]?.path, "src/auth/session.ts");
assert.equal(hunks[0]?.enclosing_function, "export async function clearSession(response: NextResponse) {");
assert.match(hunks[0]?.diff ?? "", /cookies\.delete/);
assert.equal(hunks[1]?.path, "src/lib/dates.ts");
assert.equal(parseUnifiedDiff("").length, 0);
console.log("parse-diff ok");
