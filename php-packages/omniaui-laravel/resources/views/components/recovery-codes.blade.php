{{-- OmniaCSS recovery codes panel. Props: codes (list of strings), title, warning, copy / download (button labels). Slot: replaces the action buttons. --}}
@props(['codes' => [], 'title' => 'Recovery codes', 'warning' => 'Store these codes somewhere safe. Each code works once.', 'copy' => 'Copy all', 'download' => 'Download .txt'])
<div {{ $attributes->class(['oc-recovery-codes']) }}>
    <h3 class="oc-recovery-codes-title">{{ $title }}</h3>
    <p class="oc-recovery-codes-warning">{{ $warning }}</p>
    <ul class="oc-recovery-codes-list">
        @foreach ($codes as $code)
            <li>{{ $code }}</li>
        @endforeach
    </ul>
    <div class="oc-recovery-codes-actions">
        @if ($slot->isEmpty())
            <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-recovery="copy">{{ $copy }}</button>
            <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-recovery="download">{{ $download }}</button>
        @else
            {{ $slot }}
        @endif
    </div>
</div>
@once
    <script>
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-oc-recovery]');
            if (!btn) return;
            const text = Array.from(btn.closest('.oc-recovery-codes').querySelectorAll('.oc-recovery-codes-list li')).map((li) => li.textContent.trim()).join('\n');
            if (btn.dataset.ocRecovery === 'copy') { navigator.clipboard.writeText(text); return; }
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
            a.download = 'recovery-codes.txt';
            a.click();
            URL.revokeObjectURL(a.href);
        });
    </script>
@endonce
