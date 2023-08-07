import type { Config } from "@jest/types"
const config: Config.InitialOptions = {
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
  },
}

module.exports = config
