{{-- File: resources/views/components/code-window.blade.php | Map: props -> bar (three dots, title, copy button) -> body (plain code or slot) -> copy script (once)
     OmniaUI code window (0.17.0): a window frame around code with a copy button (same markup as
     packages/ui/snippets/code-window.html). Props: title (file name), code (plain code in pre.oc-code-window__body),
     copy (default true), copy-label ("Copy"), copied-label ("Copied"), dark (always dark), id. Slot: replaces the body
     (e.g. an .oc-code-block with highlighted code); its text is copied. --}}
@props(['title' => null, 'code' => null, 'copy' => true, 'copyLabel' => 'Copy', 'copiedLabel' => 'Copied', 'dark' => false, 'id' => null])
@php($id = $id ?: 'oc-code-'.substr(md5(uniqid('', true)), 0, 6))
<div {{ $attributes->class(['oc-code-window', 'oc-code-window--dark' => $dark]) }}>
    <div class="oc-code-window__bar">
        <i></i><i></i><i></i>
        @if ($title !== null)
            <span class="oc-code-window__title">{{ $title }}</span>
        @endif
        @if ($copy)
            <button type="button" class="oc-code-copy" data-oc-copy="#{{ $id }}" data-copied="{{ $copiedLabel }}">{{ $copyLabel }}</button>
        @endif
    </div>
    @if (! $slot->isEmpty())
        <div id="{{ $id }}">{{ $slot }}</div>
    @else
        <pre class="oc-code-window__body"><code id="{{ $id }}">{{ $code }}</code></pre>
    @endif
</div>
@once
    <script>
        // Copy button of .oc-code-window: copies the text of its target, says "Copied" for a moment.
        document.addEventListener("click", async (e) => {
            const b = e.target.closest("[data-oc-copy]"); if (!b || b.classList.contains("is-copied")) return;
            await navigator.clipboard.writeText(document.querySelector(b.dataset.ocCopy).textContent);
            const label = b.textContent;
            b.classList.add("is-copied"); b.textContent = b.dataset.copied || "Copied";
            setTimeout(() => { b.classList.remove("is-copied"); b.textContent = label; }, 1500);
        });
    </script>
@endonce
