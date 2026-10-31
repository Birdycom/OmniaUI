{{-- Operations center: free OmniaUI components inside a Filament page. Everything here is OmniaCSS/OmniaUI markup;
     Filament only provides the panel around it. Tabs, filters, the tree and the incident cards work without JavaScript. --}}
<x-filament-panels::page>
    <div class="oc-stack">
        <div class="oc-stat-card-grid">
            <x-oc::stat-card value="99.982%" label="Uptime, 30 days" trend="+0.01%" tone="success" stripe />
            <x-oc::stat-card value="184 ms" label="p95 response time" trend="-12 ms" tone="accent" stripe />
            <x-oc::stat-card value="3" label="Open incidents" trend="+1" down tone="warning" stripe />
            <x-oc::stat-card value="1,284" label="Jobs today" trend="+8%" stripe />
        </div>

        <x-oc::tabs name="ops" :tabs="['Traffic', 'Deployments', 'Incidents', 'Services']">
            <x-oc::tabs.panel>
                <div class="ops-grid">
                    <div class="oc-card">
                        <div class="oc-card-content">
                            <x-oc::chart-line title="Requests per minute" sub="Last 12 hours" value="4,210" variant="area"
                                :series="[
                                    ['name' => 'API', 'values' => [2100, 2600, 2400, 3100, 3600, 3300, 3900, 4210, 3800, 3500, 3700, 4100]],
                                    ['name' => 'Web', 'values' => [900, 1100, 1000, 1400, 1700, 1600, 1500, 1800, 1650, 1500, 1550, 1700]],
                                    ['name' => 'Errors', 'values' => [12, 9, 15, 40, 22, 11, 9, 8, 30, 12, 10, 9], 'dashed' => true],
                                ]"
                                :labels="['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']"
                                :x-labels="['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']"
                                label="Requests per hour" />
                        </div>
                    </div>
                    <div class="oc-card">
                        <div class="oc-card-header">
                            <h2 class="oc-card-title">Capacity</h2>
                            <p class="oc-card-description">Warning from 70 %, critical from 90 %</p>
                        </div>
                        <div class="oc-card-content oc-stack">
                            <x-oc::progress :value="42" label="CPU, web cluster" levels />
                            <x-oc::progress :value="76" label="Memory, queue workers" levels />
                            <x-oc::progress :value="93" label="Disk, media storage" levels />
                            <x-oc::progress :value="58" label="Database connections" levels :marker="80" />
                        </div>
                    </div>
                </div>
            </x-oc::tabs.panel>

            <x-oc::tabs.panel>
                <div class="ops-grid">
                    <div class="oc-card">
                        <div class="oc-card-header">
                            <h2 class="oc-card-title">Release 4.18.0</h2>
                            <p class="oc-card-description">Pipeline, step 4 of 6</p>
                        </div>
                        <div class="oc-card-content">
                            <x-oc::stepper :current="4" label="Release pipeline" :steps="[
                                ['label' => 'Build', 'meta' => '1 min 12 s'],
                                ['label' => 'Unit tests', 'meta' => '1,942 passed'],
                                ['label' => 'Browser tests', 'meta' => '214 passed'],
                                ['label' => 'Canary (5 %)', 'meta' => 'running, 6 min left'],
                                ['label' => 'Rollout (100 %)', 'meta' => 'waits for canary'],
                                ['label' => 'Smoke tests', 'meta' => 'after rollout'],
                            ]" />
                        </div>
                    </div>
                    <x-oc::terminal-log title="deploy@prod-eu-1" status="Live" height="18rem" :lines="[
                        ['level' => 'info', 'time' => '14:02:11', 'message' => 'Pulling image registry.example.eu/app:4.18.0'],
                        ['level' => 'success', 'time' => '14:02:38', 'message' => 'Image verified (sha256:9f2c…e81a)'],
                        ['level' => 'info', 'time' => '14:02:40', 'message' => 'Running migrations: 3 pending'],
                        ['level' => 'success', 'time' => '14:02:44', 'message' => 'Migrated 2026_10_30_add_invoice_status'],
                        ['level' => 'warn', 'time' => '14:02:51', 'message' => 'Queue depth 1,204 above 1,000: scaling workers to 8'],
                        ['level' => 'info', 'time' => '14:03:05', 'message' => 'Canary at 5 %: 0 errors in 1,912 requests'],
                        ['level' => 'debug', 'time' => '14:03:06', 'message' => 'p95 181 ms (baseline 196 ms)'],
                    ]" prompt />
                </div>
            </x-oc::tabs.panel>

            <x-oc::tabs.panel>
                <x-oc::filter-counts name="incident-filter" value="open" label="Incidents" :options="[
                    ['value' => 'open', 'label' => 'Open', 'count' => 3, 'tone' => 'destructive'],
                    ['value' => 'watching', 'label' => 'Watching', 'count' => 5],
                    ['value' => 'resolved', 'label' => 'Resolved this week', 'count' => 18, 'tone' => 'success'],
                ]" />

                <div class="oc-stack">
                    <x-oc::severity-card level="critical" title="Payments: card authorisations failing for one provider" :tags="['payments', 'EU-west']" name="incidents" open>
                        Since 13:41, 4.2 % of card authorisations through the second provider time out. Traffic is moved to the primary
                        provider; failed orders get an automatic retry email.
                        <x-slot:actions>
                            <x-oc::button size="sm">Open runbook</x-oc::button>
                            <x-oc::button size="sm" variant="outline">Assign to me</x-oc::button>
                        </x-slot:actions>
                    </x-oc::severity-card>
                    <x-oc::severity-card level="high" title="Media storage at 93 %" :tags="['storage']" name="incidents">
                        The media disk grows 1.1 % a day. The lifecycle rule for thumbnails older than 180 days is not running.
                    </x-oc::severity-card>
                    <x-oc::severity-card level="medium" title="Search index lags 4 minutes behind" :tags="['search', 'queue']" name="incidents">
                        Re-indexing jobs wait behind the newsletter batch; they get their own queue in the next release.
                    </x-oc::severity-card>
                    <x-oc::severity-card level="low" title="Certificate for status.example.eu renews in 12 days" :tags="['tls']" name="incidents" resolved />
                </div>
            </x-oc::tabs.panel>

            <x-oc::tabs.panel>
                <div class="ops-grid">
                    <x-oc::tree head="Services" :items="[
                        ['label' => 'Web', 'open' => true, 'children' => [
                            ['label' => 'app-eu-1', 'count' => 'healthy'],
                            ['label' => 'app-eu-2', 'count' => 'healthy'],
                            ['label' => 'app-eu-3', 'count' => 'draining', 'current' => true],
                        ]],
                        ['label' => 'Workers', 'open' => true, 'children' => [
                            ['label' => 'default (8)', 'count' => '1,204 jobs'],
                            ['label' => 'mail (2)', 'count' => '86 jobs'],
                            ['label' => 'search (1)', 'count' => '412 jobs'],
                        ]],
                        ['label' => 'Data', 'children' => [
                            ['label' => 'postgres-primary', 'count' => '58 conn.'],
                            ['label' => 'postgres-replica', 'count' => 'lag 0.2 s'],
                            ['label' => 'redis', 'count' => '1.2 GB'],
                        ]],
                    ]" />
                    <div class="oc-card">
                        <div class="oc-card-header"><h2 class="oc-card-title">Recent activity</h2></div>
                        <div class="oc-card-content">
                            <x-oc::timeline accent :items="[
                                ['date' => '14:03', 'title' => 'Canary started', 'text' => 'Release 4.18.0 to 5 % of traffic', 'current' => true],
                                ['date' => '13:52', 'title' => 'Incident opened', 'text' => 'Card authorisations, second provider'],
                                ['date' => '11:20', 'title' => 'Workers scaled', 'text' => 'default queue 4 → 8 workers'],
                                ['date' => '09:05', 'title' => 'Backup verified', 'text' => 'Restore test of last night’s snapshot passed'],
                            ]" />
                        </div>
                    </div>
                </div>
            </x-oc::tabs.panel>
        </x-oc::tabs>
    </div>

    <style>
        .ops-grid { display: grid; gap: 1.5rem; }
        @media (min-width: 64rem) { .ops-grid { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); } }
        .oc-stack { display: grid; gap: 1.5rem; }
    </style>
</x-filament-panels::page>
