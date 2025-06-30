<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="text-xl font-bold text-gray-900">
            ← Повернутися до магазину
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Про нас</h1>

        <!-- Hero Section -->
        <div class="text-center mb-12">
          <div class="text-6xl mb-4">🍺</div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Opillia - Найкращі напої та делікатеси
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Мережа фірмових магазинів якісних напоїв, крафтового пива, вин та делікатесів
            з доставкою по Києву. Ми пропонуємо найкращі продукти від українських та світових виробників.
          </p>
        </div>

        <!-- Our Story -->
        <div class="mb-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Наша історія</h3>
          <div class="prose prose-lg text-gray-700 space-y-4">
            <p>
              Opillia - це мережа спеціалізованих магазинів, що працює в Києві з 2018 року.
              Ми розпочали свою діяльність з метою забезпечити киян якісними напоями,
              крафтовим пивом, винами та делікатесами від найкращих українських та світових виробників.
            </p>
            <p>
              Наша команда складається з справжніх ентузіастів та знавців напоїв, які ретельно
              відбирають кожен продукт в нашому асортименті. Ми пишаємося тим, що підтримуємо
              українських виробників та пропонуємо нашим клієнтам унікальні смаки та якість.
            </p>
            <p>
              За роки роботи ми створили мережу магазинів у різних районах Києва та запустили
              зручний сервіс доставки, щоб наші клієнти могли насолоджуватися улюбленими напоями
              не виходячи з дому.
            </p>
          </div>
        </div>

        <!-- Our Values -->
        <div class="mb-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Наші цінності</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="text-center p-6 bg-blue-50 rounded-lg">
              <div class="text-3xl mb-3">🏆</div>
              <h4 class="font-semibold text-gray-900 mb-2">Якість</h4>
              <p class="text-gray-600 text-sm">
                Ретельно відбираємо продукцію від найкращих виробників
              </p>
            </div>
            <div class="text-center p-6 bg-green-50 rounded-lg">
              <div class="text-3xl mb-3">🤝</div>
              <h4 class="font-semibold text-gray-900 mb-2">Довіра</h4>
              <p class="text-gray-600 text-sm">
                Будуємо довгострокові відносини з нашими клієнтами
              </p>
            </div>
            <div class="text-center p-6 bg-yellow-50 rounded-lg">
              <div class="text-3xl mb-3">💰</div>
              <h4 class="font-semibold text-gray-900 mb-2">Доступність</h4>
              <p class="text-gray-600 text-sm">
                Пропонуємо конкурентні ціни на всю продукцію
              </p>
            </div>
          </div>
        </div>

        <!-- Our Products -->
        <div class="mb-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Наш асортимент</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-3">🍺 Пивна продукція</h4>
              <ul class="space-y-2 text-gray-700">
                <li>• Крафтове пиво місцевого виробництва</li>
                <li>• Імпортні сорти пива</li>
                <li>• Розливне пиво</li>
                <li>• Безалкогольне пиво</li>
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-3">🍷 Алкогольні напої</h4>
              <ul class="space-y-2 text-gray-700">
                <li>• Українські вина</li>
                <li>• Міцні алкогольні напої</li>
                <li>• Лікери та настоянки</li>
                <li>• Шампанське та ігристі вина</li>
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-3">🥤 Безалкогольні напої</h4>
              <ul class="space-y-2 text-gray-700">
                <li>• Соки та нектари</li>
                <li>• Мінеральна вода</li>
                <li>• Газовані напої</li>
                <li>• Енергетичні напої</li>
              </ul>
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-3">🍖 Закуски</h4>
              <ul class="space-y-2 text-gray-700">
                <li>• М'ясні делікатеси</li>
                <li>• Сири та молочні продукти</li>
                <li>• Рибна продукція</li>
                <li>• Снеки та горіхи</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Contact CTA -->
        <div class="text-center bg-primary-50 rounded-lg p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">
            Маєте питання?
          </h3>
          <p class="text-gray-600 mb-6">
            Наша команда завжди готова допомогти вам з вибором продукції
          </p>
          <div class="space-x-4">
            <router-link to="/contact" class="btn-primary">
              Зв'язатися з нами
            </router-link>
            <router-link to="/branches" class="btn-outline">
              Наші магазини
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
