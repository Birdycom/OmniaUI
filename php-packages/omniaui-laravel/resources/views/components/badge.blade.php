{{-- OmniaCSS badge. Props: variant (default|secondary|outline|destructive|success|warning|info|module|readonly), icon (webicon name before
     the text; :icon="false" hides the icon of a status), title (tooltip; on a badge without text also its accessible name: role="img" +
     aria-label), module (0.17.0: data-module, blue|green|purple|gold|cyan|pink|red|orange|teal|slate or your own name; a default badge
     takes the solid module colour, variant="module" the soft tint, also from a module on an ancestor).
     status (0.18.0): paid|pending|overdue|draft|sent|cancelled|approved|rejected|active|inactive|archived|failed|refunded|scheduled|
     in-progress|done|read-only|working|waiting|error|idle: .oc-badge--status + data-status, its webicon and its English label (the slot
     replaces the label). variant="readonly" (0.18.0): a read-only value chip; the text is cut off with an ellipsis. Slot: text. --}}
@props(['variant' => 'default', 'status' => null, 'icon' => null, 'title' => null, 'module' => null])
@php
    // Label and webicon per status (same list as the React and Vue badge); the colour comes from the CSS (data-status).
    $statuses = [
        'paid' => ['Paid', 'mdi:check-circle-outline'], 'pending' => ['Pending', 'mdi:clock-outline'],
        'overdue' => ['Overdue', 'mdi:alert-circle-outline'], 'draft' => ['Draft', 'mdi:pencil-outline'],
        'sent' => ['Sent', 'mdi:send-outline'], 'cancelled' => ['Cancelled', 'mdi:cancel'],
        'approved' => ['Approved', 'mdi:check-decagram-outline'], 'rejected' => ['Rejected', 'mdi:close-circle-outline'],
        'active' => ['Active', 'mdi:circle-medium'], 'inactive' => ['Inactive', 'mdi:circle-off-outline'],
        'archived' => ['Archived', 'mdi:archive-outline'], 'failed' => ['Failed', 'mdi:alert-octagon-outline'],
        'refunded' => ['Refunded', 'mdi:cash-refund'], 'scheduled' => ['Scheduled', 'mdi:calendar-clock-outline'],
        'in-progress' => ['In progress', 'mdi:progress-clock'], 'done' => ['Done', 'mdi:check'],
        'read-only' => ['Read-only', 'mdi:lock-outline'], 'working' => ['Working', 'mdi:progress-clock'],
        'waiting' => ['Waiting', 'mdi:timer-sand'], 'error' => ['Error', 'mdi:alert-circle-outline'], 'idle' => ['Idle', 'mdi:sleep'],
    ];
    $preset = $status ? ($statuses[$status] ?? null) : null;
    $shownIcon = $icon === null ? ($preset[1] ?? null) : ($icon ?: null);
    $text = trim((string) $slot);
    $label = $text !== '' ? null : ($preset[0] ?? null);
    $kind = $status ? 'status' : $variant;
    $iconOnly = $shownIcon && $text === '' && $label === null;
    $wrap = $kind === 'readonly' && ($text !== '' || $label !== null);
@endphp
<span {{ $attributes->class(['oc-badge', 'oc-badge--'.$kind => ! in_array($kind, ['default', 'primary', null, ''], true)])->merge(array_filter(['title' => $title, 'data-status' => $status, 'data-module' => $module, 'role' => $iconOnly && $title ? 'img' : null, 'aria-label' => $iconOnly && $title ? $title : null])) }}>@if ($shownIcon)<x-oc::webicon :name="$shownIcon" bare fallback="iconify" />@endif{!! $wrap ? '<span>' : '' !!}{{ $label ?? $slot }}{!! $wrap ? '</span>' : '' !!}</span>
