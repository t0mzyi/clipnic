# Development & Deployment Guidelines

To ensure smooth deployments to Vercel and other CI/CD environments, please adhere to the following coding standards:

## 1. No Unused Variables
Vercel's build process (specifically `tsc`) is configured to fail if there are unused variables. 
- **Action**: Always remove unused state, imports, or function parameters.
- **Form Events**: If a function takes an event (e.g., `React.FormEvent`), ensure you use it (e.g., `e.preventDefault()`) or remove it if not needed.

## 2. Platform Consistency
- Hardcoded `localhost` references are strictly prohibited. Always use `import.meta.env.VITE_API_URL` for the frontend and environment variables for the backend.

## 3. Modal & UI Responsiveness
- Modals should use responsive padding (e.g., `p-5 sm:p-8`) to ensure they don't overflow on mobile devices.
- Use `rounded-3xl` for a consistent modern aesthetic across all platforms.

## 4. Join Flow & Social Linking
- When implementing social linking (Instagram/YouTube), ensure that "Link Another Account" states (`isLinkingNew`) are properly reset when closing modals to avoid UI loops.

## 5. Testing Tools
- The "Leave Campaign" button is a testing utility. Ensure it remains functional for internal validation but consider hiding it or gating it behind a dev-flag for production if necessary.
