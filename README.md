# 🛒 PWA POS Shop - AI-Powered E-commerce Platform

A modern Progressive Web App (PWA) for beverage and food delivery with AI chat assistant, multi-channel messaging, intelligent product recommendations, and advanced bottle management system.

## 🌟 Features

### 🍺 Advanced Beverage Management
- **Draft Beverage System** - Automatic bottle selection and pricing for draft products
- **Smart Bottle Sync** - Real-time bottle quantity synchronization with beverage amounts
- **Weight-Based Products** - Custom quantity system for products sold by weight (per kg/gram)
- **Bottle Product Management** - Separate bottle inventory with automatic cart integration
- **Custom Quantities** - Flexible quantity options for specialty products (икра, икряник)

### 🤖 AI-Powered Features
- **AI Chat Assistant** - Instant customer support with OpenAI GPT-4 integration
- **Smart Product Recommendations** - Context-aware suggestions to boost sales
- **Natural Language Processing** - Understands Ukrainian and English commands
- **Recommendation Analytics** - Track AI suggestion performance and user engagement

### 📱 Multi-Channel Communication
- **Email Notifications** - Beautiful HTML templates with order updates
- **Telegram Integration** - Instant messaging via bot API
- **Viber Support** - Rich messaging with interactive buttons
- **SMS Fallback** - Reliable delivery for critical notifications
- **Ukrainian Phone Validation** - Proper formatting and validation for Ukrainian numbers

### ⭐ Review & Rating System
- **Post-Order Reviews** - Automated review requests after delivery
- **Image Upload** - Customers can add photos to reviews
- **Incentivized Feedback** - Discount codes for completed reviews
- **Review Analytics** - Insights for business improvement

### 🛍️ E-commerce Features
- **Product Catalog** - Integration with Poster POS API with real-time sync
- **Dynamic Banners** - Homepage and shop page banner slider with admin management
- **Image Management** - Upload and manage banner images with drag & drop reordering
- **Smart Cart** - Automatic product combination and inventory validation
- **Delivery Management** - Location-based pricing and routing with Kyiv address autocomplete
- **Order Tracking** - Real-time status updates with Poster POS integration
- **Daily Deals** - Sale price management with special "Акції" section
- **Product Attributes** - Visual indicators for alcohol strength, bitterness, etc.

### 🌍 Location & Delivery
- **Geolocation Services** - Automatic nearby branch detection using Capacitor.js
- **Interactive Maps** - OpenStreetMap integration with Leaflet for delivery areas
- **Address Autocomplete** - Ukrainian street names with separate house number fields
- **Delivery Pricing** - Free pickup, 99 UAH within 2km, +30 UAH per additional km
- **Branch Selection** - Smart branch assignment based on customer location

### 📊 Business Intelligence & Analytics
- **Google Analytics 4** - Comprehensive tracking with ID: G-Y3NZ5WWN9G
- **Sales Analytics** - Revenue tracking and insights
- **Customer Behavior** - AI-powered analytics
- **Inventory Management** - Real-time stock levels with branch-specific availability
- **Performance Metrics** - Conversion and engagement tracking
- **Poster POS Integration** - Seamless data synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Modern web browser
- (Optional) OpenAI API key for full AI features

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/pwa-pos.git
cd pwa-pos
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file in the root directory:
```env
# Required - Backend API
VITE_BACKEND_URL=http://localhost:3000

# Optional - AI Features (for full functionality)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional - Messaging (when backend ready)
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_VIBER_BOT_TOKEN=your_viber_bot_token

# Poster POS Integration
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5176` to see the application.

### 5. Test AI Features
Visit `http://localhost:5176/communication-demo` to test all AI and communication features.

## 🛠️ Technical Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Capacitor.js** - Native mobile app capabilities
- **PWA** - Service worker, offline support, installable

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma** - Database ORM with PostgreSQL
- **Railway** - Cloud hosting platform
- **File Upload** - Local storage with image optimization

### Integrations
- **Poster POS API** - Real-time inventory and order management
- **OpenAI GPT-4** - AI chat assistant and recommendations
- **Google Analytics 4** - Comprehensive tracking (G-Y3NZ5WWN9G)
- **OpenStreetMap/Leaflet** - Interactive maps for delivery
- **Telegram/Viber APIs** - Multi-channel messaging

### Deployment
- **Frontend**: Netlify (opillia.com.ua)
- **Backend**: Railway (backend-api-production-b3a0.up.railway.app)
- **Database**: PostgreSQL on Railway
- **Blog**: WordPress on blog.opillia.com.ua
- **Redirects**: Netlify _redirects for SEO-friendly blog migration

## 🎯 Demo & Testing

### AI Chat Commands (Work Immediately)
Try these commands in the chat widget (blue button, bottom-right):
- `Популярні товари` - Shows popular products
- `Показати категорії` - Lists all categories
- `Кошик` - Shows cart contents
- `Інформація про доставку` - Delivery information
- `Допомога` - Help menu

### Test Pages
- `/communication-demo` - Complete feature demonstration
- `/review-order/demo` - Review system testing
- `/location-demo` - Location services
- `/capacitor-demo` - Mobile features

## 📦 Build & Deploy

