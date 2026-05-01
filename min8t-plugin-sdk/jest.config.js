/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2020',
          module: 'commonjs',
          lib: ['ES2020', 'DOM'],
          strict: false,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          moduleResolution: 'node',
          baseUrl: './src',
          noUnusedLocals: false,
          noUnusedParameters: false,
          noImplicitReturns: false,
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^shared/(.*)$': '<rootDir>/src/shared/$1',
  },
};
