#!/bin/bash

if [[ "$VERCEL_GIT_COMMIT_REF" == "jupyterlite" ]] ; then
  echo "$VERCEL_GIT_COMMIT_SHA"
  echo "✅ - Build can proceed"
  exit 1;

else
  echo "🛑 - Build cancelled"
  exit 0;
fi
