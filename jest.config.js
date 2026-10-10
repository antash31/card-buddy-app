module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/src/features/tracking/**/*.test.[jt]s?(x)', '**/src/components/**/*.test.[jt]s?(x)', '**/src/features/wallet/**/*.test.[jt]s?(x)', '**/src/features/credit-health/**/*.test.[jt]s?(x)', '**/src/features/points-bank/**/*.test.[jt]s?(x)', '**/src/features/card-finder/**/*.test.[jt]s?(x)', '**/src/lib/**/*.test.[jt]s?(x)', '**/src/store/**/*.test.[jt]s?(x)', '**/src/api/**/*.test.[jt]s?(x)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
