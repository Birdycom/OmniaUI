<!-- File: packages/vue/src/blocks/OcBlockContactForm.vue | Map: props -> panel (result | title, intro, alert, form: honeypot, fields, actions) -> cards -->
<script setup lang="ts">
/**
 * Contact form in a panel next to a column of contact cards. Server errors come in as `errors` (field name -> text,
 * `form` = message above the form); `sent` shows the result, `busy` sets aria-busy and disables the button.
 * Slots: fields (own fields instead of name, e-mail, phone, subject, message), note, success, card-icon ({ card }).
 * Emits submit (the native event; call preventDefault for Inertia) and again (back to the form).
 * Classes: .oc-block-contact-form, -layout, -title, -intro, -cards; .oc-panel--glow, .oc-form--filled, .oc-result
 */
import { computed } from 'vue'
import { useUid } from '../composables/useUid'

export interface ContactFormLine {
  text: string
  href?: string
}
export interface ContactFormCard {
  title: string
  lines: ContactFormLine[]
  /** Webicon name (mdi:email-outline …), drawn with <iconify-icon>. */
  icon?: string
}
export interface ContactFormSubject {
  value: string
  label: string
}
const props = withDefaults(
  defineProps<{
    title?: string
    intro?: string
    action?: string
    method?: string
    subjects?: ContactFormSubject[]
    values?: Record<string, string>
    errors?: Record<string, string>
    sent?: boolean
    busy?: boolean
    submitLabel?: string
    busyLabel?: string
    note?: string
    successTitle?: string
    successText?: string
    againLabel?: string
    errorText?: string
    cards?: ContactFormCard[]
  }>(),
  {
    title: 'Send us a message',
    method: 'post',
    subjects: () => [],
    values: () => ({}),
    errors: () => ({}),
    submitLabel: 'Send message',
    busyLabel: 'Sending…',
    successTitle: 'Thank you, your message was sent',
    againLabel: 'Send another message',
    errorText: 'Please check the fields in red.',
    cards: () => [],
  },
)
const emit = defineEmits<{ submit: [event: Event]; again: [] }>()
const uid = useUid('oc-contact')
const fid = (name: string) => `${uid}-${name}`
const invalid = (name: string) => (props.errors[name] ? { 'aria-invalid': true as const, 'aria-describedby': `err-${name}` } : {})
const alertText = computed(() => props.errors.form ?? (Object.keys(props.errors).some((k) => k !== 'form') ? props.errorText : null))
</script>

<template>
  <section class="oc-block-contact-form" aria-label="Contact">
    <div class="oc-block-contact-form-layout">
      <div :id="uid" class="oc-panel oc-panel--glow">
        <div v-if="sent" class="oc-result" role="status" tabindex="-1">
          <slot name="success">
            <span class="oc-icon-tile oc-icon-tile--sm oc-accent--green" aria-hidden="true"><iconify-icon icon="mdi:check" /></span>
            <h2 class="oc-result__title">{{ successTitle }}</h2>
            <p v-if="successText" class="oc-result__text">{{ successText }}</p>
            <div class="oc-result__actions">
              <button type="button" class="oc-btn oc-btn--outline" @click="emit('again')">{{ againLabel }}</button>
            </div>
          </slot>
        </div>
        <div v-else>
          <h2 v-if="title" class="oc-block-contact-form-title">{{ title }}</h2>
          <p v-if="intro" class="oc-block-contact-form-intro">{{ intro }}</p>
          <p v-if="alertText" class="oc-alert oc-alert--danger" role="alert">{{ alertText }}</p>
          <form class="oc-form oc-form--filled" :action="action" :method="method" novalidate :aria-busy="busy || undefined" @submit="emit('submit', $event)">
            <div class="oc-honeypot" aria-hidden="true">
              <label :for="fid('website')">Leave this field empty</label>
              <input :id="fid('website')" type="text" name="website" tabindex="-1" autocomplete="off" />
            </div>
            <slot name="fields">
              <div class="oc-field-group oc-field-group--row">
                <div class="oc-field">
                  <label class="oc-field-label" :for="fid('name')">Name</label>
                  <input :id="fid('name')" class="oc-input" type="text" name="name" required maxlength="100" autocomplete="name" :value="values.name" v-bind="invalid('name')" />
                  <p v-if="errors.name" id="err-name" class="oc-field-error">{{ errors.name }}</p>
                </div>
                <div class="oc-field">
                  <label class="oc-field-label" :for="fid('email')">E-mail</label>
                  <input :id="fid('email')" class="oc-input" type="email" name="email" required maxlength="254" autocomplete="email" :value="values.email" v-bind="invalid('email')" />
                  <p v-if="errors.email" id="err-email" class="oc-field-error">{{ errors.email }}</p>
                </div>
              </div>
              <div :class="['oc-field-group', subjects.length && 'oc-field-group--row']">
                <div class="oc-field">
                  <label class="oc-field-label" :for="fid('phone')">Phone <span class="oc-field-label__hint">(optional)</span></label>
                  <input :id="fid('phone')" class="oc-input" type="tel" name="phone" maxlength="40" autocomplete="tel" inputmode="tel" :value="values.phone" v-bind="invalid('phone')" />
                  <p v-if="errors.phone" id="err-phone" class="oc-field-error">{{ errors.phone }}</p>
                </div>
                <div v-if="subjects.length" class="oc-field">
                  <label class="oc-field-label" :for="fid('subject')">What is it about?</label>
                  <select :id="fid('subject')" class="oc-select" name="subject" required v-bind="invalid('subject')">
                    <option value="" :selected="!values.subject">Choose a subject</option>
                    <option v-for="s in subjects" :key="s.value" :value="s.value" :selected="values.subject === s.value">{{ s.label }}</option>
                  </select>
                  <p v-if="errors.subject" id="err-subject" class="oc-field-error">{{ errors.subject }}</p>
                </div>
              </div>
              <div class="oc-field">
                <label class="oc-field-label" :for="fid('message')">Your message</label>
                <textarea :id="fid('message')" class="oc-input oc-textarea" name="message" rows="6" required maxlength="5000" :value="values.message" v-bind="invalid('message')" />
                <p v-if="errors.message" id="err-message" class="oc-field-error">{{ errors.message }}</p>
              </div>
            </slot>
            <div class="oc-form-actions">
              <button class="oc-btn oc-btn--lg" type="submit" :disabled="busy">{{ busy ? busyLabel : submitLabel }}</button>
              <p v-if="note || $slots.note" class="oc-form-note"><slot name="note">{{ note }}</slot></p>
            </div>
          </form>
        </div>
      </div>
      <div v-if="cards.length" class="oc-block-contact-form-cards">
        <article v-for="(card, i) in cards" :key="i" class="oc-block-contact-card">
          <span v-if="card.icon || $slots['card-icon']" class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">
            <slot name="card-icon" :card="card"><iconify-icon :icon="card.icon" /></slot>
          </span>
          <h3 class="oc-block-contact-title">{{ card.title }}</h3>
          <template v-for="(line, j) in card.lines" :key="j">
            <a v-if="line.href" class="oc-block-contact-line" :href="line.href">{{ line.text }}</a>
            <p v-else class="oc-block-contact-line">{{ line.text }}</p>
          </template>
        </article>
      </div>
    </div>
  </section>
</template>
