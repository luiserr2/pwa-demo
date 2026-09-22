/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          strictPropertyInitialization: false,
          module: 'commonjs',
          moduleResolution: 'node',
          target: 'ES2022',
        },
      },
    ],
  },
  verbose: true,
};
