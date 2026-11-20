{{-- OmniaCSS color field (native picker + hex text input). Props: label, id, name, value. Attributes go to the text input.
     Contrast check (as in React / Vue): contrast-against (list of ['name' => 'the light page', 'color' => '#ffffff']: the color on
     each background, at least 3:1), contrast (the report also without backgrounds: only text on the color, at least 4.5:1),
     contrast-labels (['text', 'against' ("{name}" = the background), 'ok', 'low']). The server measures hex colors; the
     script below measures again while the customer picks. --}}
@props(['label' => null, 'id' => null, 'name' => null, 'value' => null, 'contrast' => false, 'contrastAgainst' => [], 'contrastLabels' => []])
@php
    $id = $id ?: 'oc-color-'.substr(md5(uniqid('', true)), 0, 6);
    $L = array_merge(['text' => 'Text on this color', 'against' => 'On {name}', 'ok' => 'OK', 'low' => 'Too low'], (array) $contrastLabels);
    $against = array_values(array_filter((array) $contrastAgainst, fn ($b) => is_array($b) && isset($b['name'], $b['color'])));
    $report = $contrast || count($against) > 0;
    $checks = [];
    if ($report && is_string($value) && \Omniacss\Laravel\Color::toRgb($value)) {
        $on = \Omniacss\Laravel\Color::pickOnColor($value);
        $ratio = \Omniacss\Laravel\Color::contrastRatio($value, $on);
        $checks[] = ['label' => $L['text'], 'ratio' => $ratio, 'ok' => $ratio >= 4.5, 'bg' => $value, 'fg' => $on, 'dot' => null, 'min' => 4.5];
        foreach ($against as $b) {
            $r = \Omniacss\Laravel\Color::contrastRatio($value, (string) $b['color']);
            if ($r !== null) {
                $checks[] = ['label' => str_replace('{name}', $b['name'], $L['against']), 'ratio' => $r, 'ok' => $r >= 3, 'bg' => $b['color'], 'fg' => null, 'dot' => $value, 'min' => 3];
            }
        }
    }
@endphp
<div class="oc-field">
    @if ($label)
        <label class="oc-field-label" for="{{ $id }}">{{ $label }}</label>
    @endif
    <div class="oc-color-field">
        <input type="color" @if ($value) value="{{ $value }}" @endif aria-label="Pick a color">
        <input {{ $attributes->merge(['class' => 'oc-input', 'type' => 'text', 'id' => $id, 'name' => $name, 'value' => $value, 'aria-label' => $label ?? 'Color value']) }}>
        @if (count($checks))
            <ul class="oc-color-field-report" aria-live="polite" data-ok="{{ $L['ok'] }}" data-low="{{ $L['low'] }}" data-light="#ffffff" data-dark="#0b1020">
                @foreach ($checks as $c)
                    <li class="oc-color-field-check" data-ok="{{ $c['ok'] ? 'true' : 'false' }}" data-min="{{ $c['min'] }}"@if ($c['dot']) data-bg="{{ $c['bg'] }}"@endif><span class="oc-color-field-sample" aria-hidden="true" style="background: {{ $c['bg'] }}@if ($c['fg']); color: {{ $c['fg'] }}@endif">@if ($c['dot'])<i style="background: {{ $c['dot'] }}"></i>@else{{ 'Aa' }}@endif</span><span>{{ $c['label'] }}</span><span class="oc-color-field-ratio">{{ number_format($c['ratio'], 1) }}:1 · {{ $c['ok'] ? $L['ok'] : $L['low'] }}</span></li>
                @endforeach
            </ul>
        @endif
    </div>
</div>
@once
    <script>
        document.addEventListener('input', (e) => {
            const field = e.target.closest('.oc-color-field');
            if (!field) return;
            const picker = field.querySelector('input[type=color]');
            const text = field.querySelector('input.oc-input');
            if (e.target === picker) { text.value = picker.value; text.dispatchEvent(new Event('input', { bubbles: true })); }
            else if (/^#[0-9a-fA-F]{6}$/.test(text.value)) { picker.value = text.value; }
            // Contrast report: measure again for a valid hex color (same math as contrastRatio / pickOnColor).
            const report = field.querySelector('.oc-color-field-report');
            if (!report || !/^#[0-9a-fA-F]{6}$/.test(text.value)) return;
            const channels = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
            const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
            const ratio = (a, b) => { const [x, y] = [lum(channels(a)), lum(channels(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
            const color = text.value.toLowerCase();
            const { light, dark } = report.dataset;
            const on = ratio(color, light) >= ratio(color, dark) ? light : dark;
            for (const li of report.children) {
                const bg = li.dataset.bg;
                if (bg && !/^#[0-9a-fA-F]{6}$/.test(bg)) continue;
                const r = bg ? ratio(color, bg) : ratio(color, on);
                const ok = r >= Number(li.dataset.min || 3);
                const sample = li.querySelector('.oc-color-field-sample');
                if (bg) sample.querySelector('i').style.background = color;
                else { sample.style.background = color; sample.style.color = on; }
                li.dataset.ok = String(ok);
                li.querySelector('.oc-color-field-ratio').textContent = r.toFixed(1) + ':1 · ' + (ok ? report.dataset.ok : report.dataset.low);
            }
        });
    </script>
@endonce
