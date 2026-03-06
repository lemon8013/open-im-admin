<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h3>数据概览</h3>
      <el-button type="primary" :icon="FullScreen" @click="toggleFullscreen">
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </el-button>
    </div>
    <div ref="iframeWrap" class="iframe-wrap" :class="{ fullscreen: isFullscreen }">
      <iframe
        :src="prometheusUrl"
        frameborder="0"
        width="100%"
        height="100%"
        allowfullscreen
      />
      <el-button
        v-if="isFullscreen"
        class="exit-fullscreen-btn"
        type="info"
        @click="isFullscreen = false"
      >
        退出全屏
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'
import { getConfig } from '@/config'

const isFullscreen = ref(false)
const iframeWrap = ref(null)

const prometheusUrl = computed(() => {
  const config = getConfig()
  if (config.PROMETHEUS_URL) return config.PROMETHEUS_URL
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:13000`
})

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}
</script>

<style scoped>
.dashboard-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.iframe-wrap {
  flex: 1;
  min-height: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.iframe-wrap.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border: none;
  border-radius: 0;
}

.exit-fullscreen-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10000;
}
</style>
