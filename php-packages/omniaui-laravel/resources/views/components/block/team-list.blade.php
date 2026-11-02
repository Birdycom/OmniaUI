{{-- OmniaUI block: team-list - Member rows with avatar, role badge and a row action menu. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-team: List container
       .oc-block-team-row: One member
       .oc-user: Avatar + name + e-mail
       .oc-block-team-meta: Right side (badges, actions)
     Blade: <x-oc::block.team-list> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-team']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-block-team-row">
    <div class="oc-user"><span class="oc-avatar">C1</span><span class="oc-user-text"><span class="oc-user-name">Contact 1</span><span class="oc-user-email">info@contact1.example</span></span></div>
    <div class="oc-block-team-meta"><span class="oc-badge">Owner</span></div>
  </div>
  <div class="oc-block-team-row">
    <div class="oc-user"><span class="oc-avatar">C2</span><span class="oc-user-text"><span class="oc-user-name">Contact 2</span><span class="oc-user-email">info@contact2.example</span></span></div>
    <div class="oc-block-team-meta">
      <span class="oc-badge oc-badge--secondary">Accountant</span>
      <button class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" type="button" popovertarget="oc-team-menu" aria-label="Member actions">&hellip;</button>
      <div class="oc-dropdown-menu" id="oc-team-menu" popover>
        <a class="oc-dropdown-item" href="#">View profile</a>
        <a class="oc-dropdown-item" href="#">Change role</a>
        <div class="oc-dropdown-separator"></div>
        <button class="oc-dropdown-item" type="button">Remove</button>
      </div>
    </div>
  </div>
  <div class="oc-block-team-row">
    <div class="oc-user"><span class="oc-avatar">C3</span><span class="oc-user-text"><span class="oc-user-name">Contact 3</span><span class="oc-user-email">info@contact3.example</span></span></div>
    <div class="oc-block-team-meta"><span class="oc-badge oc-badge--warning">Invited</span></div>
  </div>
    @endif
</div>
