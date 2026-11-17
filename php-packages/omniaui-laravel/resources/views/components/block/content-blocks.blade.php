{{-- OmniaUI block: content-blocks - Editor column with the content blocks of a page or step: cards you open and close, move up or down, drag, remove and add. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/content-blocks.html | Map: top bar -> ol of blocks (li: grip, details card with head + body, tools) -> add row + menu -> templates -> status line -> optional script
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-content-blocks: Frame (container query: two fields per row from 36rem, no peek text below 30rem)
       .oc-block-content-blocks-bar: Top bar with -nav (previous / next), -heading (-title, -meta) and -actions
       .oc-block-content-blocks-list: ol of blocks
       .oc-block-content-blocks-item[data-id]: One block (li). States from the script: .is-dragging, .is-drop-before, .is-drop-after
       .oc-sortable-row-grip: Drag handle (free component). Click it, then the arrow keys move the block; Enter or Escape drops it
       details.oc-block-content-blocks-card: The card; [open] shows the body
       summary.oc-block-content-blocks-head: -type (icon + name; --oc-block-type-color tints the icon) and -peek (one line, only while closed)
       .oc-block-content-blocks-tools: Buttons with data-action="up" | "down" | "remove"
       .oc-block-content-blocks-body: Fields of the block; -row (two fields side by side), -answers / -answer / -letter (radio: the right answer), -hint
       .oc-block-content-blocks-foot > .oc-block-content-blocks-add: Dashed add row (opens a menu with data-add="<type>" items)
       template.oc-block-content-blocks-template[data-type]: Markup of a new block of that type
       .oc-block-content-blocks-status: Live region; the script says what moved
     Opening and closing need no JavaScript. The script moves, removes and adds blocks and fires "oc-content-blocks-change"
     ({ action, id, order }) on the frame: save the order from there.
     Blade: <x-oc::block.content-blocks> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, meta, actions, default.
--}}
@props(['title' => null, 'meta' => null, 'actions' => null])
<section {{ $attributes->merge(['class' => 'oc-block-content-blocks', 'aria-labelledby' => 'oc-cblocks-title']) }}>
  <div class="oc-block-content-blocks-bar">
    <div class="oc-block-content-blocks-nav">
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" aria-label="Previous step"><iconify-icon icon="mdi:chevron-left" aria-hidden="true"></iconify-icon></button>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" aria-label="Next step"><iconify-icon icon="mdi:chevron-right" aria-hidden="true"></iconify-icon></button>
    </div>
    <div class="oc-block-content-blocks-heading">
      <h2 class="oc-block-content-blocks-title" id="oc-cblocks-title">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Step 3 · Old gate
          @endif
      </h2>
      <p class="oc-block-content-blocks-meta">
          @if (isset($meta) && trim((string) $meta) !== '')
              {{ $meta }}
          @else
          Route 1 · step 3 of 8 · 5 blocks
          @endif
      </p>
    </div>
    <div class="oc-block-content-blocks-actions">
        @if (isset($actions) && trim((string) $actions) !== '')
            {{ $actions }}
        @else
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button"><iconify-icon icon="mdi:eye-outline" aria-hidden="true"></iconify-icon> Preview</button>
      <button class="oc-btn oc-btn--sm" type="button">Save</button>
        @endif
    </div>
  </div>

  <ol class="oc-block-content-blocks-list" aria-label="Blocks of this step">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <li class="oc-block-content-blocks-item" data-id="b1">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Text" aria-pressed="false"></button>
      <details class="oc-block-content-blocks-card" open>
        <summary class="oc-block-content-blocks-head"><span class="oc-block-content-blocks-type"><iconify-icon icon="mdi:text" aria-hidden="true"></iconify-icon>Text</span><span class="oc-block-content-blocks-peek">Walk to the old gate and look up at the clock.</span></summary>
        <div class="oc-block-content-blocks-body">
          <label class="oc-visually-hidden" for="oc-cblocks-text">Text</label>
          <textarea class="oc-input" id="oc-cblocks-text" rows="3">Walk to the old gate and look up at the clock. The gate is older than the town hall.</textarea>
        </div>
      </details>
      <div class="oc-block-content-blocks-tools">
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="up" aria-label="Move Text up" disabled><iconify-icon icon="mdi:arrow-up" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="down" aria-label="Move Text down"><iconify-icon icon="mdi:arrow-down" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label="Remove Text"><iconify-icon icon="mdi:trash-can-outline" aria-hidden="true"></iconify-icon></button>
      </div>
    </li>
    <li class="oc-block-content-blocks-item" data-id="b2">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Image" aria-pressed="false"></button>
      <details class="oc-block-content-blocks-card">
        <summary class="oc-block-content-blocks-head"><span class="oc-block-content-blocks-type" style="--oc-block-type-color: var(--color-teal-60)"><iconify-icon icon="mdi:image-outline" aria-hidden="true"></iconify-icon>Image</span><span class="oc-block-content-blocks-peek">old-gate.jpg · 1600 × 1000</span></summary>
        <div class="oc-block-content-blocks-body">
          <label class="oc-dropzone">
            <input type="file" accept="image/*">
            <span><strong>Drop a photo here</strong> or click to choose</span>
            <span class="oc-dropzone-hint">JPG, PNG or WebP, up to 5 MB</span>
          </label>
        </div>
      </details>
      <div class="oc-block-content-blocks-tools">
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="up" aria-label="Move Image up"><iconify-icon icon="mdi:arrow-up" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="down" aria-label="Move Image down"><iconify-icon icon="mdi:arrow-down" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label="Remove Image"><iconify-icon icon="mdi:trash-can-outline" aria-hidden="true"></iconify-icon></button>
      </div>
    </li>
    <li class="oc-block-content-blocks-item" data-id="b3">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Question" aria-pressed="false"></button>
      <details class="oc-block-content-blocks-card" open>
        <summary class="oc-block-content-blocks-head"><span class="oc-block-content-blocks-type" style="--oc-block-type-color: var(--color-purple-60)"><iconify-icon icon="mdi:help-circle-outline" aria-hidden="true"></iconify-icon>Question</span><span class="oc-block-content-blocks-peek">In which year was the gate built?</span></summary>
        <div class="oc-block-content-blocks-body">
          <div class="oc-field">
            <label class="oc-field-label" for="oc-cblocks-q">Question</label>
            <input class="oc-input" id="oc-cblocks-q" value="In which year was the gate built?">
          </div>
          <fieldset class="oc-block-content-blocks-answers">
            <legend class="oc-field-label">Answers (pick the letter of the right one)</legend>
            <div class="oc-block-content-blocks-answer"><label class="oc-block-content-blocks-letter"><input type="radio" name="oc-cblocks-right" value="a" aria-label="A is the right answer">A</label><input class="oc-input" value="1890" aria-label="Answer A"></div>
            <div class="oc-block-content-blocks-answer"><label class="oc-block-content-blocks-letter"><input type="radio" name="oc-cblocks-right" value="b" aria-label="B is the right answer" checked>B</label><input class="oc-input" value="1910" aria-label="Answer B"></div>
            <div class="oc-block-content-blocks-answer"><label class="oc-block-content-blocks-letter"><input type="radio" name="oc-cblocks-right" value="c" aria-label="C is the right answer">C</label><input class="oc-input" value="1930" aria-label="Answer C"></div>
          </fieldset>
        </div>
      </details>
      <div class="oc-block-content-blocks-tools">
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="up" aria-label="Move Question up"><iconify-icon icon="mdi:arrow-up" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="down" aria-label="Move Question down"><iconify-icon icon="mdi:arrow-down" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label="Remove Question"><iconify-icon icon="mdi:trash-can-outline" aria-hidden="true"></iconify-icon></button>
      </div>
    </li>
    <li class="oc-block-content-blocks-item" data-id="b4">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Note" aria-pressed="false"></button>
      <details class="oc-block-content-blocks-card">
        <summary class="oc-block-content-blocks-head"><span class="oc-block-content-blocks-type" style="--oc-block-type-color: var(--color-darkorange-95)"><iconify-icon icon="mdi:alert-circle-outline" aria-hidden="true"></iconify-icon>Note</span><span class="oc-block-content-blocks-peek">Warning · Mind the traffic at the crossing.</span></summary>
        <div class="oc-block-content-blocks-body">
          <div class="oc-segmented oc-segmented--sm" role="radiogroup" aria-label="Tone">
            <label class="oc-segmented-item"><input type="radio" name="oc-cblocks-tone" value="info"> Info</label>
            <label class="oc-segmented-item"><input type="radio" name="oc-cblocks-tone" value="warning" checked> Warning</label>
            <label class="oc-segmented-item"><input type="radio" name="oc-cblocks-tone" value="success"> Success</label>
          </div>
          <label class="oc-visually-hidden" for="oc-cblocks-note">Note text</label>
          <textarea class="oc-input" id="oc-cblocks-note" rows="2">Mind the traffic at the crossing.</textarea>
        </div>
      </details>
      <div class="oc-block-content-blocks-tools">
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="up" aria-label="Move Note up"><iconify-icon icon="mdi:arrow-up" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="down" aria-label="Move Note down"><iconify-icon icon="mdi:arrow-down" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label="Remove Note"><iconify-icon icon="mdi:trash-can-outline" aria-hidden="true"></iconify-icon></button>
      </div>
    </li>
    <li class="oc-block-content-blocks-item" data-id="b5">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Countdown" aria-pressed="false"></button>
      <details class="oc-block-content-blocks-card">
        <summary class="oc-block-content-blocks-head"><span class="oc-block-content-blocks-type" style="--oc-block-type-color: var(--color-crimson-70)"><iconify-icon icon="mdi:timer-outline" aria-hidden="true"></iconify-icon>Countdown</span><span class="oc-block-content-blocks-peek">90 seconds · Time left</span></summary>
        <div class="oc-block-content-blocks-body">
          <div class="oc-block-content-blocks-row">
            <div class="oc-field"><label class="oc-field-label" for="oc-cblocks-sec">Seconds</label><input class="oc-input" id="oc-cblocks-sec" type="number" min="5" max="3600" step="5" value="90"></div>
            <div class="oc-field"><label class="oc-field-label" for="oc-cblocks-label">Label</label><input class="oc-input" id="oc-cblocks-label" value="Time left"></div>
          </div>
          <p class="oc-block-content-blocks-hint">Starts when the step opens. It is shown to the reader only.</p>
        </div>
      </details>
      <div class="oc-block-content-blocks-tools">
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="up" aria-label="Move Countdown up"><iconify-icon icon="mdi:arrow-up" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="down" aria-label="Move Countdown down" disabled><iconify-icon icon="mdi:arrow-down" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label="Remove Countdown"><iconify-icon icon="mdi:trash-can-outline" aria-hidden="true"></iconify-icon></button>
      </div>
    </li>
      @endif
  </ol>

  <div class="oc-block-content-blocks-foot">
    <button class="oc-block-content-blocks-add" type="button" popovertarget="oc-cblocks-addmenu"><iconify-icon icon="mdi:plus" aria-hidden="true"></iconify-icon> Add block</button>
    <div class="oc-dropdown-menu" id="oc-cblocks-addmenu" popover>
      <button class="oc-dropdown-item" type="button" data-add="text" popovertarget="oc-cblocks-addmenu" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><iconify-icon icon="mdi:text"></iconify-icon></span>Text</button>
      <button class="oc-dropdown-item" type="button" data-add="note" popovertarget="oc-cblocks-addmenu" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><iconify-icon icon="mdi:alert-circle-outline"></iconify-icon></span>Note</button>
      <button class="oc-dropdown-item" type="button" data-add="link" popovertarget="oc-cblocks-addmenu" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><iconify-icon icon="mdi:link-variant"></iconify-icon></span>Link</button>
    </div>
  </div>

  <template class="oc-block-content-blocks-template" data-type="text">
    <li class="oc-block-content-blocks-item">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Text" aria-pressed="false"></button>
      <details class="oc-block-content-blocks-card" open>
        <summary class="oc-block-content-blocks-head"><span class="oc-block-content-blocks-type"><iconify-icon icon="mdi:text" aria-hidden="true"></iconify-icon>Text</span><span class="oc-block-content-blocks-peek">Empty</span></summary>
        <div class="oc-block-content-blocks-body"><textarea class="oc-input" rows="3" aria-label="Text" placeholder="Write something for the reader"></textarea></div>
      </details>
      <div class="oc-block-content-blocks-tools">
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="up" aria-label="Move Text up"><iconify-icon icon="mdi:arrow-up" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="down" aria-label="Move Text down"><iconify-icon icon="mdi:arrow-down" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label="Remove Text"><iconify-icon icon="mdi:trash-can-outline" aria-hidden="true"></iconify-icon></button>
      </div>
    </li>
  </template>
  <template class="oc-block-content-blocks-template" data-type="note">
    <li class="oc-block-content-blocks-item">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Note" aria-pressed="false"></button>
      <details class="oc-block-content-blocks-card" open>
        <summary class="oc-block-content-blocks-head"><span class="oc-block-content-blocks-type" style="--oc-block-type-color: var(--color-darkorange-95)"><iconify-icon icon="mdi:alert-circle-outline" aria-hidden="true"></iconify-icon>Note</span><span class="oc-block-content-blocks-peek">Empty</span></summary>
        <div class="oc-block-content-blocks-body"><textarea class="oc-input" rows="2" aria-label="Note text" placeholder="Something the reader must not miss"></textarea></div>
      </details>
      <div class="oc-block-content-blocks-tools">
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="up" aria-label="Move Note up"><iconify-icon icon="mdi:arrow-up" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="down" aria-label="Move Note down"><iconify-icon icon="mdi:arrow-down" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label="Remove Note"><iconify-icon icon="mdi:trash-can-outline" aria-hidden="true"></iconify-icon></button>
      </div>
    </li>
  </template>
  <template class="oc-block-content-blocks-template" data-type="link">
    <li class="oc-block-content-blocks-item">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Link" aria-pressed="false"></button>
      <details class="oc-block-content-blocks-card" open>
        <summary class="oc-block-content-blocks-head"><span class="oc-block-content-blocks-type" style="--oc-block-type-color: var(--color-indigo-60)"><iconify-icon icon="mdi:link-variant" aria-hidden="true"></iconify-icon>Link</span><span class="oc-block-content-blocks-peek">Empty</span></summary>
        <div class="oc-block-content-blocks-body"><div class="oc-block-content-blocks-row"><input class="oc-input" aria-label="Button text" placeholder="Button text"><input class="oc-input" type="url" aria-label="Web address" placeholder="https://"></div></div>
      </details>
      <div class="oc-block-content-blocks-tools">
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="up" aria-label="Move Link up"><iconify-icon icon="mdi:arrow-up" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="down" aria-label="Move Link down"><iconify-icon icon="mdi:arrow-down" aria-hidden="true"></iconify-icon></button>
        <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" data-action="remove" aria-label="Remove Link"><iconify-icon icon="mdi:trash-can-outline" aria-hidden="true"></iconify-icon></button>
      </div>
    </li>
  </template>
  <p class="oc-block-content-blocks-status oc-visually-hidden" aria-live="polite"></p>
