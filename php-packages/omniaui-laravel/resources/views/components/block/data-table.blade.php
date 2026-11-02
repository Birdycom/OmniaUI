{{-- OmniaUI block: data-table - Card with title, actions, search toolbar, sortable table, bulk bar and pagination footer. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/data-table.html | Map: card header -> toolbar (search, status pills) -> bulk bar -> table -> footer
     Works in the browser with @birdycom/omniaui/data-table.js (data-oc-data-table on the card): search, status filter,
     sort, selection, bulk export/delete, row delete, rows per page and pages. Server side (Livewire) leave the
     data-oc-* hooks out and render links instead.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-card.oc-block-datatable[data-oc-data-table]: Card root (data-oc-live="true": the demo changes its own rows)
       .oc-block-datatable-head / -title / -description: Card header area
       .oc-block-datatable-body: Padded body
       .oc-table-toolbar: Search (.oc-data-table-search) + status pills (data-oc-filter="active|all|archived")
       .oc-block-datatable-bulk.oc-data-table-bulk: Selection bar (shown while rows are selected)
       .oc-table-wrap > .oc-table: Table; th[data-oc-col] with button.oc-table-sort, rows tr[data-oc-row][data-oc-key][data-oc-status]
       .oc-table-footer: Count (data-oc-summary), page size (data-oc-page-size) and pages (data-oc-pager)
     Slots: title, description, header actions, toolbar, table, footer
     Blade: <x-oc::block.data-table> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, description, actions, toolbar, table, footer.
--}}
@props(['title' => null, 'description' => null, 'actions' => null, 'toolbar' => null, 'table' => null, 'footer' => null])
<section {{ $attributes->merge(['class' => 'oc-card oc-block-datatable', 'id' => 'oc-block-contacts', 'data-oc-data-table' => '', 'data-oc-live' => 'true']) }}>
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
      <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-export=""><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 12h2v5h16v-5h2v5c0 1.11-.89 2-2 2H4a2 2 0 0 1-2-2zm10 3l5.55-5.46l-1.42-1.41L13 11.25V2h-2v9.25L7.88 8.13L6.46 9.55z"/></svg>Export</button>
      <button class="oc-btn oc-btn--sm" type="button"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>New contact</button>
        @endif
    </div>
  </header>
  <div class="oc-block-datatable-body">
    <div class="oc-table-toolbar">
        @if (isset($toolbar) && trim((string) $toolbar) !== '')
            {{ $toolbar }}
        @else
      <input class="oc-input oc-data-table-search" type="search" placeholder="Search contacts..." aria-label="Search contacts">
      <div class="oc-filter-pills" role="group" aria-label="Status filter">
        <button class="oc-filter-pill" type="button" data-oc-filter="active" aria-current="true">Active</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="all">Including archived</button>
        <button class="oc-filter-pill" type="button" data-oc-filter="archived">Archived only</button>
      </div>
        @endif
    </div>
    <div class="oc-block-datatable-bulk oc-data-table-bulk" hidden><span data-oc-selected-count="">0 selected</span><button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="export"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 12h2v5h16v-5h2v5c0 1.11-.89 2-2 2H4a2 2 0 0 1-2-2zm10 3l5.55-5.46l-1.42-1.41L13 11.25V2h-2v9.25L7.88 8.13L6.46 9.55z"/></svg>Export</button><button class="oc-btn oc-btn--destructive oc-btn--sm" type="button" data-oc-bulk="delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg>Delete</button></div>
    <div class="oc-table-wrap">
        @if (isset($table) && trim((string) $table) !== '')
            {{ $table }}
        @else
      <table class="oc-table">
        <thead>
          <tr>
            <th data-oc-col="select" style="width:2.5rem"><input class="oc-checkbox" type="checkbox" data-oc-select-all="" aria-label="Select all"></th>
            <th data-oc-col="name" aria-sort="ascending"><button class="oc-table-sort" type="button">Name</button></th>
            <th data-oc-col="email"><button class="oc-table-sort" type="button">E-mail</button></th>
            <th data-oc-col="status"><button class="oc-table-sort" type="button">Status</button></th>
            <th data-oc-col="balance" data-numeric=""><button class="oc-table-sort" type="button">Balance</button></th>
            <th data-oc-col="actions"><span class="oc-visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
        <tr data-oc-row="" data-oc-key="contact-1" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 1"></td>
          <td data-oc-col="name">Contact 1</td>
          <td data-oc-col="email">info@contact1.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-oc-col="balance" data-numeric="">420.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 1" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 1" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-2" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 2"></td>
          <td data-oc-col="name">Contact 2</td>
          <td data-oc-col="email">info@contact2.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-oc-col="balance" data-numeric="">840.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 2" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 2" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-3" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 3"></td>
          <td data-oc-col="name">Contact 3</td>
          <td data-oc-col="email">info@contact3.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--warning">Pending</span></td>
          <td data-oc-col="balance" data-numeric="">1260.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 3" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 3" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-4" data-oc-status="archived">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 4"></td>
          <td data-oc-col="name">Contact 4</td>
          <td data-oc-col="email">info@contact4.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--secondary">Archived</span></td>
          <td data-oc-col="balance" data-numeric="">1680.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 4" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 4" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-5" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 5"></td>
          <td data-oc-col="name">Contact 5</td>
          <td data-oc-col="email">info@contact5.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-oc-col="balance" data-numeric="">2100.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 5" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 5" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-6" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 6"></td>
          <td data-oc-col="name">Contact 6</td>
          <td data-oc-col="email">info@contact6.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--warning">Pending</span></td>
          <td data-oc-col="balance" data-numeric="">310.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 6" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 6" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-7" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 7"></td>
          <td data-oc-col="name">Contact 7</td>
          <td data-oc-col="email">info@contact7.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-oc-col="balance" data-numeric="">975.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 7" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 7" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-8" data-oc-status="archived">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 8"></td>
          <td data-oc-col="name">Contact 8</td>
          <td data-oc-col="email">info@contact8.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--secondary">Archived</span></td>
          <td data-oc-col="balance" data-numeric="">150.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 8" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 8" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-9" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 9"></td>
          <td data-oc-col="name">Contact 9</td>
          <td data-oc-col="email">info@contact9.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-oc-col="balance" data-numeric="">3240.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 9" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 9" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-10" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 10"></td>
          <td data-oc-col="name">Contact 10</td>
          <td data-oc-col="email">info@contact10.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-oc-col="balance" data-numeric="">560.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 10" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 10" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-11" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 11"></td>
          <td data-oc-col="name">Contact 11</td>
          <td data-oc-col="email">info@contact11.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--warning">Pending</span></td>
          <td data-oc-col="balance" data-numeric="">1890.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 11" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 11" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        <tr data-oc-row="" data-oc-key="contact-12" data-oc-status="active">
          <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select="" aria-label="Select Contact 12"></td>
          <td data-oc-col="name">Contact 12</td>
          <td data-oc-col="email">info@contact12.example</td>
          <td data-oc-col="status"><span class="oc-badge oc-badge--success">Active</span></td>
          <td data-oc-col="balance" data-numeric="">720.00</td>
          <td class="oc-table-actions" data-oc-col="actions"><a class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" href="#" aria-label="Edit Contact 12" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></a><button class="oc-btn oc-btn--soft-destructive oc-btn--icon oc-btn--sm" type="button" data-oc-row-action="delete" aria-label="Delete Contact 12" title="Delete"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg></button></td>
        </tr>
        </tbody>
      </table>
      <p class="oc-data-table-empty" hidden>No contacts found.</p>
        @endif
    </div>
    <div class="oc-table-footer">
        @if (isset($footer) && trim((string) $footer) !== '')
            {{ $footer }}
        @else
      <span data-oc-summary="Showing {from} to {to} of {total} entries">Showing 1 to 5 of 10 entries</span>
      <label>Rows per page <select class="oc-select" data-oc-page-size="" aria-label="Rows per page"><option>5</option><option>10</option><option>25</option></select></label>
      <nav class="oc-data-table-pager" data-oc-pager="" aria-label="Pagination"></nav>
        @endif
    </div>
  </div>
</section>
