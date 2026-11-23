{{-- OmniaUI block: route-steps - Ordered list of the steps of a route or course in an editor: order numbers that follow the order, drag handle, thumb, tags, status and a menu per step. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/route-steps.html | Map: head -> tools (search + kind chips) -> ol of steps (grip, main button, status, menu popover) -> empty line -> foot -> status line -> optional script
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-route-steps: Frame (container query: status under the name below 26rem, tools side by side from 34rem)
       .oc-block-route-steps-head / -title / -count: Heading and the number of steps
       .oc-block-route-steps-tools: Search (.oc-block-route-steps-search in an .oc-input-group--affix) and kind chips (.oc-chip-filter.oc-block-route-steps-kinds, radios; value = one or more data-kind values)
       .oc-block-route-steps-list: ol; the counter oc-route-step numbers the steps
       .oc-block-route-steps-item[data-id][data-kind]: One step. States: .is-dragging, .is-drop-before, .is-drop-after, .is-filtered (collapsed but still counted)
       .oc-sortable-row-grip: Drag handle (free component). Click it, then the arrow keys move the step; Enter or Escape drops it
       .oc-block-route-steps-main: Button with -thumb, -text (-name, -meta). aria-current="true" = the step open in the editor
       .oc-block-route-steps-thumb: Icon thumb (--oc-step-color tints the icon). Modifier --num: shows the order number (and counts); with an img or svg inside: photo + small number
       .oc-block-route-steps-status: Status badge (.oc-badge--success / --warning / --outline / --secondary)
       .oc-block-route-steps-menu + .oc-dropdown-menu[popover]: Menu with data-action="up" | "down" | "duplicate" | "remove"
       .oc-block-route-steps-foot: Add buttons
       .oc-block-route-steps-status-line: Live region; the script says what moved
     Without the script the steps are plain buttons and the menu opens (popover); nothing moves or filters.
     The script filters, selects, moves, duplicates and removes, and fires "oc-route-steps-change" ({ action, id, order })
     and "oc-route-steps-select" ({ id }) on the frame.
     Blade: <x-oc::block.route-steps> - attributes merge onto the root element. Written by hand (0.17.0), prop names as in the React block.
     Props: title, count, locked (the order cannot change: class --locked, a lock line, grips disabled, no move items), locked-label
       ('Order locked'), steps (array of rows: id, name, meta (list), kind, numbered (default true; false: icon thumb), icon, color,
       image (img or svg in the thumb), status, statusTone, statusTooltip, badges (list of strings or ['label', 'tone']), attributes
       (extra attributes on the main button, e.g. wire:click)), selected (id: aria-current), search (default true with steps),
       search-label, kinds (array of ['value', 'label'], "All" first), actions (menu per step, default true), empty-text, title-id.
       Without steps the snippet rows, tools and add buttons show (the default slot replaces the rows).
     Blade slots (they win over the props; each falls back to the snippet content when empty): title, count, footer, default.
--}}
@props([
    'title' => null, 'count' => null, 'footer' => null, 'locked' => false, 'lockedLabel' => 'Order locked', 'steps' => null,
    'selected' => null, 'search' => null, 'searchLabel' => 'Search steps', 'kinds' => null, 'actions' => true,
    'emptyText' => 'No step matches your search.', 'titleId' => 'oc-rsteps-title',
])
@php
    $rows = is_array($steps);
    $data = $rows || $search !== null || $kinds !== null;
    $useSearch = $search ?? true;
    $kindList = is_array($kinds) ? $kinds : [];
    $bag = fn ($a) => new \Illuminate\View\ComponentAttributeBag(is_array($a) ? $a : []);
