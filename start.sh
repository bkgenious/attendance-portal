#!/bin/bash

# Failsafe: excessive listeners cleanup
# (In Codespaces, sometimes old processes hang if the container wasn't killed properly)
echo "Cleaning up ports 3000 and 3001..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true

echo "Starting Backend..."
cd backend && npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

echo "Starting Frontend..."
cd frontend && npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo "App running in background."
echo "View logs with: tail -f backend/backend.log frontend/frontend.log"

# Keep script alive to hold the trap
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait
