<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center py-16">
        <div class="text-6xl mb-4">📄</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Order Details</h1>
        <p class="text-gray-600 mb-8">Order ID: {{ $route.params.id }}</p>
        <router-link to="/orders" class="btn-primary">
          Back to Orders
        </router-link>
      </div>
    </div>
  </div>
</template>
