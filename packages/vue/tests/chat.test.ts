// File: packages/vue/tests/chat.test.ts
// Map: attachment -> message (+ list) -> message thread (send) -> prose -> chart line (paths equal the snippet)
// Chat and content Vue wrappers: same markup as the snippets (classes, roles, ids), plus their emits and send handling.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import OcAttachment from '../src/components/OcAttachment.vue'
import OcAttachmentList from '../src/components/OcAttachmentList.vue'
import OcMessage from '../src/components/OcMessage.vue'
import OcMessageList from '../src/components/OcMessageList.vue'
import OcMessageThread from '../src/components/OcMessageThread.vue'
import OcProse from '../src/components/OcProse.vue'
import OcChartLine from '../src/components/OcChartLine.vue'

describe('OcAttachment', () => {
  it('derives the type and icon text and renders the upload state', async () => {
    const link = mount(OcAttachment, { props: { name: 'Plan.xlsx', size: '86 KB', href: '#p' } })
    expect(link.element.tagName).toBe('A')
    expect(link.classes()).toEqual(['oc-attachment', 'oc-attachment--sheet'])
    expect(link.attributes('download')).toBe('')
    expect(link.find('.oc-attachment__icon').text()).toBe('XLS')
    const up = mount(OcAttachment, { props: { name: 'Note.pdf', state: 'uploading', progress: 65, removable: true } })
    expect(up.classes()).toContain('oc-attachment--uploading')
    expect((up.element as HTMLElement).style.getPropertyValue('--oc-attachment-progress')).toBe('65%')
    expect(up.find('[role="status"]').text()).toBe('Uploading… 65%')
    await up.find('[aria-label="Cancel upload of Note.pdf"]').trigger('click')
    expect(up.emitted('remove')).toHaveLength(1)
  })

  it('OcAttachmentList renders the demo files in list items', () => {
    const w = mount(OcAttachmentList, { props: { stack: true } })
    expect(w.classes()).toEqual(['oc-attachment-list', 'oc-attachment-list--stack'])
    expect(w.findAll('li > a.oc-attachment')).toHaveLength(4)
  })
})

describe('OcMessage', () => {
  it('renders an outgoing bubble with quote, read receipt and actions', async () => {
    const w = mount(OcMessage, {
      props: { direction: 'out', continued: true, avatar: 'TP', time: '09:20', datetime: '2026-10-14T09:20', status: 'read', statusIcon: true, label: 'You, 09:20',
        quote: { href: '#q', sender: 'Lisa', text: 'Which?' }, text: 'Calacatta.', actions: [{ name: 'reply', label: 'Reply' }] },
    })
    expect(w.classes()).toEqual(['oc-message', 'oc-message--out', 'oc-message--continued'])
    expect(w.attributes('aria-label')).toBe('You, 09:20')
    expect(w.find('.oc-message__quote').attributes('href')).toBe('#q')
    expect(w.find('.oc-message__status--read svg').exists()).toBe(true)
    await w.find('[aria-label="Reply"]').trigger('click')
    expect(w.emitted('action')?.[0]).toEqual(['reply'])
  })

  it('OcMessageList renders the demo with dividers; thumbnails share one list', () => {
    const w = mount(OcMessageList)
    expect(w.attributes('role')).toBe('log')
    expect(w.findAll('article.oc-message')).toHaveLength(3)
    expect(w.find('.oc-message-divider--system').attributes('role')).toBe('note')
    expect(w.find('.oc-message__text ul').exists()).toBe(true)
    const t = mount(OcMessage, { props: { avatar: 'SC', attachments: [{ kind: 'thumb', alt: 'A', art: 4 }, { kind: 'thumb', alt: 'B' }] } })
    expect(t.findAll('.oc-message__attachments > .oc-attachment-list > span.oc-attachment-thumb')).toHaveLength(2)
  })
})

describe('OcMessageThread', () => {
  it('renders header, menu, composer and overlay', () => {
    const w = mount(OcMessageThread, { props: { id: 't', busy: true } })
    expect(w.attributes('aria-labelledby')).toBe('t-title')
    expect(w.attributes('aria-busy')).toBe('true')
    expect(w.find('.oc-message-thread__icon-btn').attributes('popovertarget')).toBe('t-menu')
    expect(w.find('.oc-message-thread__scroll').attributes('aria-live')).toBe('polite')
    expect(w.find('textarea').attributes('name')).toBe('message')
    expect(w.find('.oc-message-thread__busy').attributes('role')).toBe('status')
  })

  it('calls @send and appends an outgoing bubble', async () => {
    const onSend = vi.fn()
    const w = mount(OcMessageThread, { props: { id: 't', onSend } })
    const field = w.find('textarea').element as HTMLTextAreaElement
    field.value = 'Fine by me'
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(onSend).toHaveBeenCalledWith('Fine by me')
    const last = w.findAll('article').at(-1)!
    expect(last.classes()).toContain('oc-message--out')
    expect(last.find('.oc-message__avatar').text()).toBe('TP')
    expect(last.find('.oc-message__status').text()).toBe('Sent')
    expect(field.value).toBe('')
  })
})

describe('OcProse and OcChartLine', () => {
  it('OcProse renders the demo and size modifiers', () => {
    const w = mount(OcProse, { props: { size: 'lg' } })
    expect(w.classes()).toEqual(['oc-prose', 'oc-prose--lg'])
    expect(w.find('.oc-prose-lead').exists()).toBe(true)
    expect(mount(OcProse, { props: { as: 'div', full: true }, slots: { default: '<p>Own</p>' } }).html()).toBe('<div class="oc-prose oc-prose--full">\n  <p>Own</p>\n</div>')
  })

  it('OcChartLine computes the same paths, dots and axis as the snippet', () => {
    const snippet = readFileSync(resolve(__dirname, '../../ui/snippets/chart-line.html'), 'utf8')
    const expected = [...snippet.matchAll(/class="oc-chart-line__path" d="([^"]+)"/g)].map((m) => m[1])
    const w = mount(OcChartLine)
    expect(w.findAll('.oc-chart-line__path').map((p) => p.attributes('d'))).toEqual(expected)
    expect(w.findAll('.oc-chart-line__y li').map((li) => li.text())).toEqual(['320', '240', '160', '80', '0'])
    expect(w.findAll('.oc-chart-line__x li').map((li) => li.text())[0]).toBe('Jan')
    const col = w.find('.oc-chart-line__col')
    expect(col.attributes('aria-label')).toBe('January: Desktop 186, Mobile 80')
    expect((col.find('.oc-chart-line__dot').element as HTMLElement).style.getPropertyValue('--y')).toBe('58.13%')
  })
})
