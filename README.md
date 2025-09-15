# WABot-NutriAI - WhatsApp Nutrition Assistant & AI Chatbot

WABot-NutriAI is an intelligent WhatsApp chatbot that helps users with personalized nutrition recommendations and AI-powered health chat.

> ⚠️ **Important Note**: The food recommendation feature requires a separate Machine Learning model which is not included in this repository. You need to develop or provide your own ML model API to enable this feature.

## Key Features

- 🍽️ **Personalized Meal Recommendations**: Based on user profile (age, weight, height, activity, goals)
- 💬 **Nutrition AI Chat**: Interactive chat with AI about health, nutrition, diet, and exercise
- 📊 **Nutrition Calculations**: Calculates BMI, BMR, and daily calorie needs
- 🔐 **Secure & Private**: All data is stored temporarily and not persisted

## How It Works

1. Send message `!halo` to start
2. Choose between:
   - `!recomend` to get food recommendations based on your profile
   - `!chat` to chat with AI about nutrition and health

### Recommendation Mode
The bot will ask several questions to build your nutrition profile:
- Gender
- Weight (kg)
- Height (cm)
- Age (years)
- Activity level (1-5)
- Goal (weight loss, muscle gain, health maintenance)

### AI Chat Mode
Ask anything about nutrition and health. The bot will automatically exit chat mode after 3 minutes of inactivity.

## Prerequisites

- Node.js (version 14 or higher)
- NPM (Node Package Manager)
- WhatsApp account

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/PanPanFR/WABot-NutriAI.git
   cd WABot-NutriAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `.env` file:
   Copy `.env.example` to `.env` and fill in appropriate values:
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file:
   ```env
   # WhatsApp Web Configuration
   WWEB_VERSION=2.3000.1024710243-alpha

   # API Configuration
   API_RECOMEND_URL=your_api_recomend_url_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # AI Model Configuration
   AI_MODEL=deepseek/deepseek-r1:free

   # Chat Configuration
   INACTIVITY_TIMEOUT_MINUTES=3
   ```

4. Run the bot:
   ```bash
   npm start
   ```

5. Scan the QR code that appears in the terminal using your WhatsApp to login.

## Bot Commands

- `!halo` - Display main menu
- `!recomend` - Start food recommendation process
- `!chat` - Start AI chat mode
- `!stop` - Exit AI chat mode

## Technologies Used

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - Library to connect bot with WhatsApp Web
- [OpenRouter](https://openrouter.ai/) - API for AI model
- [Node.js](https://nodejs.org/) - Runtime environment
- [Axios](https://axios-http.com/) - HTTP client for API requests

## Contributing

Contributions are very welcome! Please create a pull request or open an issue for suggestions and improvements.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Disclaimer

This bot is created for educational purposes and personal nutrition assistance. For professional medical advice, always consult with a qualified doctor or nutritionist.

The food recommendation feature depends on an external Machine Learning model which is not included in this repository. Users need to provide their own ML model API to enable this feature.