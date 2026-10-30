{{-- File: resources/views/components/link-row.blade.php | Map: props -> ul.oc-link-row -> li > a per link, or the slot
     OmniaUI link row: a row of links under a card. External links get an arrow, github.com links the GitHub mark (CSS,
     by the href). Props: links (array of ['href' => …, 'label' => …]), tone (default|accent|muted), size (sm|default|lg).
     Slot: <li> items instead of links. --}}
@props(['links' => null, 'tone' => 'default', 'size' => 'default'])
<ul {{ $attributes->class([
    'oc-link-row',
    'oc-link-row--'.$tone => in_array($tone, ['accent', 'muted'], true),
    'oc-link-row--'.$size => in_array($size, ['sm', 'lg'], true),
]) }}>
@if (is_array($links))
    @foreach ($links as $link)
        <li><a href="{{ $link['href'] }}" @if (preg_match('#^https?://#', $link['href'])) rel="noopener" @endif>{{ $link['label'] }}</a></li>
    @endforeach
@else
    {{ $slot }}
@endif
</ul>
