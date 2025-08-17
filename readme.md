# Webflow Barba GSAP Starter

## Overview

This project is a starter template for building a web application using Webflow, Barba.js for page transitions, and GSAP for animations. It is designed to be deployed on Netlify and includes a modern setup with Webpack for module bundling, SASS for styling, and ESLint for code quality.

## Features

- **Page Transitions**: Smooth transitions between pages using Barba.js.
- **Animations**: Rich animations powered by GSAP.
- **Responsive Design**: Built with mobile-first principles and responsive utilities.
- **Custom Cursor**: A unique cursor effect that enhances user interaction.
- **Lazy Loading**: Efficient loading of images and other resources.
- **SASS**: Modular and maintainable styles using SASS.

## Technologies Used

- **JavaScript**: ES6 modules
- **GSAP**: For animations
- **Barba.js**: For page transitions
- **Webpack**: Module bundler
- **SASS**: CSS preprocessor
- **ESLint**: Linting tool for JavaScript
- **Netlify**: Hosting platform

## Project Structure

```bash
/webflow-barba-gsap-starter
├── dist/ # Compiled output
├── src/ # Source files
│ ├── animations/ # Animation modules
│ ├── pages/ # Page modules
│ ├── styles/ # SASS styles
│ ├── utilities/ # Utility functions
│ ├── vendor.js # Third-party libraries
│ ├── index.js # Entry point
│ └── main.js # Main application logic
├── .gitignore # Git ignore file
├── .eslintrc.js # ESLint configuration
├── package.json # Project metadata and dependencies
├── package-lock.json # Lockfile for npm dependencies
├── netlify.toml # Netlify configuration
└── webpack.config.cjs # Webpack configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/webflow-barba-gsap-starter.git
   cd webflow-barba-gsap-starter
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

### Development

To start the development server, run:

```bash
npm run dev
```

This will start the Webpack development server and open your application in the browser at `http://localhost:1235`.

### Building for Production

To build the project for production, run:

```bash
npm run build
```

This will compile the source files and output them to the `dist/` directory.

### Deploying to Netlify

1. Push your code to a Git repository (GitHub, GitLab, etc.).
2. Create a new site on Netlify and link it to your repository.
3. Set the build command to `npm run build` and the publish directory to `dist`.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the project for production.
- `npm run start`: Start the Webpack Dev Server.
- `npm run lint`: Run ESLint to check for code quality issues.
- `npm run format`: Format code using Prettier.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Author

This README file was created by **Julian Fella**. I created this file because I found myself doing the same things over and over again, and I wanted the ultimate starter template for Webflow, Barba.js, and GSAP.
