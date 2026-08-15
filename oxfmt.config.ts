import { defineConfig } from "oxfmt"

export default defineConfig({
    printWidth: 80,
    tabWidth: 4,
    arrowParens: "avoid",
    endOfLine: "lf",
    bracketSameLine: true,
    bracketSpacing: true,
    quoteProps: "as-needed",
    semi: false,
    sortImports: true,
    sortPackageJson: true,
    ignorePatterns: [],
})
