{{-- OmniaUI block: data-table - Card with title, actions, search toolbar, sortable table, bulk bar and pagination footer. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-card.oc-block-datatable: Card root
       .oc-block-datatable-head / -title / -description: Card header area
       .oc-block-datatable-body: Padded body
       .oc-table-toolbar: Search + filters row (.oc-table-toolbar-spacer pushes items right)
       .oc-filter-pills / .oc-filter-pill: Segmented link filters (aria-current="true")
       .oc-block-datatable-bulk: Selection bar (appears when rows are selected)
       .oc-table-wrap > .oc-table: Table with .oc-table-sort headers, .oc-table-actions cells (see Table)
       .oc-table-footer: Entries text, page-size select and .oc-pagination
     Slots: title, description, header actions, toolbar, table, footer
     Blade: <x-oc::block.data-table> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, description, actions, toolbar, table, footer.
--}}
@props(['title' => null, 'description' => null, 'actions' => null, 'toolbar' => null, 'table' => null, 'footer' => null])
<section {{ $attributes->merge(['class' => 'oc-card oc-block-datatable']) }}>
  <header class="oc-block-datatable-head">
    <div>
      <h2 class="oc-block-datatable-title">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Contacts
          @endif
      </h2>
      <p class="oc-block-datatable-description">
          @if (isset($description) && trim((string) $description) !== '')
              {{ $description }}
          @else
          All customers and suppliers.
          @endif
      </p>
    </div>
    <div>
        @if (isset($actions) && trim((string) $actions) !== '')
            {{ $actions }}
        @else
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button">Export</button>
      <button class="oc-btn oc-btn--sm" type="button">New contact</button>
        @endif
    </div>
  </header>
  <div class="oc-block-datatable-body">
    <div class="oc-table-toolbar">
        @if (isset($toolbar) && trim((string) $toolbar) !== '')
            {{ $toolbar }}
        @else
      <input class="oc-input" type="search" placeholder="Search contacts..." aria-label="Search contacts">
      <div class="oc-filter-pills" role="group" aria-label="Status filter">
        <a class="oc-filter-pill" href="#" aria-current="true">Active</a>
        <a class="oc-filter-pill" href="#">Including archived</a>
        <a class="oc-filter-pill" href="#">Archived only</a>
      </div>
      <span class="oc-table-toolbar-spacer"></span>
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" popovertarget="oc-datatable-columns">Columns</button>
      <div class="oc-popover oc-popover--sm" id="oc-datatable-columns" popover>
        <label><input class="oc-checkbox" type="checkbox" checked> Name</label><br>
        <label><input class="oc-checkbox" type="checkbox" checked> E-mail</label><br>
        <label><input class="oc-checkbox" type="checkbox" checked> Status</label>
      </div>
        @endif
    </div>
    <div class="oc-block-datatable-bulk"><span>2 selected</span><button class="oc-btn oc-btn--outline oc-btn--sm" type="button">Export</button><button class="oc-btn oc-btn--destructive oc-btn--sm" type="button">Delete</button></div>
    <div class="oc-table-wrap">
        @if (isset($table) && trim((string) $table) !== '')
            {{ $table }}
        @else
      <table class="oc-table">
        <thead>
          <tr>
            <th style="width:2.5rem"><input class="oc-checkbox" type="checkbox" aria-label="Select all"></th>
            <th aria-sort="ascending"><a class="oc-table-sort" href="?sort=name">Name</a></th>
            <th><a class="oc-table-sort" href="?sort=email">E-mail</a></th>
            <th>Status</th>
            <th data-numeric><a class="oc-table-sort" href="?sort=balance">Balance</a></th>
            <th><span class="oc-visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
        <tr>
          <td><input class="oc-checkbox" type="checkbox" aria-label="Select Ada Lovelace"></td>
          <td>Ada Lovelace</td>
          <td>ada@example.com</td>
          <td><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-numeric>420.00</td>
          <td class="oc-table-actions"><a class="oc-table-row-action" href="#">Edit</a><button class="oc-table-row-action oc-table-row-action--destructive" type="button">Delete</button></td>
        </tr>
        <tr>
          <td><input class="oc-checkbox" type="checkbox" aria-label="Select Alan Turing"></td>
          <td>Alan Turing</td>
          <td>alan@example.com</td>
          <td><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-numeric>840.00</td>
          <td class="oc-table-actions"><a class="oc-table-row-action" href="#">Edit</a><button class="oc-table-row-action oc-table-row-action--destructive" type="button">Delete</button></td>
        </tr>
        <tr>
          <td><input class="oc-checkbox" type="checkbox" aria-label="Select Grace Hopper"></td>
          <td>Grace Hopper</td>
          <td>grace@example.com</td>
          <td><span class="oc-badge oc-badge--warning">Pending</span></td>
          <td data-numeric>1260.00</td>
          <td class="oc-table-actions"><a class="oc-table-row-action" href="#">Edit</a><button class="oc-table-row-action oc-table-row-action--destructive" type="button">Delete</button></td>
        </tr>
        <tr>
          <td><input class="oc-checkbox" type="checkbox" aria-label="Select Linus Torvalds"></td>
          <td>Linus Torvalds</td>
          <td>linus@example.com</td>
          <td><span class="oc-badge oc-badge--secondary">Archived</span></td>
          <td data-numeric>1680.00</td>
          <td class="oc-table-actions"><a class="oc-table-row-action" href="#">Edit</a><button class="oc-table-row-action oc-table-row-action--destructive" type="button">Delete</button></td>
        </tr>
        <tr>
          <td><input class="oc-checkbox" type="checkbox" aria-label="Select Margaret Hamilton"></td>
          <td>Margaret Hamilton</td>
          <td>margaret@example.com</td>
          <td><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-numeric>2100.00</td>
          <td class="oc-table-actions"><a class="oc-table-row-action" href="#">Edit</a><button class="oc-table-row-action oc-table-row-action--destructive" type="button">Delete</button></td>
        </tr>
        </tbody>
      </table>
        @endif
    </div>
    <div class="oc-table-footer">
        @if (isset($footer) && trim((string) $footer) !== '')
            {{ $footer }}
        @else
      <span>Showing 1 to 5 of 48 entries</span>
      <label>Rows per page <select class="oc-select" aria-label="Rows per page"><option>10</option><option>25</option><option>50</option></select></label>
      <nav aria-label="Pagination">
        <ul class="oc-pagination">
          <li class="oc-pagination-item"><a href="#" aria-label="Previous">&lsaquo;</a></li>
          <li class="oc-pagination-item is-active"><a href="#" aria-current="page">1</a></li>
          <li class="oc-pagination-item"><a href="#">2</a></li>
          <li class="oc-pagination-item"><a href="#">3</a></li>
          <li class="oc-pagination-item"><a href="#" aria-label="Next">&rsaquo;</a></li>
        </ul>
      </nav>
        @endif
    </div>
  </div>
</section>
