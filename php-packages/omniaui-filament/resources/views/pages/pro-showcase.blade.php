{{-- OmniaUI Pro blocks inside a Filament page: the charts gallery, a two-month calendar, an onboarding checklist and a chat inbox,
     next to Filament's own navigation. Needs birdycom/omniaui-pro-laravel and @birdycom/omniaui-pro (license). --}}
<x-filament-panels::page>
    <div class="pro-stack">
        <x-oc::block.dashboard-stats />
        <x-oc::block.charts />
        <div class="pro-grid">
            <x-oc::block.calendar-02 />
            <x-oc::block.onboarding-checklist />
        </div>
        <x-oc::block.chat-inbox />
    </div>

    <style>
        .pro-stack { display: grid; gap: 2rem; }
        .pro-grid { display: grid; gap: 2rem; }
        @media (min-width: 80rem) { .pro-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
    </style>
</x-filament-panels::page>
