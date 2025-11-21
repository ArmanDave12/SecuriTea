<template>
  <div class="fullscreen bg-deep-blue text-white text-center q-pa-sm flex flex-center">
    <div class="error-container">
      <!-- Tea cup with steam animation -->
      <div class="tea-cup-container q-mb-md">
        <div class="tea-cup">
          <div class="cup-body"></div>
          <div class="cup-handle"></div>
          <div class="tea-surface"></div>
          <!-- Animated steam -->
          <div class="steam steam-1"></div>
          <div class="steam steam-2"></div>
          <div class="steam steam-3"></div>
        </div>
      </div>

      <!-- 404 Text -->
      <div class="error-number q-mb-sm">4<span class="tea-accent">0</span>4</div>

      <!-- Error message -->
      <div class="error-title q-mb-xs">Oops! This blend isn't brewing...</div>

      <div class="error-subtitle q-mb-lg">
        The page you're looking for seems to have steeped away.
      </div>

      <!-- Action buttons -->
      <div class="button-container q-mb-lg">
        <q-btn
          class="home-btn q-mb-sm"
          color="teal"
          text-color="white"
          unelevated
          size="md"
          to="/"
          label="Brew a Fresh Start"
          no-caps
          icon="home"
        />

        <q-btn
          class="back-btn"
          color="transparent"
          text-color="orange"
          outline
          size="md"
          @click="$router.go(-1)"
          label="Go Back"
          no-caps
          icon="arrow_back"
        />
      </div>

      <!-- Security tea pun -->
      <div class="tea-pun">
        <q-icon name="security" color="leaf-green" size="sm" class="q-mr-xs" />
        <span class="pun-text">Your security is still brewing perfectly!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page functionality can be added here if needed
</script>

<style scoped>
.bg-deep-blue {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  min-height: 100vh;
}

.error-container {
  max-width: 280px;
  width: 100%;
  padding: 8px;
}

/* Tea Cup Styling - Mobile Optimized */
.tea-cup-container {
  position: relative;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tea-cup {
  position: relative;
  width: 60px;
  height: 45px;
}

.cup-body {
  width: 45px;
  height: 38px;
  background: linear-gradient(to bottom, #26a69a 0%, #00695c 100%);
  border-radius: 0 0 15px 15px;
  border: 2px solid #004d40;
  position: relative;
}

.cup-handle {
  position: absolute;
  right: -12px;
  top: 8px;
  width: 16px;
  height: 20px;
  border: 2px solid #ff8a65;
  border-left: none;
  border-radius: 0 8px 8px 0;
}

.tea-surface {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 37px;
  height: 6px;
  background: linear-gradient(90deg, #81c784 0%, #4caf50 100%);
  border-radius: 50%;
  opacity: 0.8;
}

/* Steam Animation - Smaller for Mobile */
.steam {
  position: absolute;
  width: 2px;
  height: 15px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 50%;
  animation: steam-rise 2s ease-in-out infinite;
}

.steam-1 {
  left: 15px;
  top: -20px;
  animation-delay: 0s;
}

.steam-2 {
  left: 22px;
  top: -25px;
  animation-delay: 0.5s;
}

.steam-3 {
  left: 29px;
  top: -20px;
  animation-delay: 1s;
}

@keyframes steam-rise {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-8px) rotate(2deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-15px) rotate(-2deg);
  }
}

/* Error Number Styling - Mobile Responsive */
.error-number {
  font-size: 4.5rem;
  font-weight: 900;
  color: #26a69a;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  line-height: 0.9;
}

.tea-accent {
  color: #ff8a65;
  animation: pulse-orange 2s ease-in-out infinite alternate;
}

@keyframes pulse-orange {
  0% {
    color: #ff8a65;
    text-shadow: 0 0 8px rgba(255, 138, 101, 0.5);
  }
  100% {
    color: #ff6e40;
    text-shadow: 0 0 15px rgba(255, 110, 64, 0.8);
  }
}

/* Mobile-Optimized Text */
.error-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #90a4ae;
  line-height: 1.3;
  margin-bottom: 8px;
}

