<template>
  <!-- Admin Login Screen -->
  <div v-if="!authStore.canAccessAdmin" class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <AdminLogin @success="handleAdminLoginSuccess" />
  </div>

  <!-- Admin Panel -->
  <div v-else class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Shop Admin</h1>
            <p class="text-gray-600">Manage your shop data and sync with Poster POS</p>
          </div>
          <div class="flex space-x-3">
            <router-link
              to="/admin/design"
              class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center space-x-2"
            >
              <span>🎨</span>
              <span>Design</span>
            </router-link>
            <router-link
              to="/admin/messaging"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <span>📱</span>
              <span>Messaging</span>
            </router-link>
            <button
              @click="openSiteConfigModal"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Site Configuration</span>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.icon }} {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- License Status -->
      <LicenseStatus />

      <!-- Overview Tab Content -->
      <div v-if="activeTab === 'overview'">
        <!-- Sync Controls -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Data Sync</h2>

        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <!-- Full Sync -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Full Sync</h3>
            <p class="text-sm text-gray-600 mb-4">Import all data from Poster POS API</p>
            <button
              @click="handleFullSync"
              :disabled="isLoading"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Syncing...' : 'Start Full Sync' }}
            </button>
          </div>

          <!-- Products Only Sync -->
          <div class="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <h3 class="font-medium text-gray-900 mb-2 flex items-center">
              <span class="text-orange-600 mr-2">🛍️</span>
              Products Only Sync
            </h3>
            <p class="text-sm text-gray-600 mb-3">Sync products from Poster API while <strong>preserving your category changes</strong></p>
            <div class="bg-orange-100 border border-orange-200 rounded-lg p-2 mb-3">
              <p class="text-xs text-orange-800">
                ✅ <strong>Safe for modified categories</strong> - Your category changes will NOT be overwritten
              </p>
            </div>
            <button
              @click="handleProductsOnlySync"
              :disabled="isLoading"
              class="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Syncing...' : 'Sync Products Only' }}
            </button>
          </div>

          <!-- Price Sync -->
          <div class="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <h3 class="font-medium text-gray-900 mb-2 flex items-center">
              <span class="text-yellow-600 mr-2">💰</span>
              Price Sync
            </h3>
            <p class="text-sm text-gray-600 mb-3">Update product prices from Poster API while <strong>preserving all other data</strong></p>
            <div class="bg-yellow-100 border border-yellow-200 rounded-lg p-2 mb-3">
              <p class="text-xs text-yellow-800">
                ✅ <strong>Safe update</strong> - Only prices will be updated, all other product data preserved
              </p>
            </div>
            <button
              @click="handlePriceSync"
              :disabled="isLoading"
              class="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Syncing...' : 'Sync Prices Only' }}
            </button>
          </div>

          <!-- Quick Inventory Sync -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Inventory Sync</h3>
            <p class="text-sm text-gray-600 mb-4">Update inventory levels only</p>
            <button
              @click="handleQuickSync"
              :disabled="isLoading"
              class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Syncing...' : 'Quick Sync' }}
            </button>
          </div>

          <!-- Auto Sync Images -->
          <div class="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <h3 class="font-medium text-gray-900 mb-2 flex items-center">
              <span class="text-purple-600 mr-2">🖼️</span>
              Auto Sync Images
            </h3>
            <p class="text-sm text-gray-600 mb-3">Automatically sync all product images to MinIO cloud storage</p>
            <div class="bg-purple-100 border border-purple-200 rounded-lg p-2 mb-3">
              <p class="text-xs text-purple-800">
                ✅ <strong>Fully automated</strong> - Downloads, optimizes, and uploads images automatically
              </p>
            </div>
            <button
              @click="handleAutoSyncImages"
              :disabled="isLoading"
              class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Syncing...' : 'Auto Sync Images' }}
            </button>
          </div>

          <!-- Refresh Data -->
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Refresh</h3>
            <p class="text-sm text-gray-600 mb-4">Reload data from database</p>
            <button
              @click="handleRefresh"
              :disabled="isLoading"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            >
              {{ isLoading ? 'Loading...' : 'Refresh Data' }}
            </button>
            <button
              @click="handleClearCache"
              :disabled="isLoading"
              class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Clear Cache
            </button>
          </div>
        </div>

        <!-- Sync Status -->
        <div v-if="syncStatus" class="mt-4 p-4 rounded-lg" :class="syncStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
          {{ syncStatus.message }}
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Categories</h3>
          <p class="text-2xl font-bold text-gray-900">{{ categories.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Products</h3>
          <p class="text-2xl font-bold text-gray-900">{{ products.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Available Products</h3>
          <p class="text-2xl font-bold text-gray-900">{{ availableProducts.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Branches</h3>
          <p class="text-2xl font-bold text-gray-900">{{ branches.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500">Orders</h3>
          <p class="text-2xl font-bold text-gray-900">{{ orders.length }}</p>
        </div>
      </div>
      </div>

      <!-- Orders Tab Content -->
      <div v-if="activeTab === 'orders'">
        <!-- Orders Management -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <div class="flex space-x-2">
            <select v-model="selectedOrderStatus" class="border border-gray-300 rounded-lg px-3 py-2">
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in filteredOrders" :key="order.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ order.order_number }}</div>
                  <div class="text-sm text-gray-500">{{ order.items.length }} items</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ order.customer_name }}</div>
                  <div class="text-sm text-gray-500">{{ order.customer_email }}</div>
                  <div class="text-sm text-gray-500">{{ formatPhoneNumber(order.customer_phone) }}</div>
                  <div v-if="order.no_callback_confirmation" class="text-xs text-blue-600 mt-1">
                    ✓ Без дзвінка для підтвердження
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ order.delivery_method === 'delivery' ? '🚚 Доставка' : '🏪 Самовивіз' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ order.delivery_method === 'delivery'
                        ? order.delivery_address
                        : order.pickup_branch?.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.total.toFixed(2) }} ₴
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    :value="order.status"
                    @change="updateOrderStatus(order.id, ($event.target as HTMLSelectElement).value as any)"
                    class="text-xs border border-gray-300 rounded px-2 py-1"
                    :class="getStatusColor(order.status)"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatOrderDate(order.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewOrderDetails(order)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredOrders.length === 0" class="text-center py-8 text-gray-500">
          No orders found
        </div>
        </div>
      </div>

      <!-- Branches Tab Content -->
      <div v-if="activeTab === 'branches'">
        <!-- Branches Management -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold text-gray-900">Branches</h2>
            <label class="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                v-model="showInactiveBranches"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Show inactive</span>
            </label>
          </div>
          <button
            @click="openBranchModal()"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Branch
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="branch in branches" :key="branch.id" :class="{ 'opacity-50 bg-gray-50': !branch.is_active }">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <div class="text-sm font-medium" :class="branch.is_active ? 'text-gray-900' : 'text-gray-500'">
                      {{ branch.display_name || branch.name }}
                    </div>
                    <span v-if="!branch.is_active" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">ID: {{ branch.id }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ branch.address || 'No address' }}</div>
                  <div v-if="branch.phone" class="text-sm text-gray-500">📞 {{ branch.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex space-x-2">
                    <span v-if="branch.pickup_available" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Pickup
                    </span>
                    <span v-if="branch.delivery_available" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Delivery
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="branch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ branch.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openBranchModal(branch)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="toggleBranchStatus(branch)"
                    :class="branch.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  >
                    {{ branch.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <!-- Categories Tab Content -->
      <div v-if="activeTab === 'categories'">
        <!-- Categories Management -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold text-gray-900">Categories</h2>
            <label class="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                v-model="showInactiveCategories"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Show inactive</span>
            </label>
          </div>
          <button
            @click="openCategoryModal()"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="category in categories" :key="category.id" :class="{ 'opacity-50 bg-gray-50': !category.is_active }">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <div class="text-sm font-medium" :class="category.is_active ? 'text-gray-900' : 'text-gray-500'">
                      {{ category.display_name }}
                    </div>
                    <span v-if="!category.is_active" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">ID: {{ category.id }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getCategoryProductCount(category.id) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ category.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openCategoryModal(category)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="toggleCategoryStatus(category)"
                    :class="category.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  >
                    {{ category.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <!-- Products Tab Content -->
      <div v-if="activeTab === 'products'">
        <!-- Products Management -->
        <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold text-gray-900">Products</h2>
            <label class="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                v-model="showInactiveProducts"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Show inactive</span>
            </label>
          </div>
          <div class="flex space-x-2">
            <button
              v-if="selectedProducts.length > 0"
              @click="openBulkEditModal"
              class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Bulk Edit ({{ selectedProducts.length }})</span>
            </button>
            <button
              @click="openProductModal()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="mb-4 flex flex-wrap gap-4 items-center">
          <!-- Search -->
          <div class="flex-1 min-w-64">
            <input
              v-model="productSearchQuery"
              type="text"
              placeholder="Search products..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Category Filter -->
          <select v-model="selectedCategoryFilter" class="border border-gray-300 rounded-lg px-3 py-2">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.display_name }}
            </option>
          </select>

          <!-- Status Filter -->
          <select v-model="selectedStatusFilter" class="border border-gray-300 rounded-lg px-3 py-2">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="available">Available</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <!-- Sort Options -->
          <select v-model="sortBy" class="border border-gray-300 rounded-lg px-3 py-2">
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
            <option value="stock">Sort by Stock</option>
            <option value="created_at">Sort by Date</option>
          </select>

          <button
            @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            class="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
            :title="sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="sortOrder === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="setSortBy('name')">
                  Product
                  <span v-if="sortBy === 'name'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="setSortBy('category')">
                  Category
                  <span v-if="sortBy === 'category'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="setSortBy('price')">
                  Price
                  <span v-if="sortBy === 'price'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custom Qty</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="setSortBy('stock')">
                  Stock
                  <span v-if="sortBy === 'stock'" class="ml-1">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in sortedAndFilteredProducts" :key="product.id"
                  :class="[
                    selectedProducts.includes(product.id) ? 'bg-blue-50' : 'hover:bg-gray-50',
                    !product.is_active ? 'opacity-50 bg-gray-50' : ''
                  ]">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="selectedProducts.includes(product.id)"
                    @change="toggleProductSelection(product.id)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img v-if="product.display_image_url"
                         :src="getImageUrl(product.display_image_url)"
                         :alt="product.display_name"
                         class="h-10 w-10 rounded-lg object-cover mr-3"
                         @error="handleImageError($event, product.poster_product_id)">
                    <div>
                      <div class="flex items-center space-x-2">
                        <div class="text-sm font-medium" :class="product.is_active ? 'text-gray-900' : 'text-gray-500'">
                          <span v-if="!editingProduct[product.id]?.name">{{ product.display_name }}</span>
                        <input v-else
                               v-model="editingProduct[product.id].display_name"
                               @blur="saveInlineEdit(product.id)"
                               @keyup.enter="saveInlineEdit(product.id)"
                               @keyup.escape="cancelInlineEdit(product.id)"
                               class="text-sm font-medium bg-transparent border-b border-blue-500 focus:outline-none"
                               :style="{ width: Math.max(editingProduct[product.id].display_name.length * 8, 100) + 'px' }"
                        />
                        <button v-if="!editingProduct[product.id]?.name"
                                @click="startInlineEdit(product, 'name')"
                                class="ml-2 text-gray-400 hover:text-blue-600">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        </div>
                        <span v-if="!product.is_active" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      </div>
                      <div class="text-sm text-gray-500">ID: {{ product.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span v-if="!editingProduct[product.id]?.category">{{ getCategoryName(product.category_id) }}</span>
                  <select v-else
                          v-model="editingProduct[product.id].category_id"
                          @blur="saveInlineEdit(product.id)"
                          @change="saveInlineEdit(product.id)"
                          class="text-sm bg-transparent border-b border-blue-500 focus:outline-none">
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.display_name }}
                    </option>
                  </select>
                  <button v-if="!editingProduct[product.id]?.category"
                          @click="startInlineEdit(product, 'category')"
                          class="ml-2 text-gray-400 hover:text-blue-600">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span v-if="!editingProduct[product.id]?.price">{{ formatPrice(product.price) }} ₴</span>
                  <div v-else class="flex items-center">
                    <input v-model.number="editingProduct[product.id].price"
                           @blur="saveInlineEdit(product.id)"
                           @keyup.enter="saveInlineEdit(product.id)"
                           @keyup.escape="cancelInlineEdit(product.id)"
                           type="number"
                           step="0.01"
                           class="text-sm bg-transparent border-b border-blue-500 focus:outline-none w-20"
                    />
                    <span class="ml-1 text-xs text-gray-500">₴</span>
                  </div>
                  <button v-if="!editingProduct[product.id]?.price"
                          @click="startInlineEdit(product, 'price')"
                          class="ml-2 text-gray-400 hover:text-blue-600">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div v-if="product.custom_quantity" class="text-xs">
                    <div>{{ product.custom_quantity }}kg</div>
                    <div class="text-gray-500">{{ product.custom_unit }}</div>
                  </div>
                  <span v-else class="text-gray-400 text-xs">Not set</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ product.quantity }} {{ product.unit }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col space-y-1">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ product.available ? 'Available' : 'Out of Stock' }}
                    </span>
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="product.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'">
                      {{ product.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex flex-col space-y-1">
                    <button
                      @click="openProductModal(product)"
                      class="text-blue-600 hover:text-blue-900 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      @click="toggleProductStatus(product)"
                      :class="product.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      class="text-xs"
                    >
                      {{ product.is_active ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <!-- Price Sync Tab Content -->
      <div v-if="activeTab === 'price-sync'">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Price Synchronization & Bulk Operations</h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Manual Price Update -->
            <div class="border border-blue-200 rounded-lg p-6 bg-blue-50">
              <h3 class="font-medium text-gray-900 mb-3 flex items-center">
                <span class="text-2xl mr-2">💰</span>
                Update Prices
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Manually update all product prices from Poster POS API. Only prices will be updated.
              </p>
              <div class="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
                <p class="text-xs text-blue-800">
                  ✅ Safe operation - Only prices are updated, all other product data preserved
                </p>
              </div>
              <button
                @click="handleManualPriceUpdate"
                :disabled="isLoading"
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Updating...' : 'Update Prices Now' }}
              </button>
            </div>

            <!-- Manual New Products Import -->
            <div class="border border-green-200 rounded-lg p-6 bg-green-50">
              <h3 class="font-medium text-gray-900 mb-3 flex items-center">
                <span class="text-2xl mr-2">🆕</span>
                Import New Products
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Manually import new products from Poster POS API that don't exist in the system yet.
              </p>
              <div class="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
                <p class="text-xs text-green-800">
                  ✅ Only new products are imported - existing products are not affected
                </p>
              </div>
              <button
                @click="handleManualNewProductsImport"
                :disabled="isLoading"
                class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Importing...' : 'Import New Products' }}
              </button>
            </div>

            <!-- Price Sync from Poster API (Legacy) -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="font-medium text-gray-900 mb-3 flex items-center">
                <span class="text-2xl mr-2">🔄</span>
                Sync Prices (Legacy)
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Update all product prices from the Poster POS system. This will overwrite current prices with the latest data from Poster API.
              </p>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p class="text-xs text-yellow-800">
                  ⚠️ This action will update prices for all products that have a Poster Product ID. Current prices will be overwritten.
                </p>
              </div>
              <button
                @click="handlePriceSync"
                :disabled="isLoading"
                class="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? 'Syncing Prices...' : 'Sync Prices (Legacy)' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Bulk Price Operations -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="font-medium text-gray-900 mb-3 flex items-center">
                <span class="text-2xl mr-2">💰</span>
                Bulk Price Operations
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Apply price changes to multiple products at once. Select products from the Products tab first.
              </p>

              <div class="space-y-4">
                <!-- Quick Multipliers -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Quick Price Multipliers</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      @click="applyQuickMultiplier(2)"
                      :disabled="selectedProducts.length === 0 || isLoading"
                      class="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      ×2 (Double)
                    </button>
                    <button
                      @click="applyQuickMultiplier(5)"
                      :disabled="selectedProducts.length === 0 || isLoading"
                      class="bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                    >
                      ×5 (5x)
                    </button>
                    <button
                      @click="applyQuickMultiplier(10)"
                      :disabled="selectedProducts.length === 0 || isLoading"
                      class="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      ×10 (10x)
                    </button>
                    <button
                      @click="applyQuickMultiplier(0.5)"
                      :disabled="selectedProducts.length === 0 || isLoading"
                      class="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      ×0.5 (Half)
                    </button>
                  </div>
                </div>

                <!-- Custom Multiplier -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Custom Multiplier</label>
                  <div class="flex space-x-2">
                    <input
                      v-model.number="customMultiplier"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="e.g., 1.5"
                      class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                    <button
                      @click="applyQuickMultiplier(customMultiplier)"
                      :disabled="selectedProducts.length === 0 || isLoading || !customMultiplier"
                      class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <!-- Selected Products Info -->
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-sm text-gray-600">
                    {{ selectedProducts.length > 0
                      ? `${selectedProducts.length} products selected for bulk operations`
                      : 'No products selected. Go to Products tab and select products first.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sync Status -->
          <div v-if="syncStatus" class="mt-6 p-4 rounded-lg" :class="syncStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
            {{ syncStatus.message }}
          </div>
        </div>
      </div>

      <!-- Discounts Tab Content -->
      <div v-if="activeTab === 'discounts'">
        <DiscountManager />
      </div>

      <!-- Banners Tab Content -->
      <div v-if="activeTab === 'banners'">
        <BannerManagement />
      </div>

      <!-- Inventory Status Tab Content -->
      <div v-if="activeTab === 'inventory'">
        <InventoryStatus :show-debug-info="true" />
      </div>

      <!-- Analytics Tab Content -->
      <div v-if="activeTab === 'analytics'">
        <RecommendationAnalytics />
      </div>

      <!-- Untappd Tab Content -->
      <div v-if="activeTab === 'untappd'">
        <UntappdManager />
      </div>

      <!-- 404 Errors Tab Content -->
      <div v-if="activeTab === '404-errors'">
        <NotFoundErrorsReport />
      </div>
    </div>

    <!-- Branch Edit Modal -->
    <BranchEditModal
      :is-open="showBranchModal"
      :branch="selectedBranch"
      @close="closeBranchModal"
      @save="handleBranchSave"
    />

    <!-- Category Edit Modal -->
    <CategoryEditModal
      :is-open="showCategoryModal"
      :category="selectedCategory"
      @close="closeCategoryModal"
      @save="handleCategorySave"
    />

    <!-- Product Edit Modal -->
    <ProductEditModal
      :is-open="showProductModal"
      :product="selectedProduct"
      :categories="categories"
      @close="closeProductModal"
      @save="handleProductSave"
    />

    <!-- Site Configuration Modal -->
    <SiteConfigModal
      :is-open="showSiteConfigModal"
      @close="closeSiteConfigModal"
      @saved="handleSiteConfigSaved"
    />

    <!-- Bulk Edit Modal -->
    <BulkEditModal
      :is-open="showBulkEditModal"
      :selected-product-ids="selectedProducts"
      :products="products"
      :categories="categories"
      @close="closeBulkEditModal"
      @save="handleBulkEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useBranchStore } from '@/stores/branch'
import { useOrdersStore } from '@/stores/orders'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useAuthStore } from '@/stores/auth'
import { backendApi } from '@/services/backendApi'
import BranchEditModal from '@/components/BranchEditModal.vue'
import CategoryEditModal from '@/components/admin/CategoryEditModal.vue'
import ProductEditModal from '@/components/admin/ProductEditModal.vue'
import SiteConfigModal from '@/components/admin/SiteConfigModal.vue'
import BulkEditModal from '@/components/admin/BulkEditModal.vue'
import BannerManagement from '@/components/admin/BannerManagement.vue'
import DiscountManager from '@/components/admin/DiscountManager.vue'
import InventoryStatus from '@/components/inventory/InventoryStatus.vue'
import RecommendationAnalytics from '@/components/admin/RecommendationAnalytics.vue'
import UntappdManager from '@/components/admin/UntappdManager.vue'
import NotFoundErrorsReport from '@/components/admin/NotFoundErrorsReport.vue'
import LicenseStatus from '@/components/license/LicenseStatus.vue'
import AdminLogin from '@/components/auth/AdminLogin.vue'
import type { Category, Product, Branch, SiteConfig } from '@/types'
import type { Order } from '@/stores/orders'

const productStore = useProductStore()
const branchStore = useBranchStore()
const ordersStore = useOrdersStore()
const siteConfigStore = useSiteConfigStore()
const authStore = useAuthStore()

// State
const isLoading = ref(false)
const syncStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)
const selectedCategoryFilter = ref('')
const selectedOrderStatus = ref('')

// Tab navigation
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', name: 'Overview', icon: '📊' },
  { id: 'orders', name: 'Orders', icon: '📦' },
  { id: 'products', name: 'Products', icon: '🛍️' },
  { id: 'categories', name: 'Categories', icon: '📂' },
  { id: 'branches', name: 'Branches', icon: '🏪' },
  { id: 'price-sync', name: 'Price Sync', icon: '💰' },
  { id: 'discounts', name: 'Discounts', icon: '🎁' },
  { id: 'banners', name: 'Banners', icon: '🎨' },
  { id: 'inventory', name: 'Inventory Status', icon: '📋' },
  { id: 'analytics', name: 'AI Analytics', icon: '🤖' },
  { id: 'untappd', name: 'Untappd', icon: '🍺' },
  { id: '404-errors', name: '404 Errors', icon: '⚠️' }
]

// Enhanced filtering and sorting
const productSearchQuery = ref('')
const selectedStatusFilter = ref('')
const sortBy = ref('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Show inactive items toggles
const showInactiveProducts = ref(false)
const showInactiveCategories = ref(false)
const showInactiveBranches = ref(false)

// Bulk editing
const selectedProducts = ref<string[]>([])
const showBulkEditModal = ref(false)

// Price sync
const customMultiplier = ref<number>(1)

// Inline editing
const editingProduct = ref<Record<string, any>>({})

// Modal state
const showBranchModal = ref(false)
const showCategoryModal = ref(false)
const showProductModal = ref(false)
const showSiteConfigModal = ref(false)
const selectedBranch = ref<Branch | null>(null)
const selectedCategory = ref<Category | null>(null)
const selectedProduct = ref<Product | null>(null)

// Computed
const categories = computed(() => productStore.categories)
const products = computed(() => productStore.products)
const availableProducts = computed(() => productStore.availableProducts)
const branches = computed(() => branchStore.branches)
const orders = computed(() => ordersStore.orders)

const filteredProducts = computed(() => {
  let filtered = products.value

  // Category filter
  if (selectedCategoryFilter.value) {
    filtered = filtered.filter(product => product.category_id === selectedCategoryFilter.value)
  }

  // Search filter
  if (productSearchQuery.value) {
    const query = productSearchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.display_name.toLowerCase().includes(query) ||
      product.name.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (selectedStatusFilter.value) {
    switch (selectedStatusFilter.value) {
      case 'active':
        filtered = filtered.filter(product => product.is_active)
        break
      case 'inactive':
        filtered = filtered.filter(product => !product.is_active)
        break
      case 'available':
        filtered = filtered.filter(product => product.available)
        break
      case 'out_of_stock':
        filtered = filtered.filter(product => !product.available)
        break
    }
  }

  return filtered
})

const sortedAndFilteredProducts = computed(() => {
  const filtered = [...filteredProducts.value]

  filtered.sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy.value) {
      case 'name':
        aValue = a.display_name.toLowerCase()
        bValue = b.display_name.toLowerCase()
        break
      case 'price':
        aValue = a.price
        bValue = b.price
        break
      case 'category':
        aValue = getCategoryName(a.category_id).toLowerCase()
        bValue = getCategoryName(b.category_id).toLowerCase()
        break
      case 'stock':
        aValue = a.quantity || 0
        bValue = b.quantity || 0
        break
      case 'created_at':
        aValue = new Date(a.created_at || 0)
        bValue = new Date(b.created_at || 0)
        break
      default:
        aValue = a.display_name.toLowerCase()
        bValue = b.display_name.toLowerCase()
    }

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

const isAllSelected = computed(() =>
  sortedAndFilteredProducts.value.length > 0 &&
  selectedProducts.value.length === sortedAndFilteredProducts.value.length
)

const filteredOrders = computed(() => {
  if (!selectedOrderStatus.value) return orders.value
  return orders.value.filter(order => order.status === selectedOrderStatus.value)
})

// Enhanced product management methods
const setSortBy = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const toggleProductSelection = (productId: string) => {
  const index = selectedProducts.value.indexOf(productId)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(productId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedProducts.value = []
  } else {
    selectedProducts.value = sortedAndFilteredProducts.value.map(p => p.id)
  }
}

const openBulkEditModal = () => {
  showBulkEditModal.value = true
}

const closeBulkEditModal = () => {
  showBulkEditModal.value = false
}

const handleBulkEdit = async (bulkUpdates: any) => {
  try {
    isLoading.value = true

    

    // Use the new backend bulk edit endpoint
    const result = await backendApi.bulkEditProducts(bulkUpdates)

    

    // Refresh products and clear selection
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)
    selectedProducts.value = []
    closeBulkEditModal()

    syncStatus.value = {
      type: 'success',
      message: result.message || `Successfully updated ${bulkUpdates.productIds.length} products!`
    }
  } catch (error: any) {
    console.error('❌ Bulk edit failed:', error)
    syncStatus.value = {
      type: 'error',
      message: error.message || 'Failed to update products. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const startInlineEdit = (product: Product, field: string) => {
  if (!editingProduct.value[product.id]) {
    editingProduct.value[product.id] = {}
  }

  editingProduct.value[product.id][field] = true
  editingProduct.value[product.id].display_name = product.display_name
  editingProduct.value[product.id].category_id = product.category_id
  editingProduct.value[product.id].price = product.price

  // Focus the input after Vue updates the DOM
  setTimeout(() => {
    const input = document.querySelector(`input[data-product-id="${product.id}"][data-field="${field}"]`) as HTMLInputElement
    if (input) input.focus()
  }, 50)
}

const saveInlineEdit = async (productId: string) => {
  const editData = editingProduct.value[productId]
  if (!editData) return

  try {
    const updates: any = {}

    if (editData.display_name !== undefined) {
      updates.display_name = editData.display_name
    }
    if (editData.category_id !== undefined) {
      updates.category_id = editData.category_id
    }
    if (editData.price !== undefined) {
      updates.price = editData.price
    }

    await backendApi.updateProduct(productId, updates)
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)

    // Clear editing state
    delete editingProduct.value[productId]

    syncStatus.value = { type: 'success', message: 'Product updated successfully!' }
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to update product.' }
    cancelInlineEdit(productId)
  }
}

const cancelInlineEdit = (productId: string) => {
  delete editingProduct.value[productId]
}

// Methods
const handleFullSync = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {
    await productStore.syncFromPoster()
    syncStatus.value = { type: 'success', message: 'Full sync completed successfully!' }
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Full sync failed. Please try again.' }
  } finally {
    isLoading.value = false
  }
}

const handleProductsOnlySync = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {
    

    const result = await backendApi.syncProductsOnly()
    

    // Refresh products to show updated data
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)

    syncStatus.value = {
      type: 'success',
      message: result.message || 'Products-only sync completed successfully! Your category changes have been preserved.'
    }
  } catch (error: any) {
    console.error('❌ Products-only sync failed:', error)
    syncStatus.value = {
      type: 'error',
      message: error.message || 'Products-only sync failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const handlePriceSync = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {


    const result = await backendApi.syncPricesOnly()


    // Refresh products to show updated prices
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)

    syncStatus.value = {
      type: 'success',
      message: result.message || 'Price sync completed successfully! Product prices have been updated from Poster POS.'
    }
  } catch (error: any) {
    console.error('❌ Price sync failed:', error)
    syncStatus.value = {
      type: 'error',
      message: error.message || 'Price sync failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleQuickSync = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {
    await productStore.quickInventorySync()
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID) // Refresh products
    syncStatus.value = { type: 'success', message: 'Inventory sync completed successfully!' }
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Inventory sync failed. Please try again.' }
  } finally {
    isLoading.value = false
  }
}

// Auto sync images - automatically syncs all product images to MinIO
const handleAutoSyncImages = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/sync/auto-sync-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    // Refresh products to show updated image URLs
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)

    syncStatus.value = {
      type: 'success',
      message: `✅ Auto image sync completed! Updated ${result.stats?.updated || 0} products to MinIO. Skipped: ${result.stats?.skipped || 0}, Errors: ${result.stats?.errors || 0}.`
    }
  } catch (error) {
    console.error('❌ Auto image sync failed:', error)
    syncStatus.value = { type: 'error', message: 'Auto image sync failed. Please try again.' }
  } finally {
    isLoading.value = false
  }
}



// Manual price update from Poster POS
const handleManualPriceUpdate = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/sync/update-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    // Refresh products to show updated prices
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)

    syncStatus.value = {
      type: 'success',
      message: `✅ Price update completed! Updated ${result.stats?.updated_prices || 0} prices from Poster POS.`
    }
  } catch (error: any) {
    console.error('❌ Manual price update failed:', error)
    syncStatus.value = {
      type: 'error',
      message: error.message || 'Price update failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

// Manual new products import from Poster POS
const handleManualNewProductsImport = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/sync/import-new-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    // Refresh products to show newly imported products
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)

    syncStatus.value = {
      type: 'success',
      message: `✅ New products import completed! Imported ${result.stats?.new_products || 0} new products from Poster POS.`
    }
  } catch (error: any) {
    console.error('❌ Manual new products import failed:', error)
    syncStatus.value = {
      type: 'error',
      message: error.message || 'New products import failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const applyQuickMultiplier = async (multiplier: number) => {
  if (selectedProducts.value.length === 0) {
    syncStatus.value = { type: 'error', message: 'Please select products first from the Products tab.' }
    return
  }

  if (!multiplier || multiplier <= 0) {
    syncStatus.value = { type: 'error', message: 'Please enter a valid multiplier greater than 0.' }
    return
  }

  try {
    isLoading.value = true
    

    const bulkUpdates = {
      productIds: selectedProducts.value,
      updates: {
        priceAdjustment: {
          type: 'multiply',
          value: multiplier
        }
      }
    }

    const result = await backendApi.bulkEditProducts(bulkUpdates)
    

    // Refresh products and clear selection
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)
    selectedProducts.value = []

    syncStatus.value = {
      type: 'success',
      message: `Successfully applied ${multiplier}x multiplier to ${result.stats?.success || 0} products!`
    }
  } catch (error: any) {
    console.error('❌ Quick multiplier failed:', error)
    syncStatus.value = {
      type: 'error',
      message: error.message || 'Failed to apply price multiplier. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleRefresh = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {
    await productStore.fetchCategories(true)
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)
    await branchStore.fetchBranches(true)
    syncStatus.value = { type: 'success', message: 'Data refreshed successfully!' }
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to refresh data. Please try again.' }
  } finally {
    isLoading.value = false
  }
}

const handleClearCache = async () => {
  isLoading.value = true
  syncStatus.value = null

  try {
    // Clear all caches
    branchStore.clearCache()
    productStore.clearCache()

    // Force refresh all data from backend
    await productStore.fetchCategories(true)
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)
    await branchStore.fetchBranches(true)

    syncStatus.value = { type: 'success', message: 'Cache cleared and data refreshed successfully!' }
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to clear cache. Please try again.' }
  } finally {
    isLoading.value = false
  }
}

const getCategoryProductCount = (categoryId: string): number => {
  return products.value.filter(product => product.category_id === categoryId).length
}

const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category?.display_name || 'Unknown'
}

const formatPrice = (price: number): string => {
  return price.toFixed(2)
}

const getImageUrl = (imagePath: string): string => {
  return backendApi.getImageUrl(imagePath)
}

const handleImageError = (event: Event, posterProductId: string) => {
  const img = event.target as HTMLImageElement

  // If this is a local image that failed, try the Poster fallback
  if (img.src.includes('/images/products/')) {
    img.src = backendApi.getPosterImageUrl(posterProductId)
  } else {
    // If even the fallback fails, hide the image
    img.style.display = 'none'
  }
}

// Modal methods
const openBranchModal = (branch?: Branch) => {
  selectedBranch.value = branch || null
  showBranchModal.value = true
}

const closeBranchModal = () => {
  showBranchModal.value = false
  selectedBranch.value = null
}

const openCategoryModal = (category?: Category) => {
  selectedCategory.value = category || null
  showCategoryModal.value = true
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
  selectedCategory.value = null
}

const openProductModal = (product?: Product) => {
  
  selectedProduct.value = product || null
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  selectedProduct.value = null
}

const openSiteConfigModal = () => {
  showSiteConfigModal.value = true
}

const closeSiteConfigModal = () => {
  showSiteConfigModal.value = false
}

// Admin authentication
const handleAdminLoginSuccess = () => {
  // Login successful, the admin panel will now be visible
  // Load initial data
  loadInitialData()
}

const loadInitialData = async () => {
  await handleRefresh()
  await siteConfigStore.initialize()
}

// Save handlers
const handleBranchSave = async (branchData: Partial<Branch>) => {
  try {
    if (selectedBranch.value) {
      // Update existing branch
      await backendApi.updateBranch(selectedBranch.value.id, branchData)
      syncStatus.value = { type: 'success', message: 'Branch updated successfully!' }
    } else {
      // Create new branch
      await backendApi.createBranch(branchData as Omit<Branch, 'id' | 'created_at' | 'updated_at'>)
      syncStatus.value = { type: 'success', message: 'Branch created successfully!' }
    }

    // Refresh branches
    await branchStore.fetchBranches(true)
    closeBranchModal()
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to save branch. Please try again.' }
  }
}

const handleCategorySave = async (categoryData: Partial<Category>) => {
  try {
    if (selectedCategory.value) {
      // Update existing category
      await backendApi.updateCategory(selectedCategory.value.id, categoryData)
      syncStatus.value = { type: 'success', message: 'Category updated successfully!' }
    } else {
      // Create new category
      await backendApi.createCategory(categoryData as Omit<Category, 'id' | 'created_at' | 'updated_at' | 'product_count'>)
      syncStatus.value = { type: 'success', message: 'Category created successfully!' }
    }

    // Refresh categories
    await productStore.fetchCategories(true)
    closeCategoryModal()
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to save category. Please try again.' }
  }
}

const handleProductSave = async (productData: Partial<Product>) => {
  try {
    if (selectedProduct.value) {
      // Update existing product
      await backendApi.updateProduct(selectedProduct.value.id, productData)
      syncStatus.value = { type: 'success', message: 'Product updated successfully!' }
    } else {
      // Create new product
      await backendApi.createProduct(productData as Omit<Product, 'id' | 'created_at' | 'updated_at' | 'quantity' | 'unit' | 'available'>)
      syncStatus.value = { type: 'success', message: 'Product created successfully!' }
    }

    // Refresh products
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)
    closeProductModal()
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to save product. Please try again.' }
  }
}

const handleSiteConfigSaved = (config: SiteConfig) => {
  syncStatus.value = { type: 'success', message: 'Site configuration updated successfully!' }
  
}

// Toggle status methods
const toggleBranchStatus = async (branch: Branch) => {
  try {
    await backendApi.updateBranch(branch.id, { is_active: !branch.is_active })
    syncStatus.value = {
      type: 'success',
      message: `Branch ${branch.is_active ? 'deactivated' : 'activated'} successfully!`
    }

    // Refresh branches
    await branchStore.fetchBranches(true)
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to update branch status.' }
  }
}

const toggleCategoryStatus = async (category: Category) => {
  try {
    await backendApi.updateCategory(category.id, { is_active: !category.is_active })
    syncStatus.value = {
      type: 'success',
      message: `Category ${category.is_active ? 'deactivated' : 'activated'} successfully!`
    }

    // Refresh categories
    await productStore.fetchCategories(true)
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to update category status.' }
  }
}

const toggleProductStatus = async (product: Product) => {
  try {
    await backendApi.updateProduct(product.id, { is_active: !product.is_active })
    syncStatus.value = {
      type: 'success',
      message: `Product ${product.is_active ? 'deactivated' : 'activated'} successfully!`
    }

    // Refresh products
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID)
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to update product status.' }
  }
}

