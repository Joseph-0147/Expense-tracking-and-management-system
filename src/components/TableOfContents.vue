<template>
  <div class="toc-container" :class="{ hidden: !showTOC }">
    <button @click="toggleTOC" class="toc-toggle">
      <i class="fas fa-list"></i>
    </button>

    <div v-if="showTOC" class="toc-content">
      <h4>Quick Navigation</h4>
      <ul class="toc-list">
        <li
          v-for="section in sections"
          :key="section.id"
          :class="{ active: activeSection === section.id }"
        >
          <button @click="scrollTo(section.id)" class="toc-link">
            <i :class="section.icon"></i>
            {{ section.name }}
            <span class="progress-bar" :style="{ width: section.progress + '%' }"></span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  sections: Array,
  activeSection: String,
});

const emit = defineEmits(["scroll-to"]);

const showTOC = ref(false);

const toggleTOC = () => {
  showTOC.value = !showTOC.value;
};

const scrollTo = (sectionId) => {
  emit("scroll-to", sectionId);
  showTOC.value = false;
};
</script>

<style scoped>
.toc-container {
  position: fixed;
  left: var(--space-6);
  top: 50%;
  transform: translateY(-50%);
  z-index: 200;
}

.toc-toggle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  border: none;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: var(--transition-base);
}

.toc-toggle:hover {
  background: var(--primary-600);
  transform: scale(1.1);
}

.toc-content {
  position: absolute;
  left: 60px;
  top: -50%;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-4);
  min-width: 200px;
  border: 1px solid var(--border-color);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: var(--space-3) 0 0 0;
}

.toc-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2);
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.toc-link:hover {
  background: var(--bg-secondary);
}

.toc-link.active {
  background: var(--primary-100);
  color: var(--primary-700);
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--primary-500);
  transition: width 0.3s ease;
}

@media (max-width: 1023px) {
  .toc-container.hidden {
    display: none;
  }
}
</style>
