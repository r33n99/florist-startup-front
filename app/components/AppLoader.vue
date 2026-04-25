<template>
  <svg
    width="260"
    height="120"
    viewBox="0 0 260 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="loader-title loader-description"
  >
    <title id="loader-title">Florist Studio</title>
    <desc id="loader-description">Загружаем рабочее место</desc>

    <g class="app-loader__petal">
      <ellipse cx="130" cy="22" rx="8" ry="18" fill="#26a69a" />
      <ellipse cx="130" cy="62" rx="8" ry="18" fill="#80cbc4" />
      <ellipse cx="110" cy="42" rx="18" ry="8" fill="#4db6ac" />
      <ellipse cx="150" cy="42" rx="18" ry="8" fill="#00897b" />
      <circle cx="130" cy="42" r="7" fill="#f5c542" />
    </g>

    <text x="130" y="88" text-anchor="middle" class="app-loader__text">Florist Studio</text>
    <text x="130" y="106" text-anchor="middle" class="app-loader__subtext">загружаем рабочее место</text>
  </svg>
</template>

<style scoped>
.app-loader__petal {
  transform-origin: 130px 42px;
  animation: app-loader-spin 1.4s linear infinite;
}

.app-loader__text {
  font-family: Inter, Arial, sans-serif;
  font-size: 18px;
  font-weight: 600;
  fill: var(--primary);
}

.app-loader__subtext {
  font-family: Inter, Arial, sans-serif;
  font-size: 12px;
  fill: var(--muted-foreground);
}

@keyframes app-loader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
