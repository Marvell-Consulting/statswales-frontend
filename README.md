# StatsWales Frontend Service

> This service is currently in beta and under active development some features maybe incomplete, not working or missing.

## Requirements

- Node 20+
- An Instance of the StatsWales backend Service
- Docker or Podman (if you want to use Redis for sessions)

### Windows

- Git Bash

## Configuration

Copy the [.env-example](.env-example) file to `.env` and provide the missing values.

## Running the service

To start the app in development mode (connects to external services):

```bash
npm install
npm run dev
```

or, start the app in localstack mode (runs all required services in docker):

```bash
npm install
npm run localstack
```

The service should now be available on port 3000.

### Windows

On occasion the Redis Client times outs if this happens restart the frontend service and try again.
We are investigating this issue.

## Testing the service

There are a number of unit and functional tests under the `/tests` directory which are executed using jest with no
external dependencies. These can be run with the following command:

```bash
npm run test
```

There is also a suite of end-to-end tests under the `/tests-e2e` directory that are executed via the browser using
playwright. They will require an instance of both the frontend and the backend to be running as they interact with the
full stack.

### Start the backend

```bash
cd /path/to/backend
npm run dev
```

### In a separate terminal, start the frontend

```bash
cd /path/to/frontend
npm run dev
```

### Finally, run the tests in headless mode

```bash
cd /path/to/frontend
npm run test:e2e
```

### ...or start the playwright UI for interactive mode

```bash
cd /path/to/frontend
npm run test:e2e -- --ui
```

## Service healthcheck

There a several routes for checking service availability and container health. A successful healthcheck will return a
200 response with the following body:

```
{ message: 'success' }
```

An endpoint to report if the service has started up:

```
GET /heathcheck
```

An endpoint that reports if the service is ready to receive requests. It checks for a connection to the backend api, and
will respond with a 500 if the backend is unreachable or returns an error:

```
GET /healthcheck/ready
```

An endpoint that reports if the service is still in a healthy state. This is currently an alias for the
`/healthcheck/ready` route above.

```
GET /healthcheck/live
```
