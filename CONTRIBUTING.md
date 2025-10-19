# Contributing to VideoDQ

Thank you for your interest in contributing to VideoDQ! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/videodq.git`
3. Add upstream remote: `git remote add upstream https://github.com/islamwell/videodq.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

Follow the setup instructions in [TESTING.md](TESTING.md) to get your development environment running.

## Making Changes

### Code Style

**JavaScript/TypeScript:**
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings (except in JSX where double quotes are preferred)
- Use meaningful variable and function names
- Add comments for complex logic

**React/React Native:**
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop validation

**Backend:**
- Use async/await for asynchronous operations
- Handle errors properly with try-catch blocks
- Return consistent response formats
- Validate input data

### Commit Messages

Use clear and descriptive commit messages:

```
feat: add video search functionality
fix: resolve video player pause issue
docs: update API documentation
style: format code with prettier
refactor: simplify video card component
test: add tests for video service
chore: update dependencies
```

### Pull Request Process

1. Update your branch with latest upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Run tests and linting:
   ```bash
   # Backend
   cd backend && npm test
   
   # Web
   cd web && npm run lint && npm run build
   
   # Mobile
   cd mobile && npx expo-doctor
   ```

3. Push your changes:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all checks pass

5. Wait for review and address feedback

## Areas for Contribution

### Features
- Video upload functionality
- User authentication and profiles
- Video categories and filtering
- Search functionality
- Bookmarks/favorites
- Playlists
- Comments and ratings
- Video recommendations
- Subtitles/captions support
- Multiple language support

### Improvements
- Performance optimizations
- Accessibility improvements
- Better error handling
- Additional tests
- Documentation improvements
- UI/UX enhancements

### Bug Fixes
- Check the Issues page for known bugs
- Report new bugs with detailed reproduction steps

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test on multiple devices/browsers when applicable

## Documentation

- Update README.md if adding new features
- Update TESTING.md for setup changes
- Add JSDoc comments for functions
- Update API documentation for endpoint changes

## Questions?

- Open an issue for general questions
- Tag maintainers for urgent matters
- Join community discussions

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

Thank you for contributing to VideoDQ! 🎥📚
