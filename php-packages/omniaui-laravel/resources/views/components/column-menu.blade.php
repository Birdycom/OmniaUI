{{-- File: resources/views/components/column-menu.blade.php | Map: scope -> toolbar trigger -> popover (title, form with one checkbox per column, reset) -> default slot (the table)
     OmniaUI column menu: an unchecked [data-col="n"] hides column n (1-10) of the table in the slot. Needs @birdycom/omniaui CSS.
     Props: id (required, popover id), columns (list of ['label' => ..., 'visible' => bool, 'locked' => bool] or plain labels),
            trigger, title, reset (labels).
     Slot: the .oc-table (or .oc-table-wrap) the menu controls. --}}
@props(['id', 'columns' => [], 'trigger' => 'Columns', 'title' => 'Visible columns', 'reset' => 'Reset'])
<div {{ $attributes->class(['oc-column-menu-scope']) }}>
    <div class="oc-table-toolbar">
        <span class="oc-table-toolbar-spacer"></span>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" popovertarget="{{ $id }}">{{ $trigger }}</button>
    </div>
    <div class="oc-column-menu" id="{{ $id }}" popover>
        <p class="oc-column-menu-title">{{ $title }}</p>
        <form class="oc-column-menu-list">
            @foreach ($columns as $i => $col)
                @php($col = is_array($col) ? $col : ['label' => $col])
                @php($locked = (bool) ($col['locked'] ?? false))
                <label class="oc-column-menu-item"><input type="checkbox" data-col="{{ $loop->iteration }}" @checked($locked || ($col['visible'] ?? true)) @disabled($locked)> {{ $col['label'] }}</label>
            @endforeach
            <div class="oc-column-menu-footer">
                <button class="oc-btn oc-btn--ghost oc-btn--sm" type="reset">{{ $reset }}</button>
            </div>
        </form>
    </div>
    {{ $slot }}
</div>