</section>
@once
    <script>
      // Optional: move (buttons, drag, keyboard on the grip), remove and add blocks in every .oc-block-content-blocks.
      document.querySelectorAll(".oc-block-content-blocks").forEach((root) => {
        const list = root.querySelector("ol.oc-block-content-blocks-list");
        const items = () => [...list.children];
        const label = (li) => li.querySelector(".oc-block-content-blocks-type")?.textContent.trim() || "Block";
        const say = (text) => { const s = root.querySelector(".oc-block-content-blocks-status"); if (s) s.textContent = text; };
        const changed = (action, li) => {
          items().forEach((x, i, all) => {
            x.querySelector('[data-action="up"]').disabled = i === 0;
            x.querySelector('[data-action="down"]').disabled = i === all.length - 1;
          });
          root.dispatchEvent(new CustomEvent("oc-content-blocks-change", { bubbles: true, detail: { action, id: li?.dataset.id, order: items().map((x) => x.dataset.id) } }));
        };
        let moving = false;
        const move = (li, to, focus) => {
          const all = items();
          if (to < 0 || to >= all.length || to === all.indexOf(li)) return;
          moving = true;
          to > all.indexOf(li) ? all[to].after(li) : all[to].before(li);
          moving = false;
          changed("move", li);
          say(`${label(li)}: position ${to + 1} of ${all.length}`);
          (focus?.disabled ? li.querySelector(".oc-sortable-row-grip") : focus)?.focus();
        };
        root.addEventListener("click", (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;
          const li = btn.closest(".oc-block-content-blocks-item");
          const act = btn.dataset.action;
          if (act === "up" || act === "down") move(li, items().indexOf(li) + (act === "up" ? -1 : 1), btn);
          else if (act === "remove") {
            const next = li.nextElementSibling || li.previousElementSibling;
            li.remove();
            changed("remove", li);
            say(`${label(li)} removed`);
            (next?.querySelector("summary") || root.querySelector(".oc-block-content-blocks-add"))?.focus();
          } else if (btn.dataset.add) {
            const tpl = root.querySelector(`template[data-type="${btn.dataset.add}"]`);
            if (!tpl) return;
            const li = tpl.content.firstElementChild.cloneNode(true);
            li.dataset.id = `new-${Date.now()}`;
            list.append(li);
            changed("add", li);
            say(`${label(li)} added`);
            li.querySelector("textarea, input")?.focus();
          } else if (btn.classList.contains("oc-sortable-row-grip")) {
            btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
            if (btn.getAttribute("aria-pressed") === "true") say(`${label(li)} picked up. Use the arrow keys, then Enter.`);
          }
        });
        root.addEventListener("keydown", (e) => {
          const grip = e.target.closest('.oc-sortable-row-grip[aria-pressed="true"]');
          if (!grip) return;
          const li = grip.closest(".oc-block-content-blocks-item");
          if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); move(li, items().indexOf(li) + (e.key === "ArrowUp" ? -1 : 1), grip); }
          else if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); grip.setAttribute("aria-pressed", "false"); say(`${label(li)} dropped`); }
        });
        root.addEventListener("focusout", (e) => { if (!moving && e.target.matches?.(".oc-sortable-row-grip")) e.target.setAttribute("aria-pressed", "false"); });
        // Drag with the mouse: only the grip starts a drag, so text in the fields can still be selected.
        let dragged = null;
        const clear = () => items().forEach((x) => x.classList.remove("is-drop-before", "is-drop-after"));
        root.addEventListener("pointerdown", (e) => { const g = e.target.closest(".oc-sortable-row-grip"); if (g) g.parentElement.draggable = true; });
        root.addEventListener("pointerup", () => { if (!dragged) items().forEach((x) => { x.draggable = false; }); });
        list.addEventListener("dragstart", (e) => { dragged = e.target.closest(".oc-block-content-blocks-item"); dragged?.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragged?.dataset.id || ""); });
        list.addEventListener("dragover", (e) => {
          const over = e.target.closest(".oc-block-content-blocks-item");
          if (!dragged || !over) return;
          e.preventDefault();
          clear();
          const r = over.getBoundingClientRect();
          if (over !== dragged) over.classList.add(e.clientY < r.top + r.height / 2 ? "is-drop-before" : "is-drop-after");
        });
        list.addEventListener("drop", (e) => {
          const over = list.querySelector(".is-drop-before, .is-drop-after");
          if (!dragged || !over) return;
          e.preventDefault();
          const all = items(), from = all.indexOf(dragged);
          let to = all.indexOf(over) + (over.classList.contains("is-drop-after") ? 1 : 0);
          if (to > from) to--;
          move(dragged, to);
        });
        list.addEventListener("dragend", () => { clear(); dragged?.classList.remove("is-dragging"); if (dragged) dragged.draggable = false; dragged = null; });
      });
    </script>
@endonce
