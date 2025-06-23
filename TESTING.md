# Testing Documentation

## Overview

Comprehensive testing suite for the Custom API Task Usage System with unit, integration, and API tests achieving 70%+ code coverage.

## Testing Framework

- **Jest**: Primary testing framework
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for testing

## Test Structure

### Unit Tests (`tests/unit/`)

- **taskService.unit.test.js**: Tests business logic and data validation
- **Coverage**: Service methods, validation functions, error handling
- **Mocking**: Database operations mocked for isolated testing

### Integration Tests (`tests/integration/`)

- **database.integration.test.js**: Tests database interactions
- **Coverage**: CRUD operations, data persistence, constraints
- **Real Database**: Uses MongoDB Memory Server

### API Tests (`tests/api/`)

- **endpoints.api.test.js**: Tests HTTP endpoints
- **Coverage**: Request/response handling, status codes, error cases
- **Full Stack**: Tests complete request lifecycle

### Performance Tests (`tests/performance/`)

- **load.test.js**: Tests system performance under load
- **Coverage**: Concurrent requests, large datasets, memory usage

## Running Tests

### All Tests

```npm test
```

### Specific Test Types

```npm run test:unit # Unit tests only
npm run test:integration # Integration tests only
npm run test:api # API tests only
```

### Coverage Report

```npm run test:coverage
```

### Watch Mode

```npm run test:watch
```

## Test Coverage Goals

- **Minimum**: 70% coverage across all metrics
- **Target**: 80%+ coverage for critical paths
- **Metrics**: Lines, Functions, Branches, Statements

## Test Data

- **Mock Data**: Consistent test fixtures
- **Isolation**: Each test uses fresh database state
- **Cleanup**: Automatic cleanup after each test

## Continuous Integration

Tests run automatically on:

- Code commits
- Pull requests
- Deployment pipeline
