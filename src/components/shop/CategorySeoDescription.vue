<template>
  <section
    v-if="hasContent"
    class="category-seo-description mt-10 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors"
    aria-label="Опис категорії"
  >
    <div
      class="relative text-base leading-relaxed text-gray-700 dark:text-gray-200"
      :class="{ 'max-h-60 overflow-hidden': !isExpanded && showToggle }"
    >
      <div class="category-seo-content space-y-4" v-html="sanitizedContent"></div>
      <div
        v-if="!isExpanded && showToggle"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-gray-800 via-white/90 dark:via-gray-800/80 to-transparent"
      ></div>
    </div>

    <button
      v-if="showToggle"
      type="button"
      class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400"
      @click="isExpanded = !isExpanded"
      :aria-expanded="isExpanded"
    >
      <span>{{ isExpanded ? 'Згорнути опис' : 'Показати більше' }}</span>
      <span aria-hidden="true">{{ isExpanded ? '▲' : '▼' }}</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { sanitizeHtml } from '@/utils/sanitizeHtml'

interface Props {
  content?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  content: ''
})

const isExpanded = ref(false)

const sanitizedContent = computed(() => sanitizeHtml(props.content || ''))
const plainTextLength = computed(() =>
  sanitizedContent.value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length
)

const showToggle = computed(() => plainTextLength.value > 320)
const hasContent = computed(() => sanitizedContent.value.trim().length > 0)
</script>

<style scoped>
.category-seo-content :deep(h2) {
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.category-seo-content :deep(h3) {
  font-size: 1.125rem;
  line-height: 1.4;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.category-seo-content :deep(p) {
  margin-top: 1rem;
}

.category-seo-content :deep(ul),
.category-seo-content :deep(ol) {
  margin-left: 1.5rem;
  margin-top: 0.75rem;
  list-style: disc;
}

.category-seo-content :deep(a) {
  color: #c2410c;
  text-decoration: underline;
}

.dark .category-seo-description .category-seo-content :deep(a) {
  color: #fca311;
}
</style>
