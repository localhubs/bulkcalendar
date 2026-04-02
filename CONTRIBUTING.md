# Contributing to Bulk Calendar

Thank you for your interest in contributing to Bulk Calendar! We welcome contributions from the community.

## Development Setup

### Prerequisites
- Node.js 14+ and npm installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/calendar.git
   cd calendar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173/`

## Development Workflow

### Running Tests
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Code Style

- Use 2-space indentation
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Test your changes thoroughly

## Making Changes

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add your feature description"
   ```

3. Push to your fork and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

## Reporting Issues

If you find a bug or have a feature request, please create an issue on GitHub with:
- A clear description of the problem
- Steps to reproduce (for bugs)
- Expected behavior
- Actual behavior
- Browser and OS information

## Pull Request Process

1. Update the README.md with any new features or changes
2. Ensure your code follows the existing style conventions
3. Test your changes thoroughly in both light and dark modes
4. Include a clear description of your changes in the PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
