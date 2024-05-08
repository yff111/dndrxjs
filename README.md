<div align="center"><img src="https://yff111.github.io/dndrxjs/logo.png" height="320px" width="320px" aria-label="dndrxjs logo"></div>

# dndrxjs

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
 

[Documentation](https://yff111.github.io/dndrxjs)


A simple, low level and modular drag & drop library that provides all Drag & Drop Events as a single [RxJS-Observable](https://rxjs.dev/guide/observable).

### Features 
- 🧩 **Plugin-architecture:** use the features you need 
- 🛠 **Extensible:** write your own middleware 
- 🌐 **Framework-agnostic:** only typescript and RxJS, no framework involved
- 📊 **Performant:** large-list support due to event-throttling, event-delegation and rect-caching
- 🖱️ **Auto-scrolling**
- 🍭 **Custom Drag Image**
- 🍓 **Custom Indicator**
- 🍰 **Custom Placeholder**
- 🫖 **Drag handle etc.**

### Quick overview

```ts
createDragDropObservable(
// add options to customize positioning rules, selectors, event-throttling etc.
)
.pipe(
// add middlewares for indicators, css-classes, auto-scrolling etc.
)
.subscribe((payload: DragDropPayload) => {
// handle relevant drag & drop-events (dragstart, dragover, dragend)
})

```

### Caveats

- no fancy stuff
- no touch-support due to native drag events 
- RxJS dependency

for a more sophisticated solution consider: https://github.com/atlassian/pragmatic-drag-and-drop



### Links

- https://rxjs.dev/
- https://gist.github.com/alexreardon/9ef479804a7519f713fe2274e076f1f3




## License

[MIT](https://github.com/yff111/dndrxjs/blob/main/LICENSE) License © 2023-PRESENT [Stephan Reich](https://github.com/yff111)


[npm-version-src]: https://img.shields.io/npm/v/dndrxjs?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/dndrxjs
[npm-downloads-src]: https://img.shields.io/npm/dm/dndrxjs?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/dndrxjs
[bundle-src]: https://img.shields.io/bundlephobia/minzip/dndrxjs?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=dndrxjs