### Current Production Deployment
- **Frontend**: https://opillia.com.ua (Netlify)
- **Backend**: https://backend-api-production-b3a0.up.railway.app (Railway)
- **Blog**: https://blog.opillia.com.ua (WordPress)

### Build for Production
```bash
npm run build
```

### Deploy Frontend to Netlify
```bash
# Build and deploy to production
npm run build
netlify deploy --prod --dir=dist
```

### Deploy Backend to Railway
```bash
# Navigate to server directory
cd server

# Deploy using Railway CLI
railway up
```

### Environment Variables (Production)
**Frontend (Netlify):**
```env
VITE_BACKEND_URL=https://backend-api-production-b3a0.up.railway.app
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
```

**Backend (Railway):**
```env
DATABASE_URL=postgresql://username:password@host:port/database
POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VIBER_BOT_TOKEN=your_viber_bot_token
```

### Blog Redirects
The system includes comprehensive blog redirects from opillia.com.ua to blog.opillia.com.ua:
- All blog posts: `/2023/05/post-name/` → `https://blog.opillia.com.ua/2023/05/post-name/`
- Categories: `/ohliady/`, `/novyny/` → `https://blog.opillia.com.ua/category/`
- SEO-friendly 301 redirects preserve search rankings

## 🔧 Configuration

### OpenAI API Setup (Optional)
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `.env`: `VITE_OPENAI_API_KEY=your_key_here`
3. Restart development server

**Note**: AI chat works with local commands even without OpenAI API.

### Telegram Bot Setup (Optional)
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create new bot: `/newbot`
3. Get bot token and add to `.env`
4. Set webhook (when backend ready): `https://your-api.com/telegram/webhook`

### Viber Bot Setup (Optional)
1. Create bot at [Viber Admin Panel](https://partners.viber.com)
2. Get authentication token
3. Add to `.env`: `VITE_VIBER_BOT_TOKEN=your_token`
4. Set webhook (when backend ready): `https://your-api.com/viber/webhook`

## 🏗️ Architecture

### Frontend Stack
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Capacitor.js** - Mobile app capabilities

### AI & Communication
- **OpenAI GPT-4** - Natural language processing
- **Local ML** - Privacy-focused recommendations
- **Multi-channel Messaging** - Email, Telegram, Viber, SMS
- **Automated Workflows** - Event-driven communication

### Integration
- **Poster POS API** - Product and inventory data
- **Geolocation API** - Location-based services
- **PWA Features** - Offline support, push notifications

## 📱 Mobile App (Optional)

### Build Mobile App
```bash
# Add mobile platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

### Requirements
- **iOS**: Xcode 12+, iOS 13+
- **Android**: Android Studio, API level 22+

## 🔒 Security

### Environment Variables
- Never commit `.env` files
- Use different keys for development/production
- Rotate API keys regularly

### API Security
- Implement rate limiting
- Use HTTPS in production
- Validate all user inputs
- Sanitize data before storage

## 📊 Analytics & Monitoring

### Built-in Analytics
- Order conversion tracking
- Product recommendation effectiveness
- Chat interaction metrics
- Review completion rates

### Integration Options
- Google Analytics 4
- Mixpanel
- Custom analytics dashboard

## 🛠️ Development

### Project Structure
```
src/
├── components/          # Reusable Vue components
│   ├── chat/           # AI chat components
│   ├── reviews/        # Review system
│   ├── recommendations/ # Product suggestions
│   └── messaging/      # Communication preferences
├── services/           # API and business logic
│   ├── aiChatService.ts
│   ├── messagingService.ts
│   └── reviewService.ts
├── stores/             # Pinia state management
├── views/              # Page components
└── types/              # TypeScript definitions
```

### Key Services
- `aiChatService.ts` - AI chat functionality
- `messagingService.ts` - Multi-channel messaging
- `reviewService.ts` - Review management
- `communicationHub.ts` - Event coordination

### Adding New Features
1. Create component in appropriate folder
2. Add TypeScript types in `types/`
3. Implement service logic
4. Add to router if needed
5. Update tests

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Manual Testing
1. Visit `/communication-demo` for feature overview
2. Test chat commands in widget
3. Try product recommendations
4. Test mobile responsiveness

## 🚀 Production Checklist

### Before Deployment
- [ ] Set production environment variables
- [ ] Test all AI chat commands
- [ ] Verify product recommendations
- [ ] Check mobile responsiveness
- [ ] Test offline functionality
- [ ] Validate security settings

### Post-Deployment
- [ ] Monitor error logs
- [ ] Track conversion metrics
- [ ] Gather user feedback
- [ ] Optimize performance
- [ ] Update documentation

## 📞 Support

### Documentation
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Discord for real-time help

## 📄 License

MIT License - see LICENSE file for details.

## 🎉 What's Working Now

### ✅ Immediate Features (No Backend Required)
- AI chat with local commands
- Product recommendations
- Review UI components
- Messaging templates
- Mobile-responsive design

### ⚠️ Requires Backend
- Review data persistence
- Email sending
- Telegram/Viber bots
- User preferences storage
- Order management

### 🔮 Future Enhancements
- Voice commands
- AR product preview
- Advanced analytics
- Multi-language support
- Social media integration

---

**Ready to boost your e-commerce sales with AI? Start with `npm install` and visit `/communication-demo`!** 🚀
