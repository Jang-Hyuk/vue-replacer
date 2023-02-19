# Procedure Replacer

- typedoc.json

``` javascript
{
 "compilerOptions": {
  "target": "ESNext",
  "module": "ESNext",
  "esModuleInterop": true,
  "noImplicitAny": true,
  // workspace상에서 references 패키지에서 root packges 모듈을 찾지 못하는 문제 해결
  "moduleResolution": "node",
  "resolveJsonModule": true,
  "allowSyntheticDefaultImports": true,
  // class static private 변수를 사용하기 위함
  "allowJs": true,
  "checkJs": true,
  "useDefineForClassFields": true,
  "skipLibCheck": true,
  "sourceMap": true,
  "baseUrl": "out",
  "lib": ["dom", "esnext"]
 },
 "include": ["**/*.ts", "**/*.js"],
 "exclude": [
  "**/*/global.js",
  "**/*/prototype.js",
  "**/*/pulltorefresh_club.js",

  "**/*/*.min.js",

  "club5678_tong_new",
  "club5678_vc",
  "club5678_www",
  "nuxtExercise",
  "tongtong",
  "vue-converter",
  "club5678_admin",

  ".cache",
  ".git",
  ".idea",
  ".output",
  ".vscode",
  "build",
  "cron",
  "deploy",
  "dist",
  "docs",
  "local_history",
  "logs",
  "node_modules",
  "test"
 ],
 "typedocOptions": {
    "entryPoints": [
      "*.ts",
      "*.js",
    ],
    "out": "docs",
    "sort": ["source-order", "kind", "instance-first", "alphabetical"],
    "name": "API",
    "navigationLinks": {
      "Club5678": "https://m.club5678.com",
      "영상통통": "https://tong.club5678.com",
      "VC": "https://vc.club5678.com"
    },
    "plugin": ["typedoc-theme-hierarchy"],
      "theme": "hierarchy",
    "excludePrivate": true,
    "readme": "README.md",
 }
}

```
