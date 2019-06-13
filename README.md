# lispy
lispy is a very tiny pretend-lisp interpreter. I say pretend because whereas
lisp is all about lists, lispy is all about arrays. Maybe it should be called
asp? Anyway. The difference doesn't really matter in practice.

It's a tiny lisp interpreter with a basic parser and mostly javascript types.

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
to its javascript equivalent, though symbols have radically different symmantics, of course.

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

## Macros
I need to figure this out still...lispy as of yet has no concept of bindings, closure, or continuations
so macros are a bit out of reach...

# Different from LISP or Scheme
A few gotchas.
- Arrays not lists: the main language structure is a list not an array.
- Javascript: it's really javascript underneath. Numbers are js numbers,
  arrays are js arrays, etc, etc.
- Objects don't exist but they do: javascript can produce objects and so
  lispy has them too.....we just pretend they only exist as an abstract concept.
- There is no null: `(array)` returns an empty array, not an empty "list" or `null`.
- #f is still the only false: If you somehow create a null by calling javascript, it
  will still evaluate to true in an if, cond, and, or or statement.
- There is an undefined: I'm pretty sure javascript has a `undefined` because of it's
  scheme roots. In the rare cases where an expresssion doesn't return (for example a one-
  legged if) it will return `undefined`. There is no way to test for it.