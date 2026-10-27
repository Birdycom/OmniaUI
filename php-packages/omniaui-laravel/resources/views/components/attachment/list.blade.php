{{-- File: resources/views/components/attachment/list.blade.php | Map: props + demo files -> ul (li > chip) or div of chips
     Wrapping row of file chips. Props: items (array of <x-oc::attachment> props; demo files when empty), stack (one per line),
     as (ul|div), label. Slot: default replaces the items. --}}
@props([
    'items' => [
        ['name' => 'Quote kitchen Dewitte v2.pdf', 'size' => '1.2 MB', 'href' => '#quote.pdf'],
        ['name' => 'Measurements ground floor.xlsx', 'size' => '86 KB', 'href' => '#measurements.xlsx'],
        ['name' => 'Contract addendum.docx', 'size' => '240 KB', 'href' => '#contract.docx'],
        ['name' => 'Plans architect.zip', 'size' => '14.8 MB', 'href' => '#plans.zip'],
    ],
    'stack' => false,
    'as' => 'ul',
    'label' => 'Files in this message',
])
<{{ $as }} {{ $attributes->class(['oc-attachment-list', 'oc-attachment-list--stack' => $stack])->merge(['aria-label' => $label]) }}>
    @if ($slot->isEmpty())
        @foreach ($items as $file)
            @if ($as === 'ul')<li>@endif
            <x-oc::attachment :name="$file['name']" :size="$file['size'] ?? null" :type="$file['type'] ?? null" :ext="$file['ext'] ?? null" :href="$file['href'] ?? null" :image="$file['image'] ?? null" :state="$file['state'] ?? null" :progress="$file['progress'] ?? 0" :removable="$file['removable'] ?? false" :remove-label="$file['removeLabel'] ?? null" />
            @if ($as === 'ul')</li>@endif
        @endforeach
    @else
        {{ $slot }}
    @endif
</{{ $as }}>
