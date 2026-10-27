{{-- File: resources/views/components/top-progress.blade.php | Map: progress.oc-top-progress (+ tone / size / static modifiers)
     OmniaUI top progress: thin loading bar fixed to the top. Needs @birdycom/omniaui CSS.
     Props: value + max (determinate; leave empty for indeterminate), tone (success|warning|danger|brand),
            lg (4px), static (in the normal flow), label (aria-label), hidden (start hidden; your script toggles it). --}}
@props(['value' => null, 'max' => 100, 'tone' => null, 'lg' => false, 'static' => false, 'label' => 'Loading', 'hidden' => false])
<progress {{ $attributes->class([
    'oc-top-progress',
    'oc-top-progress--'.$tone => in_array($tone, ['success', 'warning', 'danger', 'brand'], true),
    'oc-top-progress--lg' => $lg,
    'oc-top-progress--static' => $static,
])->merge(['aria-label' => $label]) }} @if ($value !== null) value="{{ $value }}" max="{{ $max }}" @endif @if ($hidden) hidden @endif></progress>
