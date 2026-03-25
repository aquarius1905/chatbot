/// <reference types="vite/client" />

// Vite が提供する型（`vite/client`）が解決できない環境でも、
// `import './App.css'` のような CSS の import を TypeScript が扱えるようにする。
declare module '*.css' {}
