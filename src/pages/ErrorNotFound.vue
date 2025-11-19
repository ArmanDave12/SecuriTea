<template>
  <div class="fullscreen bg-deep-blue text-white text-center q-pa-md flex flex-center">
    <div class="error-container">
      <!-- Tea cup with steam animation -->
      <div class="tea-cup-container q-mb-lg">
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
      <div class="error-number q-mb-md">4<span class="tea-accent">0</span>4</div>

      <!-- Error message -->
      <div class="text-h3 q-mb-sm" style="color: #90a4ae">Oops! This blend isn't brewing...</div>

      <div class="text-h6 q-mb-xl" style="color: #90a4ae; opacity: 0.7">
        The page you're looking for seems to have steeped away.
      </div>

      <!-- Action buttons -->
      <div class="q-gutter-md">
        <q-btn
          class="home-btn"
          color="teal"
          text-color="white"
          unelevated
          size="lg"
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
          size="lg"
          @click="$router.go(-1)"
          label="Go Back"
          no-caps
          icon="arrow_back"
        />
      </div>

      <!-- Security tea pun -->
      <div class="tea-pun q-mt-xl">
        <q-icon name="security" color="leaf-green" size="sm" class="q-mr-sm" />
        <span style="color: #81c784">Your security is still brewing perfectly!</span>
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
  max-width: 500px;
}

/* Tea Cup Styling */
.tea-cup-container {
  position: relative;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tea-cup {
  position: relative;
  width: 80px;
  height: 60px;
}

.cup-body {
  width: 60px;
  height: 50px;
  background: linear-gradient(to bottom, #26a69a 0%, #00695c 100%);
  border-radius: 0 0 20px 20px;
  border: 3px solid #004d40;
  position: relative;
}

.cup-handle {
  position: absolute;
  right: -15px;
  top: 10px;
  width: 20px;
  height: 25px;
  border: 3px solid #ff8a65;
  border-left: none;
  border-radius: 0 10px 10px 0;
}

.tea-surface {
  position: absolute;
  top: 5px;
  left: 6px;
  width: 48px;
  height: 8px;
  background: linear-gradient(90deg, #81c784 0%, #4caf50 100%);
  border-radius: 50%;
  opacity: 0.8;
}

/* Steam Animation */
.steam {
  position: absolute;
  width: 3px;
  height: 20px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 50%;
  animation: steam-rise 2s ease-in-out infinite;
}

.steam-1 {
  left: 20px;
  top: -25px;
  animation-delay: 0s;
}

.steam-2 {
  left: 30px;
  top: -30px;
  animation-delay: 0.5s;
}

.steam-3 {
  left: 40px;
  top: -25px;
  animation-delay: 1s;
}

@keyframes steam-rise {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-10px) rotate(2deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) rotate(-2deg);
  }
}

/* Error Number Styling */
.error-number {
  font-size: 8rem;
  font-weight: 900;
  color: #26a69a;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.tea-accent {
  color: #ff8a65;
  animation: pulse-orange 2s ease-in-out infinite alternate;
}

@keyframes pulse-orange {
  0% {
    color: #ff8a65;
    text-shadow: 0 0 10px rgba(255, 138, 101, 0.5);
  }
  100% {
    color: #ff6e40;
    text-shadow: 0 0 20px rgba(255, 110, 64, 0.8);
  }
}

/* Button Styling */
.home-btn {
  background: linear-gradient(45deg, #26a69a 0%, #00897b 100%);
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.4);
  transition: all 0.3s ease;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(38, 166, 154, 0.6);
}

.back-btn {
  border-color: #ff8a65;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: rgba(255, 138, 101, 0.1);
  transform: translateY(-1px);
}

/* Tea Pun Styling */
.tea-pun {
  font-size: 0.9rem;
  opacity: 0.9;
  animation: gentle-glow 3s ease-in-out infinite alternate;
}

@keyframes gentle-glow {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 600px) {
  .error-number {
    font-size: 6rem;
  }

  .tea-cup {
    transform: scale(0.8);
  }

  .text-h3 {
    font-size: 1.5rem;
  }

  .text-h6 {
    font-size: 1rem;
  }
}

/* Custom color classes for Quasar */
.text-teal {
  color: #26a69a !important;
}

.text-leaf-green {
  color: #81c784 !important;
}

.text-soft-orange {
  color: #ff8a65 !important;
}

.text-slate-gray {
  color: #90a4ae !important;
}
</style>
