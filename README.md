# Playwright Project Template


This repository contains the E2E tests used to validate and verify List Assist deployments.

## Project Structure

The repository follows a **Page Object Model (POM)** design pattern, ensuring that locators and actions are well-organized and reusable.

See the [POM docs](https://github.com/hmcts/tcoe-playwright-example/blob/master/docs/PAGE_OBECT_MODEL.md) for more info

```sh
├── tests/                  # Test files
├── page-objects/           # Page objects
├─── components/            # Common components shared across pages
├─── elements/              # Common elements that could be found in a page or in a component
├─── pages/                 # Unique pages that may contain their own locators
├── utils/                  # Utility functions or common tasks (e.g., login, API methods etc)
```

## Set up

### Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v14+)
- Yarn

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/playwright-template.git
cd playwright-template
yarn install
yarn playwright install --with-deps
```

### Key Vault Secrets

Secrets for this repo are stored in an Azure Key Vault. For local set up, you can use the [get_secrets.sh](scripts/get_secrets.sh) script to populate your .env file.

[Jenkinsfile_nightly](./Jenkinsfile_nightly) also uses this key vault, this file will need to be updated when new secrets are added/removed.

When adding a secret in the key vault ensure the secret is tagged with tag name: `e2e` and the tag value should be the env variable set in the [.env.example](./.env.example) file.

### Running Tests

Run all tests using the Playwright test runner:

```bash
yarn playwright test
```

To run a specific test file:

```bash
yarn playwright test tests/specific_test_file.spec.ts
```

To run tests on a specific browser:

```bash
yarn playwright test --project=chrome
yarn playwright test --project=firefox
yarn playwright test --project=webkit
```
