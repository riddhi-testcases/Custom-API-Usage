#!/bin/bash

echo "Running Custom API Task Usage System Tests"
echo "=============================================="

echo ""
echo "Test Environment Setup..."
npm install

echo ""
echo "Unit Tests..."
npm run test:unit

echo ""
echo "Integration Tests..."
npm run test:integration

echo ""
echo "API Tests..."
npm run test:api

echo ""
echo "Full Test Coverage Report..."
npm run test:coverage

echo ""
echo "All tests completed!"
echo "Check coverage/index.html for detailed coverage report"