.error-subtitle {
  font-size: 0.9rem;
  font-weight: 400;
  color: #90a4ae;
  opacity: 0.8;
  line-height: 1.4;
  margin-bottom: 24px;
}

/* Button Container - Stacked for Mobile */
.button-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Button Styling - Mobile Optimized */
.home-btn {
  background: linear-gradient(45deg, #26a69a 0%, #00897b 100%);
  box-shadow: 0 3px 8px rgba(38, 166, 154, 0.4);
  transition: all 0.3s ease;
  width: 100%;
  min-height: 44px;
  font-size: 0.9rem;
  padding: 8px 16px;
}

.home-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.6);
}

.back-btn {
  border-color: #ff8a65;
  transition: all 0.3s ease;
  width: 100%;
  min-height: 44px;
  font-size: 0.9rem;
  padding: 8px 16px;
}

.back-btn:hover {
  background-color: rgba(255, 138, 101, 0.1);
  transform: translateY(-1px);
}

/* Tea Pun Styling - Mobile Optimized */
.tea-pun {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.8rem;
  opacity: 0.9;
  animation: gentle-glow 3s ease-in-out infinite alternate;
}

.pun-text {
  color: #81c784;
  text-align: center;
  line-height: 1.3;
}

@keyframes gentle-glow {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* 320px Specific Optimizations */
@media (max-width: 320px) {
  .error-container {
    max-width: 260px;
    padding: 4px;
  }

  .error-number {
    font-size: 3.8rem;
  }

  .tea-cup {
    transform: scale(0.85);
  }

  .error-title {
    font-size: 1.1rem;
  }

  .error-subtitle {
    font-size: 0.85rem;
    margin-bottom: 20px;
  }

  .home-btn,
  .back-btn {
    font-size: 0.85rem;
    min-height: 42px;
    padding: 6px 12px;
  }

  .tea-pun {
    font-size: 0.75rem;
  }

  .button-container {
    gap: 10px;
  }
}

/* Ultra-small screens (280px and below) */
@media (max-width: 280px) {
  .error-container {
    max-width: 240px;
  }

  .error-number {
    font-size: 3.2rem;
  }

  .tea-cup {
    transform: scale(0.7);
  }

  .error-title {
    font-size: 1rem;
  }

  .error-subtitle {
    font-size: 0.8rem;
  }

  .home-btn,
  .back-btn {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}

/* Landscape mode adjustments for small screens */
@media (max-height: 500px) and (max-width: 800px) {
  .tea-cup-container {
    height: 60px;
  }

  .error-number {
    font-size: 3.5rem;
    margin-bottom: 8px;
  }

  .error-title {
    font-size: 1rem;
    margin-bottom: 4px;
  }

  .error-subtitle {
    font-size: 0.8rem;
    margin-bottom: 16px;
  }

  .button-container {
    flex-direction: row;
    gap: 8px;
  }

  .home-btn,
  .back-btn {
    flex: 1;
    min-height: 40px;
    font-size: 0.8rem;
  }

  .tea-pun {
    font-size: 0.7rem;
  }
}

/* Safe area for devices with notches/curved edges */
@supports (padding: env(safe-area-inset-left)) {
  .error-container {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }
}

/* Touch-friendly enhancements */
.home-btn,
.back-btn {
  border-radius: 8px;
  font-weight: 600;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .steam {
    animation: none;
    opacity: 0.5;
  }

  .tea-accent {
    animation: none;
  }

  .tea-pun {
    animation: none;
    opacity: 0.9;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .error-title,
  .error-subtitle {
    color: #ffffff;
  }

  .cup-body {
    border-width: 3px;
  }

  .home-btn,
  .back-btn {
    border-width: 2px;
  }
}
</style>
