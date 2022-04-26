#!/usr/bin/env bash

rm -rf dist
rm -rf types
pnpm run clean
npx hardhat compile
