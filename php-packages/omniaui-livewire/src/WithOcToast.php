<?php

declare(strict_types=1);

// File: src/WithOcToast.php | Map: dispatch helper for <x-oc::toast-stack />

namespace Omniacss\Livewire;

/**
 * $this->ocToast('success', 'Saved') dispatches the `oc-toast` browser event that <x-oc::toast-stack /> listens to.
 */
trait WithOcToast
{
    /**
     * @param  'success'|'error'|'warning'|'info'  $type
     * @param  int|null  $timeout  milliseconds before the toast dismisses itself (0 = stays, null = stack default)
     * @param  array{label: string, event: string, params?: array<string, mixed>}|null  $action  0.18.0: a button in the toast
     *                                                                                          ("Undo"); a click dispatches `event` (listen with #[On]) and closes it
     */
    public function ocToast(string $type, string $title, ?string $description = null, ?int $timeout = null, ?array $action = null): void
    {
        $this->dispatch('oc-toast', type: $type, title: $title, description: $description, timeout: $timeout, action: $action);
    }
}
