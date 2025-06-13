# NutriLoop - Food Tracking Made Simple

A modern, responsive food tracking application built with Next.js that helps you monitor your daily nutrition intake using AI-powered food recognition.

## Features

- **AI-Powered Nutrition Extraction**: Uses OpenAI to automatically calculate calories, fat, protein, and carbs from food names and weights/volumes
- **Flexible Unit Support**: Choose between grams (g) for solid foods and milliliters (ml) for liquids
- **Preview Before Adding**: Preview nutrition information before adding food entries to verify accuracy
- **Multi-Language Support**: Full internationalization with English and Chinese support
- **Auto Language Detection**: Automatically detects browser language with English fallback
- **Daily Progress Tracking**: Visual progress bars showing your consumption vs. daily goals
- **Offline Storage**: All data stored locally in IndexedDB for privacy and offline access
- **Responsive Design**: Works seamlessly on both mobile and desktop browsers
- **Smart Caching**: Reduces API calls by caching nutrition data for previously entered foods
- **Customizable Goals**: Set your own daily limits for calories, fat, protein, and carbs

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom UI components
- **Database**: IndexedDB for local storage
- **AI Integration**: OpenAI API for nutrition extraction
- **Icons**: Lucide React
- **Build Tool**: Turbo (monorepo)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- OpenAI API key

### Installation

1. Clone the repository and navigate to the nutriloop app:
```bash
cd apps/nutriloop
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Food Entries
1. Enter the food name (e.g., "Apple", "Chicken breast", "Rice")
2. Enter the weight and select unit (grams or ml)
   - Use **grams (g)** for solid foods like fruits, meat, bread
   - Use **milliliters (ml)** for liquids like milk, juice, oil
3. **Preview (Optional)**: Click "Preview" to see nutrition information before adding
   - This shows calories, fat, protein, and carbs for the specified weight/volume
   - The data is cached for faster subsequent additions
4. Click "Add Food" to save the entry
   - If you used Preview, no additional API call is made
   - If you didn't preview, the app will fetch nutrition data automatically

### Setting Daily Goals
1. Click "Show Settings" on the main page
2. Adjust your daily limits for calories, fat, protein, and carbs
3. Click "Save Limits" - settings are stored locally in IndexedDB

### Viewing Progress
- Progress bars show your current consumption vs. daily goals
- Color-coded indicators help you track your progress
- Food log displays all entries for the current day

### Data Management
- All data is stored locally in your browser
- Food nutrition data is cached to reduce API calls
- Delete individual entries by clicking the trash icon

### Language Support
- **Automatic Detection**: App detects your browser language automatically
- **Supported Languages**: English and Chinese (Simplified)
- **Language Switcher**: Globe icon in the top-right corner to change language
- **Fallback**: Defaults to English if browser language is not supported
- **Persistent**: Language preference is saved locally

## API Integration

The app uses OpenAI's GPT-3.5-turbo model to extract nutrition information with unit-aware prompts:

- **Solid Foods (grams)**: AI provides nutrition per 100g using standard weight-based values
- **Liquids (milliliters)**: AI considers density and provides nutrition per 100ml with liquid-specific properties
- **Smart Caching**: Results are cached separately by food name and unit for accuracy
- **Fallback Values**: Provides reasonable estimates for unrecognized foods

## Browser Compatibility

- Chrome/Edge 80+
- Firefox 77+
- Safari 13.1+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Privacy

- All personal data stays on your device
- No user accounts or data collection
- OpenAI API calls only send food names (no personal information)

## Development

### Project Structure
```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── dashboard.tsx   # Main dashboard
│   ├── food-input.tsx  # Food entry form
│   └── ...
├── lib/                # Utilities and services
│   ├── db.ts          # IndexedDB service
│   ├── openai.ts      # OpenAI integration
│   ├── types.ts       # TypeScript interfaces
│   └── utils.ts       # Helper functions
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.
