# Contributing to FTP M3U Generator

Thank you for considering contributing to FTP M3U Generator! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct: be respectful, considerate, and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section.
- Use the bug report template to create a new issue if needed.
- Include detailed steps to reproduce the problem.
- Include screenshots if applicable.
- Describe what you expected to happen vs. what actually happened.

### Suggesting Enhancements

- Check if the enhancement has already been suggested in the Issues section.
- Use the feature request template to create a new issue.
- Provide a clear and detailed explanation of what you want to happen.
- Explain why this enhancement would be useful to most users.

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js and npm installed
- For Android development: Android Studio, JDK 11+

### Setting Up the Development Environment

1. Clone the repository
   ```
   git clone https://github.com/YOUR_USERNAME/ftp-m3u-generator.git
   cd ftp-m3u-generator
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

### Project Structure

- `/client`: Web frontend
- `/server`: Backend services 
- `/shared`: Shared types and schemas
- `/android`: Android app code

### Building for Android

See the [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md) file for instructions on building the Android version.

## Style Guidelines

### Code Style

- Follow the existing code style in the project
- Use TypeScript types for all variables and functions
- Keep functions small and focused on a single task
- Use meaningful variable and function names

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 72 characters
- Reference issues and pull requests when relevant

### Documentation

- Update the README.md with details of changes to the interface
- Update the documentation when adding new features or changing existing ones
- Comment your code where necessary to explain complex logic

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).