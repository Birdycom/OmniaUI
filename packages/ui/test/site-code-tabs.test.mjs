// File: packages/ui/test/site-code-tabs.test.mjs
// Map: demo tab order (HTML | React | Vue | Blade | Livewire) -> tokenizers tsx / vue / php / blade / livewire -> Livewire split

import { test } from "node:test";
import assert from "node:assert/strict";
import { highlight, splitLivewire } from "../../../apps/site/src/lib/highlight.mjs";
import { orderDemoCodes, transform } from "../../../apps/site/src/lib/transform.mjs";

const has = (html, cls, text) => assert.ok(html.includes(`<span class="${cls}">${text}</span>`), `${cls} around ${text}\n${html}`);

test("demo tabs are ordered HTML | React | Vue | Blade | Livewire, other languages after", () => {
  const codes = ["livewire", "blade", "css", "vue", "tsx", "html"].map((lang) => ({ lang, code: lang }));
  assert.deepEqual(orderDemoCodes(codes, "<p>x</p>").map((c) => c.lang), ["html", "tsx", "vue", "blade", "livewire", "css"]);
});

test("framework tabs without an HTML tab get the HTML tab from the preview", () => {
  const out = orderDemoCodes([{ lang: "livewire", code: "<div></div>" }], '<input class="oc-input">');
  assert.deepEqual(out.map((c) => c.lang), ["html", "livewire"]);
  assert.equal(out[0].code, '<input class="oc-input">');
  // A demo with only a CSS or JSON tab stays as it is.
  assert.deepEqual(orderDemoCodes([{ lang: "css", code: "a{}" }], "<p></p>").map((c) => c.lang), ["css"]);
});

test("transform renders the Livewire tab label in order", () => {
  const { html } = transform('<oc-demo title="T"><input class="oc-input"><oc-code lang="livewire">&lt;div&gt;&lt;/div&gt;</oc-code><oc-code lang="tsx">&lt;Input /&gt;</oc-code></oc-demo>');
  const labels = [...html.matchAll(/class="oc-demo__tab"><input[^>]*><span>([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(labels, ["Preview", "HTML", "React", "Livewire"]);
  assert.ok(html.includes('data-lang="livewire"'));
});

test("tsx: keywords, strings, JSX tags and attributes; generics stay code", () => {
  const out = highlight('import { Input } from "@birdycom/omniaui-react";\nconst [v, setV] = useState<string>("");\nreturn <Input value={v} onChange={(e) => setV(e.target.value)} disabled />;', "tsx");
  has(out, "hl-keyword", "import");
  has(out, "hl-string", '"@birdycom/omniaui-react"');
  has(out, "hl-tag", "&lt;Input");
  has(out, "hl-attr", "onChange");
  has(out, "hl-function", "setV");
  has(out, "hl-tag", "/&gt;");
  assert.ok(out.includes("useState&lt;string&gt;"), "generic is not a tag");
  const children = highlight("<Modal title=\"Delete\"><p>Text for {name}</p></Modal>", "tsx");
  has(children, "hl-tag", "&lt;/Modal");
  assert.ok(children.includes("Text for {name}"), "JSX text is not highlighted as code");
});

test("vue: template as HTML, script setup as TypeScript", () => {
  const out = highlight("<script setup lang=\"ts\">\nimport { ref } from 'vue'\nconst open = ref(false)\n</script>\n\n<template>\n  <OcModal v-model:open=\"open\" title=\"Hi\" />\n</template>", "vue");
  has(out, "hl-keyword", "import");
  has(out, "hl-string", "'vue'");
  has(out, "hl-tag", "&lt;OcModal");
  has(out, "hl-attr", "v-model:open");
});

test("php: variables, keywords, attributes, strings, comments", () => {
  const out = highlight("<?php\n\nnamespace App\\Livewire;\n\n// Profile form\nclass Profile extends Component\n{\n    #[Validate('required|email')]\n    public string $email = '';\n}", "php");
  has(out, "hl-keyword", "&lt;?php");
  has(out, "hl-keyword", "namespace");
  has(out, "hl-comment", "// Profile form");
  has(out, "hl-attr", "#[Validate('required|email')]");
  has(out, "hl-variable", "$email");
  has(out, "hl-string", "''");
});

test("blade: components, wire:* attributes, directives, echoes and comments", () => {
  const out = highlight("{{-- view --}}\n<div>\n  <x-oc::wire.input model=\"email\" wire:keydown.enter=\"save\" />\n  @if ($saved)\n    <p>{{ __('Saved') }} info@company1.example</p>\n  @endif\n</div>", "blade");
  has(out, "hl-comment", "{{-- view --}}");
  has(out, "hl-tag", "&lt;x-oc::wire.input");
  has(out, "hl-attr", "model");
  has(out, "hl-prop", "wire:keydown.enter");
  has(out, "hl-keyword", "@if");
  has(out, "hl-variable", "$saved");
  has(out, "hl-keyword", "{{");
  has(out, "hl-string", "'Saved'");
  assert.ok(!out.includes('<span class="hl-keyword">@company1</span>'), "an e-mail address is not a directive");
});

test("livewire: the class is PHP, the view after the Blade comment line is Blade", () => {
  const code = "<?php\n\nnamespace App\\Livewire;\n\nclass Profile extends Component\n{\n    public string $email = '';\n}\n\n{{-- resources/views/livewire/profile.blade.php --}}\n<div>\n    <x-oc::wire.input model=\"email\" live />\n</div>";
  assert.deepEqual(splitLivewire(code).map((p) => p.lang), ["php", "blade"]);
  const out = highlight(code, "livewire");
  has(out, "hl-variable", "$email");
  has(out, "hl-comment", "{{-- resources/views/livewire/profile.blade.php --}}");
  has(out, "hl-tag", "&lt;x-oc::wire.input");
  assert.equal(out.split("\n").length, code.split("\n").length, "line count is kept (gutter numbers match)");
});
