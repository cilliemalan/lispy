# lispy
lispy is a very tiny pretend-lisp interpreter.

```lisp
(define http (import "http"))
(define fs (import "fs"))

; define a new server
(define server
    ((-> http "createServer")
        (lambda (req res) 
            ((-> res "writeHead") 200 (object (["Content-Type" "text/html"])))
            ((-> res "end") ((-> fs "readFileSync") "index.html"))
        )))

; listen on port 4000
((-> server "listen") 4000)
(print "listening on port 4000")
```

I say pretend because whereas
lisp is all about lists, lispy is all about arrays. Maybe it should be called
asp? Anyway. The difference doesn't really matter in practice.

It's a tiny lisp interpreter with a basic parser and mostly javascript types.
It has an extremely small number of built-in functions and is missing a whole
bunch of proper lisp features such as bindings, proper lexical closures,
continuations.

## But why?
Lispy is an example in how to create a simple programming language.

## It's an interpreter
Not a compiler. It parses the source text into arrays, and then interprets
those arrays. A compiler would turn those arrays into machine code and
then execute that.

## Key components
- `reader.js` contains the parser (reader in scheme parlance). It takes in
  a string and spits out whatever it parses. Typically an array.
- `evaluate.js` contains the interpreter. It implements the `evaluate` function
  which runs lispy statements
- `prelude.js` contains the "standard library" of built-in lispy functions.
- `lispy.js` contains the lispy CLI. the arguments will be run as a program.
- `tests.js` contains lots of tests.

## Dependencies
It wouldn't be simple if there were any now would there? lispy only requires
the base node libraries.

# The lispy language
The lispy langauge is a lisp, so syntax has a buttload of brackets.
```lisp
(print "the answer is:" (+ 40 2))
```

## Syntax
Each bracketed expression contains a bunch of stuff seperated by spaces. The stuff
gets put into a ~list~ array. So parsing `(1 2 3)` will produce the javascript array
`[1, 2, 3]`. The stuff inside the brackets can be numbers, strings (like `"hello world"`),
symbols (i.e. in `(print 1 2 3)` the `print` is a symbol), and booleans. Booleans are
`#f` and `#t`.

## Langauge
So with that in mind, the different kinds of "things" in the lispy language are:
- numbers
- strings
- booleans
- arrays
- symbols
- functions
Of the above 6, the parser can only spit out the top 5. Each of the above corresponds
to its javascript equivalent, though symbols have radically different symmantics.

Lispy also implicitly supports javascript types, although it cannot ordinarily produce
some of them. Some functions in the prelude produce javascript objects (such as `import`) and
the `->` function can access properties. The `object` function can create objects by
calling `Object.fromEntries`.

### Numbers and Strings
These are exactly their javascript counterparts and behave the same. Numbers are not magic
like in Scheme.

### Booleans
same as JS except that in control flow absolutely everything except false is treated as true.
This means `(if 0 (print "it was true) (print "it was false))` will print `it was true`.

### Arrays
Arrays are javascript arrays and behave the same, except that the interpreter interprets an
array as a function invocation. So `(print 1 2 3)` will translate to calling a function called
`print` with the arguments `1`, `2`, and `3`.

### Symbols
Symbols are javascript symbols, and are produced by the parser. However, the interpreter will
*evaluate* symbols when encountered. Symbols are evaluated by calling the *environment function*
passed to the evaluate call.

### Functions
functions are javascript functions but have no concept of "this". Functions cannot be produced
by the parser. Functions are created by calling the lambda built-in function. Functions are invoked
with an *invocation expression* which is, as we've seen before, an array where the first item is
the function to be invoked.

#### Function syntax
```lisp
; a basic function
(lambda () (print "hello world"))

; defining a function and calling it
(define printhello (lambda () (print "hello world")))
(printhello)

; a function that takes an argument
(define printhello (lambda (name) (print (str "hello world" name))))
(printhello "mary")

; unlike scheme, functions support rest parameters by
; adding ... in front of arguments
(define printnums (lambda (...numbers) (print numbers)))
```

## Macros
lispy supports gheto macros like so:
```lisp
(define quote (macro (stuff) stuff))
```
`macro` works like lambda, but only supports one argument. That argument will
be passed the program structure instead of evaluating it. So if the quote
procedure above is called like so: `(quote 1 2 3)`, the body of macro will
be called with the argument stuff being `(1 2 3)`.

In regular scheme a macro is a function bound to a symbol as a transformer
(afaik). We don't have bindings at all so we make do by adding a (javascript) symbol as
a property on the function when it is designated as a macro. When the interpreter
encounteres a function to be invoked, it checks for that property and if it is there
it sends the arguments as a list to the function application. If it is not there
the arguments are evaluated one-by-one and passed to the function as arguments.

# Different from LISP or Scheme
A few gotchas.
- Arrays not lists: the main language structure is a list not an array.
- Javascript: it's really javascript underneath. Numbers are js numbers,
  arrays are js arrays, etc, etc.
- Objects don't exist but they do: javascript can produce objects and so
  lispy has them too.....we just pretend they only exist as an abstract concept.
- There is no null: `(array)` returns an empty array, not an empty "list" or `null`.
- `#f` is still the only false: If you somehow create a null by calling javascript, it
  will still evaluate to true in an `if`, `cond`, `and`, or `or` statement.
- There is an undefined: I'm pretty sure javascript has `undefined` because of its
  scheme roots. In the rare cases where an expresssion doesn't return (for example a one-
  legged if) it will return `undefined`. There is no way to test for it.
- No pairs: Lispy has no pairs. Though you can call `cons`, the second paramter must
  be some kind of array and will produce an array. The terminator is `[]`.