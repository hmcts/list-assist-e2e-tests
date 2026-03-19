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

## User Guide: List Assist Endpoints in Postman

Follow these steps to test List Assist endpoints using Postman:

1. **Import the Postman Collection**
    - Download the `LA-Postman-Collection.zip` file by reaching out to a List Assist team member.
    - In Postman, click `Import`, select the downloaded zip file, and import the collection.

2. **Select the Environment**
    - In the top right of Postman, select the appropriate environment from the dropdown:
        - `HMI-SDS-STG` (refers to List Assist SIT and CFT AAT)
        - `HMI-SDS-TEST` (refers to List Assist TRG and CFT Demo)
    - Make sure the environment variables are loaded.

3. **Generate Auth Token**
    - In the collection, navigate to the `Auth` folder.
    - Select the `Get Hmi client credentials` request.
    - Click `Send`.
    - If the response status is `200`, your Auth token is generated and set for subsequent requests.
    - If you receive an error with `"error": "invalid_client"`, reach out to a List Assist team member or HMI team member for assistance.
    - **Note:** The client ID and client secret are stored in the Key Vault `hmi-sds-kv-stg-snl`.

4. **List Assist Endpoints**
    - With the Auth token in place, you can now use the other requests in the collection to interact with the List Assist endpoints.

   **a. Post Hearing Request**
    - In the `Hearings` folder, select the `Post request hearing` request (for `post-hearing/request-hearing`).
    - In the request body (payload), update the `caseListingRequestId` field to a unique value for each request.
    - Ensure the `caseVersionId` value is set to `1` for the initial request. For subsequent update requests, increment the `caseVersionId` above `1`.

   **b. Amend Hearing Request**
    - In the `Hearings` folder, select the `Put Update Hearing CFT -> SNL` request if the amend request is intended to be sent from CFT (integrated services) to List Assist.
    - The `caseListingRequestId` should be added in the URL as a path parameter (e.g., `/hmi/hearings/{caseListingRequestId}`).
    - Set the `caseVersionId` to a value greater than `1` (e.g., `2` or higher) to indicate this is an update to the original request.

   > **Note:** It is not mandatory, but if `caseIdHMCTS` is kept the same as `caseListingRequestId`, it will be more manageable and traceable in the List Assist UI for both POST and PUT requests.

   **c. Delete/Cancel Hearing**
    - In the `Hearings` folder, click `DEL Cancel Hearings`.
    - The `caseListingRequestId` should be added in the URL as a path parameter (e.g., `/hmi/hearings/{caseListingRequestId}`).

5. **Verify and Continue Testing in List Assist UI**
    - After sending the hearing request from Postman (step 4a), open the List Assist UI for the selected environment:
        - For `HMI-SDS-TEST`, use: https://trg.list-assist.service.justice.gov.uk/casehqtraining/vue/HomePage/init.action
        - For `HMI-SDS-STG`, use: https://sit.list-assist.service.justice.gov.uk/casehqtraining/vue/HomePage/init.action
    - Search for the case either by `caseIdHMCTS` (HMCTS Case Number:) or by `caseTitle` (Case Name:).
    - Once the case is located, carry on with subsequent testing as required.

