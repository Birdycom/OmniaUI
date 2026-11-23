{{-- File: resources/views/components/header-settings.blade.php | Map: props -> group (language menu compact + theme toggle + slot)
     OmniaUI header settings (0.17.0): language and theme of an app header as one group of round ghost buttons with tooltips.
     Props: languages (value => ['label', 'href']), language (current), language-label, theme (true: the toggle; needs theme.js),
     theme-labels, label ('Settings'). Slot: more buttons. --}}
@props(['languages' => [], 'language' => null, 'languageLabel' => 'Language', 'theme' => true, 'themeLabels' => [], 'label' => 'Settings'])
<div {{ $attributes->class(['oc-header-settings'])->merge(['role' => 'group', 'aria-label' => $label]) }}>
    @if (count($languages))
        <x-oc::language-menu :options="$languages" :value="$language" :label="$languageLabel" compact ghost flags="auto" />
    @endif
    @if ($theme)
        <x-oc::theme-toggle :labels="$themeLabels" />
    @endif
    {{ $slot }}
</div>
