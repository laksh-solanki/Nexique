<template>
  <div class="flex w-full items-center justify-center px-4">
    <div class="birthday-card">
      <div class="birthday-card-wash" aria-hidden="true" />

      <div
        v-for="corner in corners"
        :key="corner"
        class="birthday-corner"
        :class="`birthday-corner-${corner}`"
        aria-hidden="true"
      >
        <div class="corner-line outer-horizontal" />
        <div class="corner-line outer-vertical" />
        <div class="corner-inner">
          <div class="corner-line inner-horizontal" />
          <div class="corner-line inner-vertical" />
        </div>
        <div class="corner-diamond" />
      </div>

      <div class="birthday-divider birthday-divider-top" />
      <div class="birthday-divider birthday-divider-bottom" />
      <div class="birthday-dot birthday-dot-top" />
      <div class="birthday-dot birthday-dot-bottom" />

      <div class="birthday-card-content">
        <div class="birthday-label">
          Happy Birthday
          <div class="birthday-star">&#10022;</div>
        </div>
        <div class="birthday-name">{{ name }}</div>
        <div class="birthday-subtitle">Celebrate &amp; Shine</div>
        <div class="birthday-message">"{{ message }}"</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: "Happy You",
  },
  message: {
    type: String,
    default:
      "Wishing you a day filled with joy, laughter, and beautiful moments. May this new chapter bring you everything you've been dreaming of.",
  },
});

const corners = ["tl", "tr", "bl", "br"];
</script>

<style scoped>
.birthday-card {
  position: relative;
  width: min(600px, 100%);
  aspect-ratio: 600 / 800;
  overflow: hidden;
  border-radius: 4px;
  background: #fcf8f0;
  color: #2c2c2c;
  font-family: Georgia, "Times New Roman", serif;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.25),
    0 0 0 2px #c9a96e inset,
    0 0 0 6px #fcf8f0 inset,
    0 0 0 8px #c9a96e inset;
}

.birthday-card-wash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(201, 169, 110, 0.05) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(201, 169, 110, 0.05) 0%, transparent 60%);
}

.birthday-corner {
  position: absolute;
  z-index: 2;
  width: 110px;
  height: 110px;
  pointer-events: none;
}

.birthday-corner-tl {
  top: 12px;
  left: 12px;
}

.birthday-corner-tr {
  top: 12px;
  right: 12px;
}

.birthday-corner-bl {
  bottom: 12px;
  left: 12px;
}

.birthday-corner-br {
  right: 12px;
  bottom: 12px;
}

.corner-line {
  position: absolute;
  background: #c9a96e;
}

.outer-horizontal {
  width: 70px;
  height: 3px;
}

.outer-vertical {
  width: 3px;
  height: 70px;
}

.birthday-corner-tl .outer-horizontal,
.birthday-corner-tl .outer-vertical,
.birthday-corner-tr .outer-horizontal,
.birthday-corner-tr .outer-vertical {
  top: 0;
}

.birthday-corner-bl .outer-horizontal,
.birthday-corner-bl .outer-vertical,
.birthday-corner-br .outer-horizontal,
.birthday-corner-br .outer-vertical {
  bottom: 0;
}

.birthday-corner-tl .outer-horizontal,
.birthday-corner-tl .outer-vertical,
.birthday-corner-bl .outer-horizontal,
.birthday-corner-bl .outer-vertical {
  left: 0;
}

.birthday-corner-tr .outer-horizontal,
.birthday-corner-tr .outer-vertical,
.birthday-corner-br .outer-horizontal,
.birthday-corner-br .outer-vertical {
  right: 0;
}

.corner-inner {
  position: absolute;
}

.birthday-corner-tl .corner-inner,
.birthday-corner-tr .corner-inner {
  top: 8px;
}

.birthday-corner-bl .corner-inner,
.birthday-corner-br .corner-inner {
  bottom: 8px;
}

.birthday-corner-tl .corner-inner,
.birthday-corner-bl .corner-inner {
  left: 8px;
}

.birthday-corner-tr .corner-inner,
.birthday-corner-br .corner-inner {
  right: 8px;
}

.inner-horizontal {
  width: 40px;
  height: 2px;
}

.inner-vertical {
  width: 2px;
  height: 40px;
}

.birthday-corner-tl .inner-horizontal,
.birthday-corner-tl .inner-vertical,
.birthday-corner-tr .inner-horizontal,
.birthday-corner-tr .inner-vertical {
  top: 0;
}

.birthday-corner-bl .inner-horizontal,
.birthday-corner-bl .inner-vertical,
.birthday-corner-br .inner-horizontal,
.birthday-corner-br .inner-vertical {
  bottom: 0;
}

.birthday-corner-tl .inner-horizontal,
.birthday-corner-tl .inner-vertical,
.birthday-corner-bl .inner-horizontal,
.birthday-corner-bl .inner-vertical {
  left: 0;
}

.birthday-corner-tr .inner-horizontal,
.birthday-corner-tr .inner-vertical,
.birthday-corner-br .inner-horizontal,
.birthday-corner-br .inner-vertical {
  right: 0;
}

.corner-diamond {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid #c9a96e;
  transform: rotate(45deg);
}

.birthday-corner-tl .corner-diamond,
.birthday-corner-tr .corner-diamond {
  top: -4px;
}

.birthday-corner-bl .corner-diamond,
.birthday-corner-br .corner-diamond {
  bottom: -4px;
}

.birthday-corner-tl .corner-diamond,
.birthday-corner-bl .corner-diamond {
  left: 74px;
}

.birthday-corner-tr .corner-diamond,
.birthday-corner-br .corner-diamond {
  right: 74px;
}

.birthday-divider {
  position: absolute;
  right: 80px;
  left: 80px;
  height: 1px;
  background: linear-gradient(to right, transparent 0%, #c9a96e 20%, #c9a96e 80%, transparent 100%);
}

.birthday-divider-top {
  top: 21.25%;
}

.birthday-divider-bottom {
  bottom: 21.25%;
}

.birthday-dot {
  position: absolute;
  z-index: 2;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #c9a96e;
  transform: translateX(-50%);
}

.birthday-dot-top {
  top: 23.1%;
}

.birthday-dot-bottom {
  bottom: 23.1%;
}

.birthday-card-content {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25% 10%;
  text-align: center;
}

.birthday-label {
  margin-bottom: 18px;
  color: #c9a96e;
  font-size: clamp(14px, 2.6vw, 22px);
  letter-spacing: 6px;
  text-transform: uppercase;
}

.birthday-star {
  margin-top: 14px;
  color: #c9a96e;
  font-size: 14px;
  letter-spacing: 0;
}

.birthday-name {
  margin-bottom: 10px;
  color: #2c2c2c;
  font-size: clamp(36px, 8vw, 64px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 2px;
}

.birthday-subtitle {
  color: #8a7a5a;
  font-size: clamp(12px, 2.2vw, 18px);
  letter-spacing: 3px;
  text-transform: uppercase;
}

.birthday-message {
  max-width: 380px;
  margin-top: 24px;
  color: #6a5f4a;
  font-size: clamp(12px, 1.9vw, 16px);
  font-style: italic;
  line-height: 1.8;
}
</style>
