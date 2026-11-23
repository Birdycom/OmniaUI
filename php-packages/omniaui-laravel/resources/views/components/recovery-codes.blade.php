{{-- OmniaCSS recovery codes panel. Props: codes (list of strings), title, warning, copy / download (button labels),
     copiedLabel (feedback after copying, also in a live region; default "Copied"), print (a Print button that prints only
     the codes; default false), printLabel, filename (default recovery-codes.txt), icons (Omnia webicons on the buttons
     and at the warning; default true). Slot: replaces the action buttons. --}}
@props(['codes' => [], 'title' => 'Recovery codes', 'warning' => 'Store these codes somewhere safe. Each code works once.', 'copy' => 'Copy all', 'copiedLabel' => 'Copied', 'download' => 'Download .txt', 'print' => false, 'printLabel' => 'Print', 'filename' => 'recovery-codes.txt', 'icons' => true])
<div {{ $attributes->class(['oc-recovery-codes']) }}>
    <h3 class="oc-recovery-codes-title">{{ $title }}</h3>
    <p class="oc-recovery-codes-warning">@if ($icons)<x-oc::webicon name="mdi:alert-outline" bare fallback="iconify" />@endif<span>{{ $warning }}</span></p>
    <ul class="oc-recovery-codes-list">
        @foreach ($codes as $code)
            <li>{{ $code }}</li>
        @endforeach
    </ul>
    <div class="oc-recovery-codes-actions">
        @if ($slot->isEmpty())
            <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-recovery="copy" data-copied-label="{{ $copiedLabel }}">@if ($icons)<x-oc::webicon name="mdi:content-copy" bare fallback="iconify" class="oc-recovery-codes-icon-copy" /><x-oc::webicon name="mdi:check" bare fallback="iconify" class="oc-recovery-codes-icon-copied" />@endif<span class="oc-recovery-codes-label">{{ $copy }}</span></button>
            <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-recovery="download" data-filename="{{ $filename }}">@if ($icons)<x-oc::webicon name="mdi:download" bare fallback="iconify" />@endif<span>{{ $download }}</span></button>
            @if ($print)
                <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-recovery="print">@if ($icons)<x-oc::webicon name="mdi:printer" bare fallback="iconify" />@endif<span>{{ $printLabel }}</span></button>
            @endif
        @else
            {{ $slot }}
        @endif
    </div>
    <span class="oc-recovery-codes-status oc-visually-hidden" role="status" aria-live="polite"></span>
</div>
@once
    <script>
        document.addEventListener('click', async (e) => {
          const btn = e.target.closest('[data-oc-recovery]');
          if (!btn) return;
          const panel = btn.closest('.oc-recovery-codes');
          const codes = Array.from(panel.querySelectorAll('.oc-recovery-codes-list li')).map((li) => li.textContent.trim());
          const text = codes.join('\n');
          const action = btn.dataset.ocRecovery;
          if (action === 'copy') {
            try { await navigator.clipboard.writeText(text); } catch { return; }
            // data-copied-label: feedback on the button and in the live region (.oc-recovery-codes-status)
            const label = btn.querySelector('.oc-recovery-codes-label');
            const status = panel.querySelector('.oc-recovery-codes-status');
            const done = btn.dataset.copiedLabel || 'Copied';
            if (label) { label.dataset.label ??= label.textContent; label.textContent = done; }
            if (status) status.textContent = done;
            btn.classList.add('is-copied');
            clearTimeout(btn.ocCopyTimer);
            btn.ocCopyTimer = setTimeout(() => {
              btn.classList.remove('is-copied');
              if (label) label.textContent = label.dataset.label;
              if (status) status.textContent = '';
            }, 2000);
            return;
          }
          if (action === 'print') {
            // only the codes on paper: a hidden iframe with the title and the list
            const esc = (t) => t.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
            const title = esc(panel.querySelector('.oc-recovery-codes-title')?.textContent.trim() || 'Recovery codes');
            const frame = document.createElement('iframe');
            frame.setAttribute('aria-hidden', 'true');
            frame.style.cssText = 'position:fixed;inline-size:0;block-size:0;border:0;inset:auto auto 0 0';
            frame.srcdoc = `<!doctype html><meta charset="utf-8"><title>${title}</title><style>body{font:14px ui-monospace,Consolas,monospace;margin:2cm}h1{font:600 16px system-ui,sans-serif}ul{list-style:none;padding:0;columns:2}</style><h1>${title}</h1><ul>${codes.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
            frame.addEventListener('load', () => { frame.contentWindow.print(); setTimeout(() => frame.remove(), 1000); });
            document.body.append(frame);
            return;
          }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([text + '\n'], { type: 'text/plain' }));
          a.download = btn.dataset.filename || 'recovery-codes.txt';
          a.click();
          URL.revokeObjectURL(a.href);
        });
    </script>
@endonce
