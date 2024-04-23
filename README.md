
# dnd-rxjs-ts
 
simple, low level and modular drag & drop library based on rxjs


**NOTE: lib in progress – things might change, also "ghost-image"-middleware currently not stable.**

[Examples](https://yff111.github.io/dnd-rxjs-ts)

# Features 

- plugin-architecture: write your own middleware 
- tree-shakeable: only use the middleware you need 
- platform-agnostic: only typescript and rxjs, no framework involved
- performant: large-list support due to event-throttling, event-delegation and rect-caching
- auto-scrolling

- custom ghost-image
- drag handle etc.

# Caveats

- no fancy sorting animations
- no touch-support (yet) due to native drag events
- rxjs dependency



for a more sophisticated solution consider: https://github.com/atlassian/pragmatic-drag-and-drop


# Links

https://gist.github.com/alexreardon/9ef479804a7519f713fe2274e076f1f3