@endphp
<section {{ $attributes->merge(['class' => 'oc-block-route-steps'.($locked ? ' oc-block-route-steps--locked' : ''), 'aria-labelledby' => $titleId]) }}>
  <div class="oc-block-route-steps-head">
    <h2 class="oc-block-route-steps-title" id="{{ $titleId }}">
        @if (isset($title) && trim((string) $title) !== '')
            {{ $title }}
        @else
        Steps of Route 1
        @endif
    </h2>
    @if (! $rows || (isset($count) && trim((string) $count) !== ''))
    <span class="oc-block-route-steps-count">
        @if (isset($count) && trim((string) $count) !== '')
            {{ $count }}
        @else
        7 steps · 4 count
        @endif
    </span>
    @endif
    @if ($locked)
    <span class="oc-block-route-steps-lock">{{ $lockedLabel }}</span>
    @endif
  </div>
  @if ($data)
  @if ($useSearch || count($kindList) > 0)
  <div class="oc-block-route-steps-tools">
    @if ($useSearch)
    <div class="oc-input-group oc-input-group--affix">
      <span class="oc-input-addon" aria-hidden="true"><x-oc::webicon name="mdi:magnify" bare fallback="iconify" /></span>
      <input class="oc-input oc-block-route-steps-search" type="search" placeholder="{{ $searchLabel }}" aria-label="{{ $searchLabel }}">
    </div>
    @endif
    @if (count($kindList) > 0)
    <fieldset class="oc-chip-filter oc-chip-filter--sm oc-block-route-steps-kinds" aria-label="Kind">
      @foreach ([['value' => 'all', 'label' => 'All'], ...$kindList] as $k)
      <label class="oc-chip-filter-item"><input type="radio" name="{{ $titleId }}-kind" value="{{ $k['value'] }}" @checked($loop->first)> {{ $k['label'] }}</label>
      @endforeach
    </fieldset>
    @endif
  </div>
  @endif
  @else
  <div class="oc-block-route-steps-tools">
    <div class="oc-input-group oc-input-group--affix">
      <span class="oc-input-addon" aria-hidden="true"><x-oc::webicon name="mdi:magnify" bare fallback="iconify" /></span>
      <input class="oc-input oc-block-route-steps-search" type="search" placeholder="Search steps" aria-label="Search steps">
    </div>
    <fieldset class="oc-chip-filter oc-chip-filter--sm oc-block-route-steps-kinds" aria-label="Kind">
      <label class="oc-chip-filter-item"><input type="radio" name="oc-rsteps-kind" value="all" checked> All</label>
      <label class="oc-chip-filter-item"><input type="radio" name="oc-rsteps-kind" value="step"> Steps</label>
      <label class="oc-chip-filter-item"><input type="radio" name="oc-rsteps-kind" value="photo"> Photo tasks</label>
      <label class="oc-chip-filter-item"><input type="radio" name="oc-rsteps-kind" value="intro finish"> Start and finish</label>
    </fieldset>
  </div>
  @endif
  <ol class="oc-block-route-steps-list" aria-label="Steps in route order">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @elseif ($rows)
          @foreach ($steps as $i => $s)
              @php
                  $n = (string) ($s['name'] ?? '');
                  $menuId = $titleId.'-menu-'.$loop->iteration;
                  $tone = $s['statusTone'] ?? $s['tone'] ?? null;
                  $image = $s['image'] ?? null;
              @endphp
    <li class="oc-block-route-steps-item" data-id="{{ $s['id'] ?? $i }}" @isset($s['kind']) data-kind="{{ $s['kind'] }}" @endisset>
      <button class="oc-sortable-row-grip" type="button" aria-label="Move {{ $n }}" @if ($locked) disabled @else aria-pressed="false" @endif></button>
      <button {{ $bag($s['attributes'] ?? [])->merge(['class' => 'oc-block-route-steps-main', 'type' => 'button', 'aria-current' => $selected !== null && (string) $selected === (string) ($s['id'] ?? $i) ? 'true' : null]) }}>
        @if ($s['numbered'] ?? true)
        <span class="oc-block-route-steps-thumb oc-block-route-steps-thumb--num">{{ $image }}</span>
        @else
        <span class="oc-block-route-steps-thumb" @isset($s['color']) style="--oc-step-color: {{ $s['color'] }}" @endisset>@if ($image){{ $image }}@elseif (isset($s['icon']))<x-oc::webicon :name="$s['icon']" bare fallback="iconify" />@endif</span>
        @endif
        <span class="oc-block-route-steps-text"><span class="oc-block-route-steps-name">{{ $n }}</span>@if (! empty($s['meta']))<span class="oc-block-route-steps-meta">@foreach ($s['meta'] as $m)<span>{{ $m }}</span>@endforeach</span>@endif @if (! empty($s['badges']))<span class="oc-block-route-steps-badges">@foreach ($s['badges'] as $b)<span @class(['oc-badge', 'oc-badge--'.(is_array($b) ? ($b['tone'] ?? 'outline') : 'outline')])>{{ is_array($b) ? $b['label'] : $b }}</span>@endforeach</span>@endif</span>
      </button>
      @isset($s['status'])
      @if (! empty($s['statusTooltip']))
      <span class="oc-block-route-steps-status oc-tooltip oc-tooltip--left" data-tooltip="{{ $s['statusTooltip'] }}" tabindex="0"><span @class(['oc-badge', 'oc-badge--'.$tone => $tone])>{{ $s['status'] }}</span></span>
      @else
      <span @class(['oc-badge', 'oc-badge--'.$tone => $tone, 'oc-block-route-steps-status'])>{{ $s['status'] }}</span>
      @endif
      @endisset
      @if ($actions)
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popovertarget="{{ $menuId }}" aria-label="Actions for {{ $n }}"><x-oc::webicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
      <div class="oc-dropdown-menu" id="{{ $menuId }}" popover>
        @unless ($locked)
        <button class="oc-dropdown-item" type="button" data-action="up" popovertarget="{{ $menuId }}" popovertargetaction="hide" @disabled($loop->first)><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
        <button class="oc-dropdown-item" type="button" data-action="down" popovertarget="{{ $menuId }}" popovertargetaction="hide" @disabled($loop->last)><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
        @endunless
        <button class="oc-dropdown-item" type="button" data-action="duplicate" popovertarget="{{ $menuId }}" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" data-action="remove" popovertarget="{{ $menuId }}" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
      </div>
      @endif
    </li>
          @endforeach
      @else
    <li class="oc-block-route-steps-item" data-id="s1" data-kind="intro">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Welcome" aria-pressed="false"></button>
      <button class="oc-block-route-steps-main" type="button">
        <span class="oc-block-route-steps-thumb" style="--oc-step-color: var(--color-indigo-60)"><x-oc::webicon name="mdi:play-circle-outline" bare fallback="iconify" /></span>
        <span class="oc-block-route-steps-text"><span class="oc-block-route-steps-name">Welcome</span><span class="oc-block-route-steps-meta"><span>Intro</span><span>does not count</span></span></span>
      </button>
      <span class="oc-badge oc-badge--secondary oc-block-route-steps-status">Ready</span>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popovertarget="oc-rsteps-menu-1" aria-label="Actions for Welcome"><x-oc::webicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
      <div class="oc-dropdown-menu" id="oc-rsteps-menu-1" popover>
        <button class="oc-dropdown-item" type="button" data-action="up" popovertarget="oc-rsteps-menu-1" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
        <button class="oc-dropdown-item" type="button" data-action="down" popovertarget="oc-rsteps-menu-1" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
        <button class="oc-dropdown-item" type="button" data-action="duplicate" popovertarget="oc-rsteps-menu-1" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" data-action="remove" popovertarget="oc-rsteps-menu-1" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
      </div>
    </li>
    <li class="oc-block-route-steps-item" data-id="s2" data-kind="step">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Old gate" aria-pressed="false"></button>
      <button class="oc-block-route-steps-main" type="button" aria-current="true">
        <span class="oc-block-route-steps-thumb oc-block-route-steps-thumb--num"></span>
        <span class="oc-block-route-steps-text"><span class="oc-block-route-steps-name">Old gate</span><span class="oc-block-route-steps-meta"><span>Question</span><span>20 points</span></span></span>
      </button>
      <span class="oc-badge oc-badge--success oc-block-route-steps-status">Ready</span>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popovertarget="oc-rsteps-menu-2" aria-label="Actions for Old gate"><x-oc::webicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
      <div class="oc-dropdown-menu" id="oc-rsteps-menu-2" popover>
        <button class="oc-dropdown-item" type="button" data-action="up" popovertarget="oc-rsteps-menu-2" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
        <button class="oc-dropdown-item" type="button" data-action="down" popovertarget="oc-rsteps-menu-2" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
        <button class="oc-dropdown-item" type="button" data-action="duplicate" popovertarget="oc-rsteps-menu-2" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" data-action="remove" popovertarget="oc-rsteps-menu-2" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
      </div>
    </li>
    <li class="oc-block-route-steps-item" data-id="s3" data-kind="step">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Market square" aria-pressed="false"></button>
      <button class="oc-block-route-steps-main" type="button">
        <span class="oc-block-route-steps-thumb oc-block-route-steps-thumb--num"><svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" class="oc-block-art-sky"/><circle cx="30" cy="11" r="5" class="oc-block-art-sun"/><path d="M0 40V28l10-8 9 7 7-5 14 10v8z" class="oc-block-art-land"/></svg></span>
        <span class="oc-block-route-steps-text"><span class="oc-block-route-steps-name">Market square</span><span class="oc-block-route-steps-meta"><span>Question</span><span>20 points</span></span></span>
      </button>
      <span class="oc-badge oc-badge--success oc-block-route-steps-status">Ready</span>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popovertarget="oc-rsteps-menu-3" aria-label="Actions for Market square"><x-oc::webicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
      <div class="oc-dropdown-menu" id="oc-rsteps-menu-3" popover>
        <button class="oc-dropdown-item" type="button" data-action="up" popovertarget="oc-rsteps-menu-3" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
        <button class="oc-dropdown-item" type="button" data-action="down" popovertarget="oc-rsteps-menu-3" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
        <button class="oc-dropdown-item" type="button" data-action="duplicate" popovertarget="oc-rsteps-menu-3" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" data-action="remove" popovertarget="oc-rsteps-menu-3" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
      </div>
    </li>
    <li class="oc-block-route-steps-item" data-id="s4" data-kind="step">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Town hall" aria-pressed="false"></button>
      <button class="oc-block-route-steps-main" type="button">
        <span class="oc-block-route-steps-thumb oc-block-route-steps-thumb--num"></span>
        <span class="oc-block-route-steps-text"><span class="oc-block-route-steps-name">Town hall</span><span class="oc-block-route-steps-meta"><span>Text only</span></span></span>
      </button>
      <span class="oc-badge oc-badge--warning oc-block-route-steps-status">No question</span>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popovertarget="oc-rsteps-menu-4" aria-label="Actions for Town hall"><x-oc::webicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
      <div class="oc-dropdown-menu" id="oc-rsteps-menu-4" popover>
        <button class="oc-dropdown-item" type="button" data-action="up" popovertarget="oc-rsteps-menu-4" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
        <button class="oc-dropdown-item" type="button" data-action="down" popovertarget="oc-rsteps-menu-4" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
        <button class="oc-dropdown-item" type="button" data-action="duplicate" popovertarget="oc-rsteps-menu-4" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" data-action="remove" popovertarget="oc-rsteps-menu-4" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
      </div>
    </li>
    <li class="oc-block-route-steps-item" data-id="s5" data-kind="step">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move River bridge" aria-pressed="false"></button>
      <button class="oc-block-route-steps-main" type="button">
        <span class="oc-block-route-steps-thumb oc-block-route-steps-thumb--num"></span>
        <span class="oc-block-route-steps-text"><span class="oc-block-route-steps-name">River bridge</span><span class="oc-block-route-steps-meta"><span>Question</span><span>10 points</span></span></span>
      </button>
      <span class="oc-badge oc-badge--outline oc-block-route-steps-status">Draft</span>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popovertarget="oc-rsteps-menu-5" aria-label="Actions for River bridge"><x-oc::webicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
      <div class="oc-dropdown-menu" id="oc-rsteps-menu-5" popover>
        <button class="oc-dropdown-item" type="button" data-action="up" popovertarget="oc-rsteps-menu-5" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
        <button class="oc-dropdown-item" type="button" data-action="down" popovertarget="oc-rsteps-menu-5" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
        <button class="oc-dropdown-item" type="button" data-action="duplicate" popovertarget="oc-rsteps-menu-5" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" data-action="remove" popovertarget="oc-rsteps-menu-5" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
      </div>
    </li>
    <li class="oc-block-route-steps-item" data-id="s6" data-kind="photo">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Team photo" aria-pressed="false"></button>
      <button class="oc-block-route-steps-main" type="button">
        <span class="oc-block-route-steps-thumb" style="--oc-step-color: var(--color-teal-60)"><x-oc::webicon name="mdi:camera-outline" bare fallback="iconify" /></span>
        <span class="oc-block-route-steps-text"><span class="oc-block-route-steps-name">Team photo</span><span class="oc-block-route-steps-meta"><span>Photo task</span><span>does not count</span></span></span>
      </button>
      <span class="oc-badge oc-badge--success oc-block-route-steps-status">Ready</span>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popovertarget="oc-rsteps-menu-6" aria-label="Actions for Team photo"><x-oc::webicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
      <div class="oc-dropdown-menu" id="oc-rsteps-menu-6" popover>
        <button class="oc-dropdown-item" type="button" data-action="up" popovertarget="oc-rsteps-menu-6" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
        <button class="oc-dropdown-item" type="button" data-action="down" popovertarget="oc-rsteps-menu-6" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
        <button class="oc-dropdown-item" type="button" data-action="duplicate" popovertarget="oc-rsteps-menu-6" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" data-action="remove" popovertarget="oc-rsteps-menu-6" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
      </div>
    </li>
    <li class="oc-block-route-steps-item" data-id="s7" data-kind="finish">
      <button class="oc-sortable-row-grip" type="button" aria-label="Move Finish" aria-pressed="false"></button>
      <button class="oc-block-route-steps-main" type="button">
        <span class="oc-block-route-steps-thumb" style="--oc-step-color: var(--color-forestgreen-60)"><x-oc::webicon name="mdi:flag-checkered" bare fallback="iconify" /></span>
        <span class="oc-block-route-steps-text"><span class="oc-block-route-steps-name">Finish</span><span class="oc-block-route-steps-meta"><span>Check-in</span></span></span>
      </button>
      <span class="oc-badge oc-badge--success oc-block-route-steps-status">Ready</span>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-block-route-steps-menu" type="button" popovertarget="oc-rsteps-menu-7" aria-label="Actions for Finish"><x-oc::webicon name="mdi:dots-vertical" bare fallback="iconify" /></button>
      <div class="oc-dropdown-menu" id="oc-rsteps-menu-7" popover>
        <button class="oc-dropdown-item" type="button" data-action="up" popovertarget="oc-rsteps-menu-7" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-up" bare fallback="iconify" /></span>Move up</button>
        <button class="oc-dropdown-item" type="button" data-action="down" popovertarget="oc-rsteps-menu-7" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:arrow-down" bare fallback="iconify" /></span>Move down</button>
        <button class="oc-dropdown-item" type="button" data-action="duplicate" popovertarget="oc-rsteps-menu-7" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:content-copy" bare fallback="iconify" /></span>Duplicate</button>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item oc-dropdown-item--destructive" type="button" data-action="remove" popovertarget="oc-rsteps-menu-7" popovertargetaction="hide"><span class="oc-dropdown-icon" aria-hidden="true"><x-oc::webicon name="mdi:trash-can-outline" bare fallback="iconify" /></span>Delete</button>
      </div>
    </li>
      @endif
  </ol>
  @if ($rows)
  <p class="oc-block-route-steps-empty" @if (count($steps) > 0 || ! $slot->isEmpty()) hidden @endif>{{ $emptyText }}</p>
  @else
  <p class="oc-block-route-steps-empty" hidden>No step matches your search.</p>
  @endif
  @if (! $rows || (isset($footer) && trim((string) $footer) !== ''))
  <div class="oc-block-route-steps-foot">
      @if (isset($footer) && trim((string) $footer) !== '')
          {{ $footer }}
      @else
    <button class="oc-btn oc-btn--outline oc-btn--sm" type="button"><x-oc::webicon name="mdi:plus" bare fallback="iconify" /> Add step</button>
    <button class="oc-btn oc-btn--ghost oc-btn--sm" type="button"><x-oc::webicon name="mdi:camera-outline" bare fallback="iconify" /> Add photo task</button>
      @endif
  </div>
  @endif
  <p class="oc-block-route-steps-status-line oc-visually-hidden" aria-live="polite"></p>
