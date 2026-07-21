<script setup>
// The "Progress Timeline" sidebar card on a ticket detail page. Both the
// markup AND the step-calculation logic (TIMELINE_STEPS/STATUS_TO_STEP/
// stepStatus) were duplicated between TicketDetailPage and
// AgentTicketDetailPage — this component now owns both.
import './ProgressTimeline.scss'
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const TIMELINE_STEPS = ['Submitted', 'Under Review', 'In Progress', 'Resolved']

const STATUS_TO_STEP = {
  'Open':        0,
  'Pending':     1,
  'In Progress': 2,
  'Resolved':    3,
  'Rejected':    2,
}

const currentStep = computed(() => STATUS_TO_STEP[props.status] ?? 0)

const stepStatus = (index) => {
  const isLast = index === TIMELINE_STEPS.length - 1
  if (index < currentStep.value) return 'done'
  if (index === currentStep.value) return isLast ? 'done' : 'active'
  return 'pending'
}
</script>

<template>
  <div class="timeline-card">

    <h3 class="timeline-card__title">Progress Timeline</h3>

    <div class="timeline-card__steps">

      <div
        v-for="(step, index) in TIMELINE_STEPS"
        :key="step"
        class="timeline-step"
      >
        <div class="timeline-step__track">
          <div :class="['timeline-step__dot', `timeline-step__dot--${stepStatus(index)}`]">
            <Check v-if="stepStatus(index) === 'done'" :size="11" />
          </div>
          <div
            v-if="index < TIMELINE_STEPS.length - 1"
            :class="['timeline-step__line', stepStatus(index) === 'done' ? 'timeline-step__line--done' : '']"
          ></div>
        </div>

        <span :class="['timeline-step__label', `timeline-step__label--${stepStatus(index)}`]">
          {{ step }}
        </span>
      </div>

    </div>

  </div>
</template>
