# Contributing to Trenches Mobile

Thanks for your interest in contributing to the Trenches Mobile Item Shop.

## Getting Started

1. Fork the repo
2. Clone your fork
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and fill in your credentials
5. Build: `npx expo run:android`

## Development

- This is an Expo/React Native project targeting Android (Solana Seeker)
- Native modules require `npx expo run:android` (not `expo start`)
- JDK 17 is required for Android builds

## Pull Requests

- Keep PRs focused on a single change
- Test on an Android device or emulator before submitting
- Make sure `npx tsc --noEmit` passes with no type errors

## Reporting Issues

Open a GitHub issue with:
- Device/emulator info
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs from `adb logcat`

## Code Style

- TypeScript throughout
- Functional components with hooks
- Context pattern for shared state (see `contexts/`)
- Service wrappers in `lib/`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
