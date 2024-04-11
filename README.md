
# dnd-rxjs-ts
 
simple low level drag & drop library based on rxjs


**NOTE: "auto-scroll"- and "ghost-image"-middleware currently not stable.**

# Features 

- plugin-architecture: write your own middleware 
- tree-shakeable: only use the middleware you need 
- platform-agnostic: only typescript and rxjs, no framework involved
- performant: large-list support due to event-throttling, event-delegation and rect-caching
- auto-scrolling
- custom drag-image
- custom ghost-image
- drag handle etc.

# Caveats

- no fancy sorting animations
- no touch-support (yet) due to native drag events
- rxjs dependency



for a more sophisticated solution consider: https://github.com/atlassian/pragmatic-drag-and-drop


# Links

https://gist.github.com/alexreardon/9ef479804a7519f713fe2274e076f1f3