{{-- OmniaCSS toast stack: listens for the `oc-toast` browser event (Livewire: $this->ocToast('success', 'Saved') from the WithOcToast trait;
     plain JavaScript: window.dispatchEvent(new CustomEvent('oc-toast', { detail: { type: 'info', title: 'Hi' } }))).
     0.18.0: detail.action = { label: 'Undo', event: 'undo-publish', params: {...} }: a button in the toast; a click dispatches that
     event (Livewire.dispatch when Livewire is loaded, so #[On('undo-publish')] runs; else a window event) and closes the toast.
     Props: top (stack at the top), timeout (ms, default 4000; 0 = stay until dismissed). Place it once in your layout. --}}
@props(['top' => false, 'timeout' => 4000])
<div wire:ignore {{ $attributes->class(['oc-toast-container', 'oc-toast-container--top' => $top])->merge(['data-oc-toast-stack' => '', 'data-timeout' => $timeout, 'aria-live' => 'polite']) }}></div>
@once
    <script>
        (() => {
            const glyphs = { success: '✓', error: '!', warning: '!', info: 'i' };
            const el = (tag, className, text) => {
                const node = document.createElement(tag);
                if (className) node.className = className;
                if (text !== undefined && text !== null) node.textContent = text;
                return node;
            };
            window.addEventListener('oc-toast', (event) => {
                const detail = Array.isArray(event.detail) ? event.detail[0] : event.detail;
                const stack = document.querySelector('[data-oc-toast-stack]');
                if (!stack || !detail) return;
                const type = ['success', 'error', 'warning', 'info'].includes(detail.type) ? detail.type : 'info';
                const toast = el('div', 'oc-toast oc-toast--' + type);
                toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
                const icon = el('span', 'oc-toast-icon', glyphs[type]);
                icon.setAttribute('aria-hidden', 'true');
                const body = el('div', 'oc-toast-body');
                body.append(el('p', 'oc-toast-title', detail.title || ''));
                if (detail.description) body.append(el('p', 'oc-toast-description', detail.description));
                const close = el('button', 'oc-toast-close', '×');
                close.type = 'button';
                close.setAttribute('aria-label', 'Dismiss');
                close.addEventListener('click', () => toast.remove());
                toast.append(icon, body);
                const action = detail.action;
                if (action && action.label) {
                    const button = el('button', 'oc-toast-action', action.label);
                    button.type = 'button';
                    button.addEventListener('click', () => {
                        if (action.event) {
                            if (window.Livewire && window.Livewire.dispatch) window.Livewire.dispatch(action.event, action.params || {});
                            else window.dispatchEvent(new CustomEvent(action.event, { detail: action.params || {} }));
                        }
                        toast.remove();
                    });
                    toast.append(button);
                }
                toast.append(close);
                stack.append(toast);
                const timeout = detail.timeout ?? (detail.action ? Math.max(10000, Number(stack.dataset.timeout || 4000)) : Number(stack.dataset.timeout || 4000));
                if (timeout > 0) setTimeout(() => toast.remove(), timeout);
            });
        })();
    </script>
@endonce
