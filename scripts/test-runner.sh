#!/bin/bash

echo "Custom API Task Usage System - Test Runner"
echo "============================================="

# if server is running (optional)
echo ""
echo "Pre-test Setup..."

echo "Ensuring all dependencies are installed..."
npm install

echo ""
echo "Running Test Suite..."
echo ""

echo "Unit Tests..."
npm run test:unit
UNIT_EXIT_CODE=$?

echo ""
echo "Integration Tests..."
npm run test:integration
INTEGRATION_EXIT_CODE=$?

echo ""
echo "API Tests..."
npm run test:api
API_EXIT_CODE=$?

echo ""
echo "Coverage Report..."
npm run test:coverage
COVERAGE_EXIT_CODE=$?

echo ""
echo "Test Results Summary:"
echo "========================"

if [ $UNIT_EXIT_CODE -eq 0 ]; then
    echo "Unit Tests: PASSED"
else
    echo "Unit Tests: FAILED"
fi

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    echo "Integration Tests: PASSED"
else
    echo "Integration Tests: FAILED"
fi

if [ $API_EXIT_CODE -eq 0 ]; then
    echo "API Tests: PASSED"
else
    echo "API Tests: FAILED"
fi

if [ $COVERAGE_EXIT_CODE -eq 0 ]; then
    echo "Coverage Report: GENERATED"
else
    echo "Coverage Report: FAILED"
fi

if [ $UNIT_EXIT_CODE -eq 0 ] && [ $INTEGRATION_EXIT_CODE -eq 0 ] && [ $API_EXIT_CODE -eq 0 ]; then
    echo "ALL TESTS PASSED!"
    exit 0
else
    echo "Some tests failed. Check the output above."
    exit 1
fi