</section>
@once
    <script>
      // Optional: filter, select, move (menu, drag, keyboard on the grip), duplicate and remove steps in every .oc-block-route-steps.
      document.querySelectorAll(".oc-block-route-steps").forEach((root) => {
        const list = root.querySelector(".oc-block-route-steps-list");
        const items = () => [...list.children];
        const label = (li) => li.querySelector(".oc-block-route-steps-name")?.textContent.trim() || "Step";
        const say = (text) => { const s = root.querySelector(".oc-block-route-steps-status-line"); if (s) s.textContent = text; };
        const fire = (type, detail) => root.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
        const changed = (action, li) => fire("oc-route-steps-change", { action, id: li?.dataset.id, order: items().map((x) => x.dataset.id) });
        let moving = false;
        const move = (li, to, focus) => {
          const all = items();
          if (to < 0 || to >= all.length || to === all.indexOf(li)) return;
          moving = true;
          to > all.indexOf(li) ? all[to].after(li) : all[to].before(li);
          moving = false;
          changed("move", li);
          say(`${label(li)}: position ${to + 1} of ${all.length}`);
          (focus || li.querySelector(".oc-block-route-steps-main")).focus();
        };
        const filter = () => {
          const q = (root.querySelector(".oc-block-route-steps-search")?.value || "").trim().toLowerCase();
          const kinds = (root.querySelector(".oc-block-route-steps-kinds input:checked")?.value || "all").split(" ");
          let shown = 0;
          items().forEach((li) => {
            const match = (kinds.includes("all") || kinds.includes(li.dataset.kind)) && li.textContent.toLowerCase().includes(q);
            li.classList.toggle("is-filtered", !match);
            if (match) shown++;
          });
          const empty = root.querySelector(".oc-block-route-steps-empty");
          if (empty) empty.hidden = shown > 0;
        };
        root.addEventListener("input", (e) => { if (e.target.closest(".oc-block-route-steps-tools")) filter(); });
        root.addEventListener("click", (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;
          const li = btn.closest(".oc-block-route-steps-item");
          const act = btn.dataset.action;
          if (btn.classList.contains("oc-block-route-steps-main")) {
            root.querySelectorAll(".oc-block-route-steps-main[aria-current]").forEach((b) => b.removeAttribute("aria-current"));
            btn.setAttribute("aria-current", "true");
            fire("oc-route-steps-select", { id: li.dataset.id });
          } else if (act === "up" || act === "down") move(li, items().indexOf(li) + (act === "up" ? -1 : 1));
          else if (act === "duplicate") {
            const copy = li.cloneNode(true);
            const menu = copy.querySelector("[popover]"), id = `${menu.id}-${Date.now()}`;
            copy.querySelectorAll(`[popovertarget="${menu.id}"]`).forEach((b) => b.setAttribute("popovertarget", id));
            menu.id = id;
            copy.dataset.id = `${li.dataset.id}-copy-${Date.now()}`;
            copy.querySelector(".oc-block-route-steps-name").textContent = `${label(li)} (copy)`;
            copy.querySelectorAll("[aria-label]").forEach((el) => el.setAttribute("aria-label", el.getAttribute("aria-label").replace(label(li), label(copy))));
            copy.querySelector(".oc-block-route-steps-main").removeAttribute("aria-current");
            li.after(copy);
            changed("duplicate", copy);
            say(`${label(copy)} added`);
            copy.querySelector(".oc-block-route-steps-main").focus();
          } else if (act === "remove") {
            const next = li.nextElementSibling || li.previousElementSibling;
            li.remove();
            changed("remove", li);
            say(`${label(li)} removed`);
            next?.querySelector(".oc-block-route-steps-main")?.focus();
          } else if (btn.classList.contains("oc-sortable-row-grip")) {
            btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
            if (btn.getAttribute("aria-pressed") === "true") say(`${label(li)} picked up. Use the arrow keys, then Enter.`);
          }
        });
        root.addEventListener("keydown", (e) => {
          const grip = e.target.closest('.oc-sortable-row-grip[aria-pressed="true"]');
          if (!grip) return;
          const li = grip.closest(".oc-block-route-steps-item");
          if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); move(li, items().indexOf(li) + (e.key === "ArrowUp" ? -1 : 1), grip); }
          else if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); grip.setAttribute("aria-pressed", "false"); say(`${label(li)} dropped`); }
        });
        root.addEventListener("focusout", (e) => { if (!moving && e.target.matches?.(".oc-sortable-row-grip")) e.target.setAttribute("aria-pressed", "false"); });
        // Drag with the mouse, only from the grip.
        let dragged = null;
        const clear = () => items().forEach((x) => x.classList.remove("is-drop-before", "is-drop-after"));
        root.addEventListener("pointerdown", (e) => { const g = e.target.closest(".oc-sortable-row-grip"); if (g) g.parentElement.draggable = true; });
        root.addEventListener("pointerup", () => { if (!dragged) items().forEach((x) => { x.draggable = false; }); });
        list.addEventListener("dragstart", (e) => { dragged = e.target.closest(".oc-block-route-steps-item"); dragged?.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragged?.dataset.id || ""); });
        list.addEventListener("dragover", (e) => {
          const over = e.target.closest(".oc-block-route-steps-item");
          if (!dragged || !over) return;
          e.preventDefault();
          clear();
          const r = over.getBoundingClientRect();
          if (over !== dragged) over.classList.add(e.clientY < r.top + r.height / 2 ? "is-drop-before" : "is-drop-after");
        });
        list.addEventListener("drop", (e) => {
          const over = list.querySelector(".is-drop-before, .is-drop-after");
          if (!dragged || !over) return;
          e.preventDefault();
          const all = items(), from = all.indexOf(dragged);
          let to = all.indexOf(over) + (over.classList.contains("is-drop-after") ? 1 : 0);
          if (to > from) to--;
          move(dragged, to);
        });
        list.addEventListener("dragend", () => { clear(); dragged?.classList.remove("is-dragging"); if (dragged) dragged.draggable = false; dragged = null; });
      });
    </script>
@endonce