// Orders methods
const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    await ordersStore.updateOrderStatus(orderId, status)
    syncStatus.value = { type: 'success', message: 'Order status updated successfully!' }
  } catch (error) {
    syncStatus.value = { type: 'error', message: 'Failed to update order status.' }
  }
}

const viewOrderDetails = (order: Order) => {
  // For now, just log the order details
  
  // In a real app, you might open a modal or navigate to a detailed view
}

const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If it's in the correct format (starts with 380 and 12 digits)
  if (digits.startsWith('380') && digits.length === 12) {
    const localDigits = digits.slice(3) // Remove 380 prefix (get 9 digits)
    return `+38(0${localDigits.slice(0, 2)}) ${localDigits.slice(2, 5)}-${localDigits.slice(5, 7)}-${localDigits.slice(7, 9)}`
  }

  // If it starts with 0 (Ukrainian format)
  if (digits.startsWith('0') && digits.length === 10) {
    return `+38(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
  }

  // If it's 9 digits (without leading 0)
  if (digits.length === 9) {
    return `+38(0${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`
  }

  // For invalid/short numbers, just return as is with a note
  return phone + ' (неповний номер)'
}

const getStatusColor = (status: Order['status']): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Default branch ID (Bratislavska) for admin panel inventory display
const DEFAULT_BRANCH_ID = 'cmclpsiy60003stlk9kpfn3yc'

// Watch for toggle changes to refresh data
watch(showInactiveProducts, async (newValue) => {
  if (authStore.canAccessAdmin) {
    await productStore.fetchProducts(undefined, true, DEFAULT_BRANCH_ID, true, newValue)
  }
})

watch(showInactiveCategories, async (newValue) => {
  if (authStore.canAccessAdmin) {
    await productStore.fetchCategories(true, true, newValue)
  }
})

watch(showInactiveBranches, async (newValue) => {
  if (authStore.canAccessAdmin) {
    await branchStore.fetchBranches(true, true, newValue)
  }
})

// Initialize
onMounted(async () => {
  // Initialize auth store
  authStore.loadFromStorage()

  // Only load data if already authenticated
  if (authStore.canAccessAdmin) {
    await loadInitialData()
  }
})
</script>

<style scoped>
/* Additional styles for inventory status component */
</style>
