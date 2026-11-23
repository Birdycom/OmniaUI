{{-- File: resources/views/components/demo-panel.blade.php | Map: div.oc-demo -> title -> radio tablist (tabs) -> preview (slot) -> code
     OmniaUI demo panel: live preview with its code, stacked or in Preview / Code tabs (packages/ui/snippets/demo-panel.html). The tabs are
     two radios, no JavaScript. Props: code (string, escaped in pre.oc-code-window__body), title, tabs (default true), preview-label, code-label,
     label (aria-label of the tabs), name (radio name, generated when empty), view (preview|code: the open tab), tall, center.
     Slots: default (the preview), code (a highlighted block instead of the string). --}}
@props(['code' => null, 'title' => null, 'tabs' => true, 'previewLabel' => 'Preview', 'codeLabel' => 'Code', 'label' => 'View', 'name' => null, 'view' => 'preview', 'tall' => false, 'center' => false])
@php
    $name = $name ?: 'oc-demo-'.substr(md5(uniqid('', true)), 0, 8);
    $hasCode = isset($code) && $code !== '';
@endphp
<div {{ $attributes->class(['oc-demo', 'oc-demo--tabs' => $tabs]) }}>
    @if ($title)
        <p class="oc-preview__title">{{ $title }}</p>
    @endif
    @if ($tabs)
        <div class="oc-demo__tablist" role="radiogroup" aria-label="{{ $label }}">
            <label class="oc-demo__tab"><input type="radio" name="{{ $name }}" @checked($view !== 'code')> {{ $previewLabel }}</label>
            <label class="oc-demo__tab"><input type="radio" name="{{ $name }}" @checked($view === 'code')> {{ $codeLabel }}</label>
        </div>
    @endif
    <div @class(['oc-demo__preview', 'oc-demo__preview--tall' => $tall, 'oc-demo__preview--center' => $center])>{{ $slot }}</div>
    @if ($code instanceof \Illuminate\View\ComponentSlot)
        <div class="oc-demo__code">{{ $code }}</div>
    @elseif ($hasCode)
        <div class="oc-demo__code"><pre class="oc-code-window__body"><code>{{ $code }}</code></pre></div>
    @endif
</div>
